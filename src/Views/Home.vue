<script setup>
import { onMounted, ref, onBeforeUnmount, shallowRef, computed, defineAsyncComponent } from 'vue';
import Navbar from '../Components/Navbar.vue';
import TokePriceSparkline from '../Components/Home/TokePriceSparkline.vue';
import TokenInfoBar from '../Components/Home/TokenInfoBar.vue';
import {
  statNum,
  formatMarketCapDisplay,
  formatLiquidityDisplay,
  formatAvgTokeDisplay,
  formatAvgWalletUsd
} from '../utils/statsApi';
import { subscribeLiveStats } from '../utils/liveStatsPoll';
import {
  applyTokePriceFromPayload,
  applyTokePriceOnError,
  tokePriceDisplay
} from '../utils/tokePriceDisplay';
const HeroMoonGlobe = defineAsyncComponent(() =>
  import('../Components/Home/HeroMoonGlobe.vue')
);
const TradeSpotlight = defineAsyncComponent(() =>
  import('../Components/Home/TradeSpotlight.vue')
);
const VrfdTweetFeed = defineAsyncComponent(() =>
  import('../Components/Home/VrfdTweetFeed.vue')
);
const McVoteEraTimeline = defineAsyncComponent(() =>
  import('../Components/Home/McVoteEraTimeline.vue')
);
const Footer = defineAsyncComponent(() =>
  import('../Components/Footer.vue')
);

let unsubscribeLiveStats = null;

/** Moon dim overlay: update opacity on the node directly (no Vue re-render per scroll frame). */
const moonShadeEl = shallowRef(null);
let moonShadeRaf = 0;

function flushMoonShadeOpacity() {
  moonShadeRaf = 0;
  const el = moonShadeEl.value;
  if (!el) return;
  const y = window.scrollY || document.documentElement.scrollTop;
  const fadeRange = Math.max(380, window.innerHeight * 0.5);
  const p = Math.min(1, Math.max(0, y / fadeRange));
  el.style.opacity = String(p * 0.48);
}

function scheduleMoonShadeOpacity() {
  if (moonShadeRaf) return;
  moonShadeRaf = requestAnimationFrame(flushMoonShadeOpacity);
}

/** Original minted supply (constant) — used for burned % and mint copy in the Supply stat. */
const ORIGINAL_TOKE_SUPPLY = 420_000_069;
/** Grouped integer for hero subline (🪙 …) — stays in sync with `ORIGINAL_TOKE_SUPPLY`. */
const ORIGINAL_MINT_GROUPED = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
}).format(ORIGINAL_TOKE_SUPPLY);

/** Total supply in hero stat box: grouping + exactly 3 fractional digits. */
const formatSupplyStat = (value) => {
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
};

/** Holder count: integers ≥ 0 (don’t treat API `null` as `Number(null)` → 0 incorrectly). */
const formatHolderStat = (value) => {
  if (!Number.isFinite(value) || value < 0) return null;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
};

const MS_DAY = 24 * 60 * 60 * 1000;

const LS_MCAP_LAST_USD = 'mctoken.hero.marketCapLastUsd';

/** Birdeye-aligned one-shot bootstrap only if no persisted live mcap yet (never written as LS mcap). */
const PHONY_LAST_KNOWN_MCAP_USD = 82356.51;
const LS_MCAP_PHONY_INJECTED = 'mctoken.hero.phonyMcapInjectedOnce';

/**
 * At most once before any live mcap is in LS: fills `lastKnownMcapNumeric` for first-paint
 * fallbacks. The phony value is never written to `LS_MCAP_LAST_USD`. After the
 * one-shot inject, `LS_MCAP_PHONY_INJECTED` stays set so the placeholder is never reused even if
 * `marketCapLastUsd` is cleared later.
 */
function tryInjectPhonyMcapBootstrapOnce(lastKnownMcapNumericRef, marketCapStatRef, lastKnownMcapRef) {
  if (typeof localStorage === 'undefined') return;
  if (readMcapNumericFromStorage() != null) return;
  if (localStorage.getItem(LS_MCAP_PHONY_INJECTED) === '1') return;
  try {
    localStorage.setItem(LS_MCAP_PHONY_INJECTED, '1');
  } catch {
    return;
  }
  lastKnownMcapNumericRef.value = PHONY_LAST_KNOWN_MCAP_USD;
  const fmt = formatMarketCapDisplay(PHONY_LAST_KNOWN_MCAP_USD);
  if (marketCapStatRef.value === '—') marketCapStatRef.value = fmt;
  if (lastKnownMcapRef.value == null) lastKnownMcapRef.value = fmt;
}

function readMcapNumericFromStorage() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_MCAP_LAST_USD);
    if (raw == null || raw === '') return null;
    const n = Number(String(raw).replace(/,/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function persistMcapUsd(n) {
  if (typeof localStorage === 'undefined') return;
  if (!Number.isFinite(n) || n <= 0) return;
  try {
    localStorage.setItem(LS_MCAP_LAST_USD, String(n));
  } catch {
    /* quota */
  }
}

const holdersStat = ref('—');
const totalSupplyStat = ref('—');
/** Numeric supply for burned % (computed); mirrors last known API value. */
const currentSupplyUi = ref(null);
/** From `/api/toke-stats` (`holderCountChange24h`); cached when falling back to `/api/toke-price`. */
const holdersChangeDelta = ref(null);
const lastKnownHolderDelta = ref(null);
/** Redis-backed mcap % only; Dex price % is not substituted on the hero card. */
const lastKnownMcapChangePct = ref(null);
const lastKnownLiquidityChangePct = ref(null);
const marketCapStat = ref('—');
const liquidityStat = ref('—');
const avgTokeStat = ref('—');
/** `/api/toke-stats` diagnostics; preserved across `/api/toke-price` fallback. */
const statsMeta = ref(null);
const lastKnownStatsMeta = ref(null);
const holderCountFetchedAt = ref(null);
const lastKnownHolderCountFetchedAt = ref(null);

const lastKnownSupply = ref(null);
const lastKnownSupplyNumeric = ref(null);
const lastKnownHolders = ref(null);
const lastKnownMcap = ref(null);
const lastKnownMcapNumeric = ref(readMcapNumericFromStorage());
const lastKnownLiquidity = ref(null);
const lastKnownAvgToke = ref(null);

/** Redis-backed `marketCapChangePct24h` from `/api/toke-stats` only. */
const marketCapChangePct = ref(null);
/** Live 24h price change % from DexScreener (`priceChangeH24`) — always available, no Redis needed. */
const priceChangePct = ref(null);
/** Redis-backed `liquidityChangePct24h` from `/api/toke-stats` only. */
const liquidityChangePct = ref(null);
/** USD value of avg wallet (supply ÷ holders × price) for 💰 telemetry row. */
const avgWalletUsd = ref(null);
const lastKnownAvgWalletUsd = ref(null);
/** Burned % string only (no emoji) — pairs with 🔥 in template for even emoji–value spacing. */
const supplyBurnedPctStr = computed(() => {
  const cur = currentSupplyUi.value;
  if (cur == null || !Number.isFinite(cur) || cur <= 0) return null;
  const burned = ORIGINAL_TOKE_SUPPLY - cur;
  if (burned <= 0) return '0%';
  const pct = (burned / ORIGINAL_TOKE_SUPPLY) * 100;
  if (pct < 0.01) return `${pct.toFixed(4)}%`;
  if (pct < 1) return `${pct.toFixed(2)}%`;
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(0)}%`;
});

/** Burn row text color (e.g. 0.07%). */
const supplyBurnedMetricClass = computed(() => {
  const cur = currentSupplyUi.value;
  if (cur == null || !Number.isFinite(cur) || cur <= 0) return 'text-neutral-400';
  return 'text-orange-400/90';
});

const hasLiveHoldersCount = computed(() => holdersStat.value !== '—');
const hasLiveMcapStat = computed(() => marketCapStat.value !== '—');
const hasLiveLiquidityStat = computed(() => liquidityStat.value !== '—');
const hasLiveAvgTokeStat = computed(() => avgTokeStat.value !== '—');

const holderChangeFromRedis = computed(
  () => statsMeta.value?.holderChange24hSource === 'redis'
);

const mcapChangeFromRedis = computed(
  () => statsMeta.value?.mcapChange24hSource === 'redis'
);

const liquidityChangeFromRedis = computed(
  () => statsMeta.value?.liquidityChange24hSource === 'redis'
);

const holdersChangeIsWarming = computed(
  () =>
    hasLiveHoldersCount.value &&
    !holderChangeFromRedis.value &&
    (holdersChangeDelta.value == null || !Number.isFinite(holdersChangeDelta.value))
);

const holdersChangeFormatted = computed(() => {
  const d = holdersChangeDelta.value;
  if (holderChangeFromRedis.value && d != null && Number.isFinite(d)) {
    if (d === 0) return '+0';
    if (d > 0) return `+${d}`;
    return String(d);
  }
  if (holdersChangeIsWarming.value) return '—';
  return null;
});

const holdersChangeClass = computed(() => {
  if (holdersChangeIsWarming.value) return 'text-neutral-400';
  const d = holdersChangeDelta.value;
  if (d == null || !Number.isFinite(d)) return 'text-neutral-400';
  if (d > 0) return 'text-green-400/90';
  if (d < 0) return 'text-red-400/90';
  return 'text-neutral-500';
});

const marketCapChangeIsWarming = computed(
  () =>
    hasLiveMcapStat.value &&
    !mcapChangeFromRedis.value &&
    (marketCapChangePct.value == null || !Number.isFinite(marketCapChangePct.value))
);

const fmtPct = (p) => {
  const rounded = Math.round(p * 100) / 100;
  if (rounded === 0) return '+0.00%';
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`;
};

/** Prefer the Redis 24h mcap delta; else fall back to live DexScreener 24h price change (mcap% ≈ price% at ~constant supply). */
const mcapPillPct = computed(() => {
  if (mcapChangeFromRedis.value && Number.isFinite(marketCapChangePct.value)) {
    return marketCapChangePct.value;
  }
  return Number.isFinite(priceChangePct.value) ? priceChangePct.value : null;
});

const marketCapChangeFormatted = computed(() => {
  const p = mcapPillPct.value;
  if (p != null && Number.isFinite(p)) return fmtPct(p);
  if (marketCapChangeIsWarming.value) return '—';
  return null;
});

const marketCapChangeClass = computed(() => {
  const p = mcapPillPct.value;
  if (p == null || !Number.isFinite(p)) return 'text-neutral-400';
  const rounded = Math.round(p * 100) / 100;
  if (rounded === 0) return 'text-neutral-500';
  if (rounded > 0) return 'text-green-400/90';
  return 'text-red-400/90';
});

const liquidityChangeIsWarming = computed(
  () =>
    hasLiveLiquidityStat.value &&
    !liquidityChangeFromRedis.value &&
    (liquidityChangePct.value == null || !Number.isFinite(liquidityChangePct.value))
);

const liquidityChangeFormatted = computed(() => {
  const p = liquidityChangePct.value;
  if (liquidityChangeFromRedis.value && p != null && Number.isFinite(p)) {
    const rounded = Math.round(p * 100) / 100;
    if (rounded === 0) return '+0.00%';
    const prefix = rounded > 0 ? '+' : '';
    return `${prefix}${rounded.toFixed(2)}%`;
  }
  if (liquidityChangeIsWarming.value) return '—';
  return null;
});

const liquidityChangeClass = computed(() => {
  if (liquidityChangeIsWarming.value) return 'text-neutral-400';
  const p = liquidityChangePct.value;
  if (p == null || !Number.isFinite(p)) return 'text-neutral-400';
  const rounded = Math.round(p * 100) / 100;
  if (rounded === 0) return 'text-neutral-500';
  if (rounded > 0) return 'text-green-400/90';
  return 'text-red-400/90';
});

const avgWalletUsdFormatted = computed(() => {
  const usd = avgWalletUsd.value;
  const fmt = formatAvgWalletUsd(usd);
  if (fmt) return fmt;
  if (hasLiveAvgTokeStat.value) return '—';
  return null;
});

const avgWalletUsdTitle = computed(
  () => 'USD value per wallet (supply ÷ holders × live price)'
);

function warmingTooltip(kind) {
  const meta = statsMeta.value;
  if (!meta) {
    if (kind === 'holder') return '24h holder change unavailable.';
    if (kind === 'liquidity') return '24h liquidity change unavailable.';
    if (kind === 'avgToke') return '24h avg wallet change unavailable.';
    return '24h market cap change unavailable.';
  }
  if (meta.redisConfigured === false) {
    return 'Snapshot database is not configured on the server. Add Redis env vars on Vercel and redeploy.';
  }
  const oldest =
    kind === 'holder'
      ? meta.holderOldestSnapshotAt
      : kind === 'liquidity'
        ? meta.liquidityOldestSnapshotAt
        : kind === 'avgToke'
          ? meta.avgTokeOldestSnapshotAt
          : meta.mcapOldestSnapshotAt;
  if (!oldest) {
    return 'Collecting history — first snapshot will appear after the next stats refresh.';
  }
  const oldestMs = Date.parse(oldest);
  if (!Number.isFinite(oldestMs)) {
    return 'Collecting 24h history — metric will appear after about 24 hours.';
  }
  const remainMs = MS_DAY - (Date.now() - oldestMs);
  if (remainMs > 0) {
    const hrs = Math.max(1, Math.ceil(remainMs / (60 * 60 * 1000)));
    return `Collecting 24h history — live in about ${hrs}h.`;
  }
  return 'Collecting 24h history — metric will appear on the next refresh.';
}

const holdersChangeTitle = computed(() =>
  holdersChangeIsWarming.value ? warmingTooltip('holder') : undefined
);

const marketCapChangeTitle = computed(() =>
  marketCapChangeIsWarming.value ? warmingTooltip('mcap') : undefined
);

const liquidityChangeTitle = computed(() =>
  liquidityChangeIsWarming.value ? warmingTooltip('liquidity') : undefined
);

/** Telemetry clock row — always the 24h window label (not on-chain refresh time). */
const holdersTimeLabel = computed(() => '24 hr');

const marketCapTimeLabel = computed(() => '24 hr');

const liquidityTimeLabel = computed(() => '24 hr');

const priceTimeLabel = computed(() => '24 hr');

const holdersTimeTitle = computed(() => {
  if (holderCountFetchedAt.value) {
    return `On-chain holder count as of ${holderCountFetchedAt.value}`;
  }
  if (statsMeta.value?.holderCountStale) {
    return 'Holder count refresh in progress';
  }
  return undefined;
});

function applyStatsMetaFromPayload(payload) {
  if (payload?.statsMeta && typeof payload.statsMeta === 'object') {
    statsMeta.value = payload.statsMeta;
    lastKnownStatsMeta.value = payload.statsMeta;
  } else if (lastKnownStatsMeta.value) {
    statsMeta.value = lastKnownStatsMeta.value;
  }

  const fetchedAt = payload?.holderCountFetchedAt ?? payload?.statsMeta?.holderCountFetchedAt;
  if (fetchedAt) {
    holderCountFetchedAt.value = fetchedAt;
    lastKnownHolderCountFetchedAt.value = fetchedAt;
  } else if (lastKnownHolderCountFetchedAt.value) {
    holderCountFetchedAt.value = lastKnownHolderCountFetchedAt.value;
  }
}

function applyHeroStatsPayload(payload, path) {
    try {
      applyTokePriceFromPayload(payload);
    } catch {
      applyTokePriceOnError();
    }

    const marketCap = statNum(payload?.marketCap);
    const liquidityUsd = statNum(payload?.liquidityUsd);

    const pchRaw = Number(payload?.priceChangeH24);
    priceChangePct.value = Number.isFinite(pchRaw) ? pchRaw : null;

    function resolveMarketCapPctLine() {
      if (!Object.prototype.hasOwnProperty.call(payload, 'marketCapChangePct24h')) {
        return lastKnownMcapChangePct.value;
      }
      const srv = payload.marketCapChangePct24h;
      if (srv != null && srv !== '' && Number.isFinite(Number(srv))) {
        const pct = Number(srv);
        lastKnownMcapChangePct.value = pct;
        return pct;
      }
      return null;
    }

    function resolveLiquidityPctLine() {
      if (!Object.prototype.hasOwnProperty.call(payload, 'liquidityChangePct24h')) {
        return lastKnownLiquidityChangePct.value;
      }
      const srv = payload.liquidityChangePct24h;
      if (srv != null && srv !== '' && Number.isFinite(Number(srv))) {
        const pct = Number(srv);
        lastKnownLiquidityChangePct.value = pct;
        return pct;
      }
      return null;
    }

    const freshMcap = formatMarketCapDisplay(marketCap);
    if (Number.isFinite(marketCap) && marketCap > 0) {
      marketCapStat.value = freshMcap;
      lastKnownMcap.value = freshMcap;
      lastKnownMcapNumeric.value = marketCap;
      persistMcapUsd(marketCap);
      marketCapChangePct.value = resolveMarketCapPctLine();
    } else if (lastKnownMcap.value) {
      marketCapStat.value = lastKnownMcap.value;
      marketCapChangePct.value = resolveMarketCapPctLine();
    } else {
      marketCapStat.value = '—';
      marketCapChangePct.value = null;
    }

    const freshLiquidity = formatLiquidityDisplay(liquidityUsd);
    if (Number.isFinite(liquidityUsd) && liquidityUsd > 0) {
      liquidityStat.value = freshLiquidity;
      lastKnownLiquidity.value = freshLiquidity;
      liquidityChangePct.value = resolveLiquidityPctLine();
    } else if (lastKnownLiquidity.value) {
      liquidityStat.value = lastKnownLiquidity.value;
      liquidityChangePct.value = resolveLiquidityPctLine();
    } else {
      liquidityStat.value = '—';
      liquidityChangePct.value = null;
    }

    if (path === '/api/toke-price') {
      if (lastKnownSupply.value) totalSupplyStat.value = lastKnownSupply.value;
      if (lastKnownSupplyNumeric.value != null) {
        currentSupplyUi.value = lastKnownSupplyNumeric.value;
      }
      if (lastKnownHolders.value) holdersStat.value = lastKnownHolders.value;
      holdersChangeDelta.value = lastKnownHolderDelta.value;
      marketCapChangePct.value = lastKnownMcapChangePct.value;
      if (lastKnownLiquidity.value) liquidityStat.value = lastKnownLiquidity.value;
      liquidityChangePct.value = lastKnownLiquidityChangePct.value;
      if (lastKnownAvgToke.value) avgTokeStat.value = lastKnownAvgToke.value;
      if (lastKnownAvgWalletUsd.value != null) avgWalletUsd.value = lastKnownAvgWalletUsd.value;
      if (lastKnownStatsMeta.value) statsMeta.value = lastKnownStatsMeta.value;
      if (lastKnownHolderCountFetchedAt.value) {
        holderCountFetchedAt.value = lastKnownHolderCountFetchedAt.value;
      }
      return;
    }

    applyStatsMetaFromPayload(payload);

    if (Object.prototype.hasOwnProperty.call(payload, 'holderCountChange24h')) {
      const v = payload.holderCountChange24h;
      if (v != null && v !== '') {
        const n = Number(v);
        holdersChangeDelta.value = Number.isFinite(n) ? Math.round(n) : null;
      } else {
        holdersChangeDelta.value = null;
      }
      lastKnownHolderDelta.value = holdersChangeDelta.value;
    } else {
      holdersChangeDelta.value = lastKnownHolderDelta.value;
    }

    const totalSupply = statNum(payload?.totalSupply);
    const supplyFmt = formatSupplyStat(totalSupply);
    if (supplyFmt) {
      totalSupplyStat.value = supplyFmt;
      lastKnownSupply.value = supplyFmt;
      currentSupplyUi.value = totalSupply;
      lastKnownSupplyNumeric.value = totalSupply;
    } else if (lastKnownSupply.value) {
      totalSupplyStat.value = lastKnownSupply.value;
      currentSupplyUi.value = lastKnownSupplyNumeric.value;
    } else {
      totalSupplyStat.value = '—';
      currentSupplyUi.value = null;
    }

    const rawHolders = payload?.holderCount;
    if (rawHolders != null && rawHolders !== '') {
      const n = statNum(rawHolders);
      const holderFmt = formatHolderStat(n);
      if (holderFmt != null) {
        holdersStat.value = holderFmt;
        lastKnownHolders.value = holderFmt;
      } else if (lastKnownHolders.value) {
        holdersStat.value = lastKnownHolders.value;
      } else {
        holdersStat.value = '—';
      }
    } else if (lastKnownHolders.value) {
      holdersStat.value = lastKnownHolders.value;
    } else {
      holdersStat.value = '—';
    }

    const avgToke = statNum(payload?.avgTokeUi);
    const avgFmt = formatAvgTokeDisplay(avgToke);
    if (avgFmt !== '—') {
      avgTokeStat.value = avgFmt;
      lastKnownAvgToke.value = avgFmt;
    } else if (lastKnownAvgToke.value) {
      avgTokeStat.value = lastKnownAvgToke.value;
    } else {
      avgTokeStat.value = '—';
    }

    const walletUsd = statNum(payload?.avgWalletUsd);
    const price = statNum(payload?.price);
    let resolvedWalletUsd = walletUsd;
    if (!Number.isFinite(resolvedWalletUsd) || resolvedWalletUsd <= 0) {
      if (Number.isFinite(avgToke) && avgToke > 0 && Number.isFinite(price) && price > 0) {
        resolvedWalletUsd = Math.round(avgToke * price * 100) / 100;
      }
    }
    if (Number.isFinite(resolvedWalletUsd) && resolvedWalletUsd > 0) {
      avgWalletUsd.value = resolvedWalletUsd;
      lastKnownAvgWalletUsd.value = resolvedWalletUsd;
    } else if (lastKnownAvgWalletUsd.value != null) {
      avgWalletUsd.value = lastKnownAvgWalletUsd.value;
    } else {
      avgWalletUsd.value = null;
    }
}

function applyHeroStatsError() {
  applyTokePriceOnError();
  if (lastKnownMcap.value) marketCapStat.value = lastKnownMcap.value;
  if (lastKnownLiquidity.value) liquidityStat.value = lastKnownLiquidity.value;
  if (lastKnownSupply.value) totalSupplyStat.value = lastKnownSupply.value;
  if (lastKnownSupplyNumeric.value != null) {
    currentSupplyUi.value = lastKnownSupplyNumeric.value;
  }
  if (lastKnownHolders.value) holdersStat.value = lastKnownHolders.value;
  holdersChangeDelta.value = lastKnownHolderDelta.value;
  marketCapChangePct.value = lastKnownMcapChangePct.value;
  liquidityChangePct.value = lastKnownLiquidityChangePct.value;
  if (lastKnownAvgToke.value) avgTokeStat.value = lastKnownAvgToke.value;
  if (lastKnownAvgWalletUsd.value != null) avgWalletUsd.value = lastKnownAvgWalletUsd.value;
  if (lastKnownStatsMeta.value) statsMeta.value = lastKnownStatsMeta.value;
  if (lastKnownHolderCountFetchedAt.value) {
    holderCountFetchedAt.value = lastKnownHolderCountFetchedAt.value;
  }
}

onMounted(() => {
  tryInjectPhonyMcapBootstrapOnce(lastKnownMcapNumeric, marketCapStat, lastKnownMcap);
  unsubscribeLiveStats = subscribeLiveStats(({ data, path, error }) => {
    tryInjectPhonyMcapBootstrapOnce(lastKnownMcapNumeric, marketCapStat, lastKnownMcap);
    if (error) {
      console.error('Error fetching hero stats:', error);
      applyHeroStatsError();
      return;
    }
    if (data) applyHeroStatsPayload(data, path);
  });
  flushMoonShadeOpacity();
  window.addEventListener('scroll', scheduleMoonShadeOpacity, { passive: true });
  window.addEventListener('resize', flushMoonShadeOpacity, { passive: true });
});

onBeforeUnmount(() => {
  if (unsubscribeLiveStats) {
    unsubscribeLiveStats();
    unsubscribeLiveStats = null;
  }
  window.removeEventListener('scroll', scheduleMoonShadeOpacity, { passive: true });
  window.removeEventListener('resize', flushMoonShadeOpacity, { passive: true });
  if (moonShadeRaf) cancelAnimationFrame(moonShadeRaf);
});
</script>

<template>
  <div class="overflow-fix">
    <Navbar />
    <!-- Fixed layers must NOT be descendants of overflow-x-hidden (CSS forces overflow-y:auto and clips the moon). -->
    <div class="fixed top-0 main-container">
        <div class="sub-container">
          <div class="sky">
            <div class="stars"></div>
            <div class="stars2"></div>
            <div class="stars3"></div>
            <div class="comet"></div>
          </div>
        </div>
      </div>

      <!-- Moon above dim overlay so the albedo reads; fixed sibling avoids .main-container overflow clip -->
      <div class="hero-moon-layer">
        <div class="hero-moon-wrap">
          <HeroMoonGlobe />
        </div>
        <div
          ref="moonShadeEl"
          class="hero-moon-scroll-shade"
          aria-hidden="true"
        />
      </div>

      <!-- Single page-wide star mute (matches deployed site) -->
      <div
        class="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-neutral-900/80 to-neutral-950/80"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
      </div>

    <div class="home-scroll-surface relative overflow-x-hidden">
      <div class="relative z-10">
      <!-- Hero: stat grid centered in landing (moon layout) -->
      <div class="relative flex min-h-screen min-h-[100dvh] flex-col md:min-h-[110vh]">
        <div
          class="hero-headline hero-headline--tight hero-headline--stats-only relative flex min-h-0 w-full flex-1 flex-col isolate"
        >
          <div
            class="container relative mx-auto flex min-h-0 flex-1 flex-col items-center justify-center px-4 sm:px-6 hero-stats-pad"
          >
            <div class="mx-auto w-full max-w-7xl min-w-0 shrink-0">
              <div
                class="hero-stats-grid grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5"
              >
                <div class="hero-token-bar-anchor">
                  <TokenInfoBar />
                </div>
                <div class="hero-feature-stat-anchor">
                  <div class="hero-feature-stat hero-stat-card">
                    <p
                      class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                    >
                      Price
                    </p>
                    <div class="hero-stat-card__figure hero-feature-stat__figure">
                      <p
                        class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                      >
                        {{ tokePriceDisplay }}
                      </p>
                    </div>
                    <div class="hero-feature-stat__chart-area" aria-hidden="true">
                      <div class="hero-feature-stat__chart-layer">
                        <div class="hero-feature-stat-chart-grid" />
                        <div class="hero-feature-stat-chart-glow" />
                        <TokePriceSparkline
                          :height="42"
                          variant="area"
                          presentation="hero"
                          aspect-fit="none"
                          :path-padding="3"
                          :y-inset="0.14"
                          :y-plot-fill="0.55"
                          root-class="hero-feature-stat-sparkline"
                        />
                      </div>
                    </div>
                    <div class="hero-stat-card__telemetry">
                      <div
                        class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        <div
                          class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                        >
                          <span
                            v-if="marketCapChangeFormatted != null"
                            class="hero-stat-card__metric shrink-0"
                            :class="marketCapChangeClass"
                            :title="marketCapChangeTitle"
                          >
                            <span class="hero-stat-card__metric-ico" aria-hidden="true">💵</span>
                            <span>{{ marketCapChangeFormatted }}</span>
                          </span>
                          <span
                            v-if="marketCapChangeFormatted != null"
                            class="hero-stat-card__sep"
                            aria-hidden="true"
                          />
                          <span
                            class="hero-stat-card__metric shrink-0 text-neutral-500"
                            :title="marketCapChangeTitle"
                          >
                            <span class="hero-stat-card__metric-ico" aria-hidden="true">🕔</span>
                            <span>{{ priceTimeLabel }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hero-stat-card hero-stat-card--grid-tr">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    Market Cap
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                    >
                      {{ marketCapStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry">
                    <div
                      class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span
                          v-if="marketCapChangeFormatted != null"
                          class="hero-stat-card__metric shrink-0"
                          :class="marketCapChangeClass"
                          :title="marketCapChangeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">📈</span>
                          <span>{{ marketCapChangeFormatted }}</span>
                        </span>
                        <span
                          v-if="marketCapChangeFormatted != null"
                          class="hero-stat-card__sep"
                          aria-hidden="true"
                        />
                        <span
                          class="hero-stat-card__metric shrink-0 text-neutral-500"
                          :title="marketCapChangeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🕔</span>
                          <span>{{ marketCapTimeLabel }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hero-stat-card hero-stat-card--grid-br">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    Liquidity
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                    >
                      {{ liquidityStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry">
                    <div
                      class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span
                          v-if="liquidityChangeFormatted != null"
                          class="hero-stat-card__metric shrink-0"
                          :class="liquidityChangeClass"
                          :title="liquidityChangeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">💧</span>
                          <span>{{ liquidityChangeFormatted }}</span>
                        </span>
                        <span
                          v-if="liquidityChangeFormatted != null"
                          class="hero-stat-card__sep"
                          aria-hidden="true"
                        />
                        <span
                          class="hero-stat-card__metric shrink-0 text-neutral-500"
                          :title="liquidityChangeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🕔</span>
                          <span>{{ liquidityTimeLabel }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hero-stat-card hero-stat-card--telemetry-busy hero-stat-card--grid-b1">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    Supply
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem] cursor-help"
                      title="Live on-chain supply, updated in real time. The TOKE Explorer shows the pipeline's reconciled supply as of its last refresh — small differences are timing only."
                    >
                      {{ totalSupplyStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry">
                    <div
                      class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span class="hero-stat-card__metric shrink-0 text-neutral-400">
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🪙</span>
                          <span>{{ ORIGINAL_MINT_GROUPED }}</span>
                        </span>
                        <span class="hero-stat-card__sep" aria-hidden="true" />
                        <span
                          v-if="supplyBurnedPctStr"
                          class="hero-stat-card__metric shrink-0"
                          :class="supplyBurnedMetricClass"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🔥</span>
                          <span>{{ supplyBurnedPctStr }}</span>
                        </span>
                        <span v-else class="hero-stat-card__metric shrink-0 text-neutral-400">—</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hero-stat-card hero-stat-card--grid-b2">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    Holders
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                    >
                      {{ holdersStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry">
                    <div
                      class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span
                          v-if="holdersChangeFormatted != null"
                          class="hero-stat-card__metric shrink-0"
                          :class="holdersChangeClass"
                          :title="holdersChangeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">👤</span>
                          <span>{{ holdersChangeFormatted }}</span>
                        </span>
                        <span
                          v-if="holdersChangeFormatted != null"
                          class="hero-stat-card__sep"
                          aria-hidden="true"
                        />
                        <span
                          class="hero-stat-card__metric shrink-0 text-neutral-500"
                          :title="holdersTimeTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🕔</span>
                          <span>{{ holdersTimeLabel }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hero-stat-card hero-stat-card--grid-b3 hero-stat-card--avg-wallet">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    AVG WALLET
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                    >
                      {{ avgTokeStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry">
                    <div
                      class="hero-stat-card__telemetry-scroll flex w-full min-w-0 items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row hero-stat-card__telemetry-row--centered font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span
                          v-if="avgWalletUsdFormatted != null"
                          class="hero-stat-card__metric shrink-0 text-neutral-200/95"
                          :title="avgWalletUsdTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">💰</span>
                          <span>{{ avgWalletUsdFormatted }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TradeSpotlight />

      <div
        class="relative container mx-auto max-w-7xl px-3.5 py-12 sm:px-6 sm:py-16 md:py-20"
      >
        <VrfdTweetFeed />
      </div>

      <McVoteEraTimeline />
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
$starFieldWidth: 3500;
$starFieldHeight: 3500;
$starStartOffset: 600px;

$starOneScrollDuration: 150s;
$starTwoScrollDuration: 175s;
$starThreeScrollDuration: 200s;
$numStarOneMobile: 160;
$numStarTwoMobile: 80;
$numStarThreeMobile: 36;
$numCometMobile: 2;
$numStarOneStars: 800;
$numStarTwoStars: 400;
$numStarThreeStars: 100;
$numComet: 5;

.main-container {
  overflow: hidden;
  position: fixed;
  inset: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  z-index: -1;
  pointer-events: none;
  isolation: isolate;
}

/* Hero headline: clear fixed navbar (~5.25rem + notch inset) + symmetric rail */
.hero-headline {
  --hero-copy-rail: clamp(0.75rem, 2.8vmin, 2rem);
  --hero-nav-offset: calc(5.25rem + env(safe-area-inset-top, 0px));
  padding-top: calc(
    var(--hero-nav-offset) + var(--hero-copy-rail) + var(--hero-headline-extra-copy-inset, 0px)
  );
  padding-bottom: var(--hero-copy-rail);
}

.hero-headline--tight {
  --hero-copy-rail: clamp(0.35rem, 1.2vmin, 1rem);
  --hero-headline-extra-copy-inset: clamp(0.65rem, 2.4vmin, 1.75rem);
  --hero-stat-gap: 0.75rem;
  --hero-stat-min-h: 172px;
  --hero-stat-cols: 2;
}

/* Stats-only landing: no title block; grid centered in viewport */
.hero-headline--stats-only {
  --hero-headline-extra-copy-inset: 0px;
  padding-top: var(--hero-nav-offset);
  padding-bottom: var(--hero-nav-offset);
}

@media (min-width: 640px) {
  .hero-headline--tight {
    --hero-stat-gap: 1rem;
    --hero-stat-min-h: 184px;
  }
}

@media (min-width: 768px) {
  .hero-headline--tight {
    --hero-stat-gap: 1.25rem;
  }
}

@media (min-width: 1280px) {
  .hero-headline--tight {
    --hero-stat-min-h: 196px;
    --hero-stat-cols: 3;
  }
}

@media (min-width: 768px) {
  .hero-headline {
    --hero-copy-rail: clamp(0.875rem, 3.2vmin, 2rem);
  }

  .hero-headline--tight:not(.hero-headline--stats-only) {
    --hero-copy-rail: clamp(0.4rem, 1.6vmin, 1rem);
    --hero-headline-extra-copy-inset: clamp(0.85rem, 2.8vmin, 2rem);
  }
}

/* Bottom breathing room — moon layer + home indicator safe area */
.hero-stats-pad {
  padding-bottom: max(clamp(5rem, 20vmin, 11rem), env(safe-area-inset-bottom, 0px));
}

.hero-headline--stats-only .hero-stats-pad {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), clamp(1.5rem, 4vmin, 3rem));
}

@media (min-width: 768px) {
  .hero-stats-pad {
    padding-bottom: max(clamp(6rem, 24vmin, 12rem), env(safe-area-inset-bottom, 0px));
  }

  .hero-headline--stats-only .hero-stats-pad {
    padding-bottom: max(env(safe-area-inset-bottom, 0px), clamp(2rem, 5vmin, 3.5rem));
  }
}

/* Featured Price tile — visible all breakpoints; flag layout on xl+ */
.hero-feature-stat-anchor {
  display: block;
  grid-column: 1 / -1;
  min-width: 0;
  z-index: 1;
}

.hero-feature-stat.hero-stat-card {
  position: relative;
  display: grid;
  width: 100%;
  min-height: max(220px, calc(var(--hero-stat-min-h) + 2.5rem));
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto 1fr auto;
  gap: 0;
  margin: 0;
  --hero-feature-pad-b: 0.78rem;
  padding: 0.82rem 0.8rem var(--hero-feature-pad-b);
  overflow: hidden;
  --hero-feature-chart-inset-x: 0.45rem;
  --hero-feature-sparkline-pad-x: 0.2rem;
  --hero-feature-eyebrow-lh: calc(0.75rem * 1.15);
  --hero-feature-header-h: var(--hero-feature-eyebrow-lh);
  --hero-feature-stat-flex-gap: 0.4rem;
  --hero-feature-value-font: 1.0625rem;
  --hero-feature-value-lh: 1.25;
  --hero-feature-value-mt: calc(
    (
      var(--hero-stat-min-h) - 1.6rem - 1.15em - var(--hero-feature-stat-flex-gap) - 2.625rem - 0.68rem -
        var(--hero-feature-value-font)
    ) / 2
  );
}

.hero-feature-stat.hero-stat-card::after {
  opacity: 0.32;
  mask-image: radial-gradient(ellipse 95% 85% at 50% 62%, #000 25%, transparent 82%);
}

.hero-feature-stat .hero-stat-card__eyebrow,
.hero-feature-stat .hero-stat-card__figure,
.hero-feature-stat__chart-area,
.hero-feature-stat .hero-stat-card__telemetry {
  grid-column: 1;
  justify-self: stretch;
  width: 100%;
  max-width: 100%;
}

.hero-feature-stat .hero-stat-card__eyebrow {
  grid-row: 1;
  position: relative;
  z-index: 3;
  margin: 0;
  line-height: var(--hero-feature-eyebrow-lh);
  pointer-events: none;
}

.hero-feature-stat .hero-stat-card__figure {
  grid-row: 2;
  flex: 0 0 auto;
  min-height: 0;
  justify-content: center;
  align-items: center;
}

.hero-feature-stat .hero-stat-card__value {
  width: 100%;
  text-align: center;
}

.hero-feature-stat__chart-area {
  grid-row: 2 / 4;
  position: relative;
  z-index: 0;
  min-height: 0;
  min-width: 0;
  pointer-events: none;
}

.hero-feature-stat__chart-layer {
  position: absolute;
  top: 0;
  right: var(--hero-feature-chart-inset-x);
  bottom: 0;
  left: var(--hero-feature-chart-inset-x);
  z-index: 0;
  display: flex;
  overflow: hidden;
  border-radius: 0 0 1.25rem 1.25rem;
  pointer-events: none;
}

.hero-feature-stat .hero-stat-card__eyebrow,
.hero-feature-stat__figure,
.hero-feature-stat .hero-stat-card__telemetry {
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.hero-feature-stat .hero-stat-card__telemetry {
  grid-row: 4;
}

.hero-feature-stat .hero-stat-card__value {
  text-shadow:
    0 0 18px rgba(3, 7, 18, 0.96),
    0 1px 3px rgba(0, 0, 0, 0.92),
    0 0 24px rgba(255, 255, 255, 0.1);
}

.hero-feature-stat-chart-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.38;
  background-image: linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: radial-gradient(ellipse 100% 92% at 50% 58%, #000 12%, transparent 88%);
}

.hero-feature-stat-chart-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse 95% 75% at 50% 92%,
    rgba(167, 139, 250, 0.26) 0%,
    rgba(52, 211, 153, 0.1) 42%,
    transparent 68%
  );
}

.hero-feature-stat-sparkline {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  align-items: stretch;
  justify-content: stretch;
  padding: 0.05rem 0.2rem 0.3rem;
}

.hero-feature-stat__chart-layer :deep(.toke-sparkline) {
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
}

.hero-feature-stat__chart-layer :deep(.toke-sparkline svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.hero-feature-stat__chart-layer :deep(.toke-sparkline__placeholder) {
  min-height: 5rem;
  font-size: 0.875rem;
}

/* Token identity bar — full-width header above stat grid */
.hero-token-bar-anchor {
  grid-column: 1 / -1;
  min-width: 0;
}

.hero-token-bar-anchor :deep(.hero-token-bar.hero-stat-card) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  min-height: calc(var(--hero-stat-min-h) / 2);
  max-height: calc(var(--hero-stat-min-h) / 2);
  padding-block: 0;
  padding-inline: 0.8rem;
}

@media (min-width: 640px) {
  .hero-token-bar-anchor :deep(.hero-token-bar.hero-stat-card) {
    padding-inline: 0.95rem;
  }
}

@media (min-width: 1280px) {
  .hero-token-bar-anchor :deep(.hero-token-bar.hero-stat-card) {
    padding-inline: 0.8rem;
  }
}

@media (max-width: 639px) {
  .hero-token-bar-anchor :deep(.hero-token-bar.hero-stat-card) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-height: none;
    min-height: auto;
    padding-block: 0.7rem;
  }
}

@media (min-width: 1280px) {
  .hero-stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto repeat(3, minmax(var(--hero-stat-min-h), auto));
  }

  .hero-token-bar-anchor {
    grid-row: 1;
  }

  .hero-feature-stat-anchor {
    grid-column: 1 / 3;
    grid-row: 2 / 4;
  }

  .hero-stat-card--grid-tr {
    grid-column: 3;
    grid-row: 2;
  }

  .hero-stat-card--grid-br {
    grid-column: 3;
    grid-row: 3;
  }

  .hero-stat-card--grid-b1 {
    grid-column: 1;
    grid-row: 4;
  }

  .hero-stat-card--grid-b2 {
    grid-column: 2;
    grid-row: 4;
  }

  .hero-stat-card--grid-b3 {
    grid-column: 3;
    grid-row: 4;
  }

  .hero-feature-stat.hero-stat-card {
    min-height: calc(2 * var(--hero-stat-min-h) + var(--hero-stat-gap));
    height: calc(2 * var(--hero-stat-min-h) + var(--hero-stat-gap));
  }
}

/* Hero stat HUD — glass tile, cyan/violet rim, telemetry inset (matches trade spotlight vibe) */
.hero-stat-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 172px;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.8rem 0.7rem;
  border-radius: 1.5rem;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(
    160deg,
    rgba(12, 18, 32, 0.78) 0%,
    rgba(6, 10, 22, 0.9) 45%,
    rgba(3, 7, 18, 0.96) 100%
  );
  border: 1px solid rgba(56, 189, 248, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 -1px 0 rgba(0, 0, 0, 0.38),
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 10px 36px -18px rgba(56, 189, 248, 0.22),
    0 28px 64px -32px rgba(139, 92, 246, 0.14);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

@media (min-width: 640px) {
  .hero-stat-card {
    min-height: 184px;
    gap: 0.4rem;
    padding: 0.9rem 0.95rem 0.8rem;
    border-radius: 1.625rem;
  }
}

@media (min-width: 1024px) {
  .hero-stat-card {
    min-height: 188px;
  }
}

@media (min-width: 1280px) {
  .hero-stat-card {
    min-height: 196px;
    gap: 0.4rem;
    padding: 0.82rem 0.8rem 0.78rem;
    border-radius: 1.5rem;
  }
}

.hero-stat-card::before {
  content: '';
  position: absolute;
  left: 7%;
  right: 7%;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(103, 232, 249, 0.4) 22%,
    rgba(167, 139, 250, 0.45) 50%,
    rgba(56, 189, 248, 0.38) 78%,
    transparent
  );
  pointer-events: none;
  z-index: 0;
}

.hero-stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
  background-size: 13px 13px;
  opacity: 0.5;
  mask-image: radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0, 0, 0, 0.65), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-stat-card__eyebrow {
  position: relative;
  z-index: 1;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.06);
}

@media (min-width: 640px) {
  .hero-stat-card__eyebrow {
    line-height: 1.15;
  }
}

.hero-stat-card__figure {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: 0.35rem 0.25rem 0.4rem;
}

@media (min-width: 1280px) {
  .hero-stat-card__figure {
    min-height: 3.1rem;
    padding: 0.3rem 0.2rem 0.35rem;
  }

  /* Match eyebrow→value spacing of single-row stat tiles; title stays put, value shifts up. */
  .hero-feature-stat .hero-stat-card__figure {
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;
    justify-content: center;
    align-items: flex-start;
  }

  /*
   * Eyebrow→value gap matches Market Cap tile; only this margin moves the price up.
   */
  .hero-feature-stat .hero-stat-card__value {
    --hero-stat-eyebrow-lh: calc(0.75rem * 1.15);
    --hero-stat-value-lh: calc(1.0625rem * 1.25);
    --hero-stat-eyebrow-to-value-gap: calc(
      0.4rem + 0.3rem +
        (
          var(--hero-stat-min-h) - 1.6rem - var(--hero-stat-eyebrow-lh) - 0.8rem - 0.68rem - 2.625rem -
            0.65rem - var(--hero-stat-value-lh)
        ) / 2
    );
    margin-top: calc(
      var(--hero-stat-eyebrow-to-value-gap) - (var(--hero-feature-header-h) - var(--hero-feature-eyebrow-lh)) -
        var(--hero-feature-stat-flex-gap)
    );
  }
}

.hero-stat-card__value {
  width: 100%;
  max-width: 100%;
  overflow-wrap: anywhere;
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.08);
}

.hero-stat-card__telemetry {
  position: relative;
  z-index: 1;
  margin-top: auto;
  border-radius: 9999px;
  padding: 0.28rem 0.5rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.11);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
}

.hero-feature-stat.hero-stat-card .hero-stat-card__telemetry {
  margin-top: var(--hero-feature-pad-b);
}

@media (min-width: 640px) {
  .hero-stat-card__telemetry {
    padding: 0.3rem 0.55rem;
  }
}

@media (min-width: 1024px) {
  .hero-stat-card__telemetry {
    padding: 0.32rem 0.5rem;
  }
}

@media (min-width: 1280px) {
  .hero-stat-card__telemetry {
    padding: 0.34rem 0.58rem;
  }
}

.hero-stat-card__telemetry-scroll {
  min-height: 2.5rem;
}

@media (min-width: 1280px) {
  .hero-stat-card__telemetry-scroll {
    min-height: 2.625rem;
  }
}

.hero-stat-card__telemetry-row {
  display: inline-flex;
  min-width: min-content;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding-inline: 0.125rem;
}

@media (min-width: 1024px) {
  .hero-stat-card__telemetry-row {
    font-size: 0.8125rem;
    line-height: 1.35;
  }
}

.hero-stat-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-stat-card--avg-wallet .hero-stat-card__telemetry-row--centered {
  width: 100%;
  justify-content: center;
}

.hero-stat-card__metric-ico {
  flex-shrink: 0;
  display: inline-block;
  line-height: 1;
}

.hero-stat-card__sep {
  display: inline-block;
  flex-shrink: 0;
  width: 1px;
  height: 0.875rem;
  margin: 0 0.5rem;
  align-self: center;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(148, 163, 184, 0.28) 20%,
    rgba(103, 232, 249, 0.35) 50%,
    rgba(148, 163, 184, 0.28) 80%,
    transparent
  );
}

/* Supply (and similar wide telemetry rows) — extra pill room at 5-across widths */
.hero-stat-card--telemetry-busy .hero-stat-card__telemetry {
  padding: 0.3rem 0.6rem;
}

@media (min-width: 1024px) {
  .hero-stat-card--telemetry-busy .hero-stat-card__telemetry {
    padding: 0.34rem 0.72rem;
  }

  .hero-stat-card--telemetry-busy .hero-stat-card__telemetry-scroll {
    min-height: 2.75rem;
  }

  .hero-stat-card--telemetry-busy .hero-stat-card__sep {
    margin: 0 0.625rem;
  }
}

@media (min-width: 1280px) {
  .hero-stat-card--telemetry-busy .hero-stat-card__telemetry {
    padding: 0.36rem 0.85rem;
  }

  .hero-stat-card--telemetry-busy .hero-stat-card__telemetry-row {
    font-size: 0.75rem;
    letter-spacing: 0.01em;
  }

  .hero-stat-card--telemetry-busy .hero-stat-card__metric {
    gap: 0.35rem;
  }

  .hero-stat-card--telemetry-busy .hero-stat-card__sep {
    margin: 0 0.7rem;
    height: 0.8125rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-stat-card__eyebrow {
    text-shadow: none;
  }

  .hero-stat-card__value {
    text-shadow: none;
  }
}

.home-scroll-surface {
  position: relative;
  z-index: 2; /* above .hero-moon-layer (1), below Navbar/Footer (50) */
}

.hero-moon-layer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 100vw;
  transform: translateX(-50%);
  min-height: 100dvh;
  /* Full viewport: lets us pin moon top to 50dvh; pointer-events none so hero stays clickable */
  /* Above page dim overlay (z-0); below hero copy (z-10) — not inside overflow:hidden .main-container */
  z-index: 1;
  pointer-events: none;
  overflow: visible;
}

.hero-moon-wrap {
  position: absolute;
  top: 50dvh;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: visible;
}

.hero-moon-scroll-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  will-change: opacity;
  background: linear-gradient(
    to bottom,
    rgba(2, 6, 23, 0) 0%,
    rgba(2, 6, 23, 0.08) 42%,
    rgba(0, 0, 0, 0.38) 76%,
    rgba(0, 0, 0, 0.72) 100%
  );
}

.sub-container {
  position: absolute;
  inset: 0;
}

@function create-stars($n) {
  $stars: "#{random($starFieldWidth)}px #{random($starFieldHeight)}px #FFF";

  @for $i from 2 through $n {
    $stars: "#{$stars} , #{random($starFieldWidth)}px #{random($starFieldHeight)}px #FFF";
  }

  @return unquote($stars);
}

@mixin star-template($numStars, $starSize, $scrollSpeed) {
  z-index: 10;
  width: $starSize;
  height: $starSize;
  border-radius: 50%;
  background: transparent;
  box-shadow: create-stars($numStars);
  animation: animStar $scrollSpeed linear infinite;

  &:after {
    content: " ";
    top: -$starStartOffset;
    width: $starSize;
    height: $starSize;
    border-radius: 50%;
    position: absolute;
    background: transparent;
    box-shadow: create-stars($numStars);
  }
}

@mixin shooting-star-template($numStars, $starSize, $speed) {
  z-index: 10;
  width: $starSize;
  height: $starSize + 80px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(to top,
      rgba(52, 202, 244, 0),
      rgb(12, 178, 255));
  animation: animShootingStar $speed linear infinite;
}

.stars {
  @include star-template($numStarOneMobile, 1px, $starOneScrollDuration);
  will-change: transform;
}

@media (min-width: 768px) {
  .stars {
    @include star-template($numStarOneStars, 1px, $starOneScrollDuration);
  }
}

.stars2 {
  @include star-template($numStarTwoMobile, 2px, $starTwoScrollDuration);
  will-change: transform;
}

@media (min-width: 768px) {
  .stars2 {
    @include star-template($numStarTwoStars, 2px, $starTwoScrollDuration);
  }
}

.stars3 {
  @include star-template($numStarThreeMobile, 3px, $starThreeScrollDuration);
  will-change: transform;
}

@media (min-width: 768px) {
  .stars3 {
    @include star-template($numStarThreeStars, 3px, $starThreeScrollDuration);
  }
}

.comet {
  @include shooting-star-template($numCometMobile, 5px, 10s);
  will-change: transform;
}

@media (min-width: 768px) {
  .comet {
    @include shooting-star-template($numComet, 5px, 10s);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stars,
  .stars2,
  .stars3,
  .comet {
    animation: none !important;
  }
}

@keyframes animStar {
  from {
    transform: translateY(0px);
  }

  to {
    transform: translateY(-#{$starFieldHeight}px) translateX(-#{$starFieldWidth}px);
  }
}

@keyframes animShootingStar {
  from {
    transform: translateY(0px) translateX(0px) rotate(-45deg);
    opacity: 1;
    height: 5px;
  }

  to {
    transform: translateY(-#{$starFieldHeight}px) translateX(-#{$starFieldWidth}px) rotate(-45deg);
    opacity: 1;
    height: 800px;
  }
}

.backdrop-blur-md {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.container {
  position: relative;
}
</style>