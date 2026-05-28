<script setup>
import { onMounted, ref, onBeforeUnmount, shallowRef, computed, defineAsyncComponent } from 'vue';
import Navbar from '../Components/Navbar.vue';
import {
  statNum,
  formatMarketCapDisplay,
  formatLiquidityDisplay,
  formatAvgTokeDisplay,
  formatAvgWalletUsd,
  formatTokenAmount3
} from '../utils/statsApi';
import { subscribeLiveStats } from '../utils/liveStatsPoll';

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

/** Total supply in hero stat box: comma grouping + 3 fractional digits. */
const formatSupplyStat = (value) => {
  const formatted = formatTokenAmount3(value);
  return formatted === '—' ? null : formatted;
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
/** Redis-backed `liquidityChangePct24h` from `/api/toke-stats` only. */
const liquidityChangePct = ref(null);
/** Avg wallet USD (avg TOKE × live price) for telemetry row. */
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

const marketCapChangeFormatted = computed(() => {
  const p = marketCapChangePct.value;
  if (mcapChangeFromRedis.value && p != null && Number.isFinite(p)) {
    const rounded = Math.round(p * 100) / 100;
    if (rounded === 0) return '+0.00%';
    const prefix = rounded > 0 ? '+' : '';
    return `${prefix}${rounded.toFixed(2)}%`;
  }
  if (marketCapChangeIsWarming.value) return '—';
  return null;
});

const marketCapChangeClass = computed(() => {
  if (marketCapChangeIsWarming.value) return 'text-neutral-400';
  const p = marketCapChangePct.value;
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

const avgWalletUsdIsPending = computed(
  () =>
    hasLiveAvgTokeStat.value &&
    (avgWalletUsd.value == null || !Number.isFinite(avgWalletUsd.value) || avgWalletUsd.value <= 0)
);

const avgWalletUsdFormatted = computed(() => {
  const usd = avgWalletUsd.value;
  if (usd != null && Number.isFinite(usd) && usd > 0) {
    return formatAvgWalletUsd(usd);
  }
  if (avgWalletUsdIsPending.value) return '—';
  return null;
});

const avgWalletUsdMetricClass = computed(() =>
  avgWalletUsdIsPending.value ? 'text-neutral-400' : 'text-neutral-200/95'
);

function warmingTooltip(kind) {
  const meta = statsMeta.value;
  if (!meta) {
    if (kind === 'holder') return '24h holder change unavailable.';
    if (kind === 'liquidity') return '24h liquidity change unavailable.';
    if (kind === 'avgToke') return 'Avg wallet USD unavailable (needs live price).';
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

const avgWalletUsdTitle = computed(() =>
  avgWalletUsdIsPending.value ? warmingTooltip('avgToke') : 'Avg wallet holdings in USD (avg TOKE × price)'
);

/** Telemetry clock row — always the 24h window label (not on-chain refresh time). */
const holdersTimeLabel = computed(() => '24 hr');

const marketCapTimeLabel = computed(() => '24 hr');

const liquidityTimeLabel = computed(() => '24 hr');

const avgTokeTimeLabel = computed(() => '24 hr');

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
    const marketCap = statNum(payload?.marketCap);
    const liquidityUsd = statNum(payload?.liquidityUsd);

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
    } else if (lastKnownSupplyNumeric.value != null) {
      const fmt = formatSupplyStat(lastKnownSupplyNumeric.value);
      totalSupplyStat.value = fmt ?? lastKnownSupply.value;
      currentSupplyUi.value = lastKnownSupplyNumeric.value;
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
      const parsed = statNum(lastKnownAvgToke.value);
      const cachedFmt = formatAvgTokeDisplay(parsed);
      avgTokeStat.value = cachedFmt !== '—' ? cachedFmt : lastKnownAvgToke.value;
    } else {
      avgTokeStat.value = '—';
    }

    const avgTokeForUsd = statNum(payload?.avgTokeUi);
    let walletUsd = statNum(payload?.avgWalletUsd);
    if (!Number.isFinite(walletUsd) || walletUsd <= 0) {
      const px = statNum(payload?.price);
      if (Number.isFinite(avgTokeForUsd) && avgTokeForUsd > 0 && Number.isFinite(px) && px > 0) {
        walletUsd = Math.round(avgTokeForUsd * px * 1000) / 1000;
      }
    }
    if (Number.isFinite(walletUsd) && walletUsd > 0) {
      avgWalletUsd.value = walletUsd;
      lastKnownAvgWalletUsd.value = walletUsd;
    } else if (lastKnownAvgWalletUsd.value != null) {
      avgWalletUsd.value = lastKnownAvgWalletUsd.value;
    } else {
      avgWalletUsd.value = null;
    }
}

function applyHeroStatsError() {
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
      <!-- Hero: headline under navbar, stats pinned to lower hero (moon layout) -->
      <div class="relative flex min-h-screen min-h-[100dvh] flex-col md:min-h-[110vh]">
        <div
          class="hero-headline hero-headline--tight relative flex min-h-0 w-full flex-1 flex-col isolate"
        >
          <div
            class="container mx-auto flex min-h-0 flex-1 flex-col px-4 sm:px-6 pb-16 md:pb-20 hero-stats-pad"
          >
            <div class="flex shrink-0 flex-col items-center space-y-5 text-center md:space-y-6">
              <h1
                class="font-orbitron text-4xl font-semibold tracking-widest text-transparent bg-clip-text sm:text-6xl md:text-8xl
                       bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-100
                       [text-shadow:0_0_30px_rgba(255,255,255,0.2)]"
              >
                TOKE
              </h1>

              <div class="hero-tagline" aria-label="The Vault has been unlocked. A new Era begins.">
                <p class="hero-tagline__lead font-orbitron">The Vault has been unlocked.</p>
                <p class="hero-tagline__era font-exo">A new Era begins.</p>
              </div>
            </div>

            <div class="min-h-[clamp(1.25rem,5vmin,3.5rem)] w-full flex-1" aria-hidden="true" />

            <div class="mx-auto mt-auto w-full max-w-7xl min-w-0 shrink-0 pt-2">
              <div
                class="grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 xl:grid-cols-5"
              >
                <div class="hero-stat-card">
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
                      class="hero-stat-card__telemetry-scroll flex min-h-[2.375rem] w-full min-w-0 items-center justify-center overflow-x-auto xl:min-h-[2.5rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

                <div class="hero-stat-card">
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
                      class="hero-stat-card__telemetry-scroll flex min-h-[2.375rem] w-full min-w-0 items-center justify-center overflow-x-auto xl:min-h-[2.5rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

                <div class="hero-stat-card hero-stat-card--telemetry-busy">
                  <p
                    class="hero-stat-card__eyebrow font-orbitron text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-sm xl:text-xs"
                  >
                    Supply
                  </p>
                  <div class="hero-stat-card__figure">
                    <p
                      class="hero-stat-card__value font-orbitron tabular-nums text-center text-base font-medium leading-tight text-white sm:text-lg md:text-xl xl:text-[1.0625rem]"
                    >
                      {{ totalSupplyStat }}
                    </p>
                  </div>
                  <div class="hero-stat-card__telemetry px-3 py-1 sm:px-4 xl:px-5">
                    <div
                      class="hero-stat-card__telemetry-scroll flex min-h-[2.5rem] w-full min-w-0 items-center justify-center overflow-x-auto xl:min-h-[2.875rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

                <div class="hero-stat-card">
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
                      class="hero-stat-card__telemetry-scroll flex min-h-[2.375rem] w-full min-w-0 items-center justify-center overflow-x-auto xl:min-h-[2.5rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

                <div class="hero-stat-card hero-stat-card--telemetry-busy">
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
                  <div class="hero-stat-card__telemetry px-3 py-1 sm:px-4 xl:px-5">
                    <div
                      class="hero-stat-card__telemetry-scroll flex min-h-[2.5rem] w-full min-w-0 items-center justify-center overflow-x-auto xl:min-h-[2.875rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div
                        class="hero-stat-card__telemetry-row font-exo text-sm leading-snug tabular-nums text-neutral-200/95"
                      >
                        <span
                          v-if="avgWalletUsdFormatted != null"
                          class="hero-stat-card__metric shrink-0"
                          :class="avgWalletUsdMetricClass"
                          :title="avgWalletUsdTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">💰</span>
                          <span>{{ avgWalletUsdFormatted }}</span>
                        </span>
                        <span
                          v-if="avgWalletUsdFormatted != null"
                          class="hero-stat-card__sep"
                          aria-hidden="true"
                        />
                        <span
                          class="hero-stat-card__metric shrink-0 text-neutral-500"
                          :title="avgWalletUsdTitle"
                        >
                          <span class="hero-stat-card__metric-ico" aria-hidden="true">🕔</span>
                          <span>{{ avgTokeTimeLabel }}</span>
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

/* Hero tagline — orbitron lead, glow, hairline, italic coda */
.hero-tagline {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 28rem;
  text-align: center;
}

.hero-tagline__lead {
  margin: 0;
  font-size: clamp(0.9375rem, 2.1vw, 1.125rem);
  font-weight: 500;
  letter-spacing: 0.12em;
  line-height: 1.55;
  color: rgb(229 229 229 / 0.92);
  text-shadow:
    0 0 20px rgb(255 255 255 / 0.14),
    0 0 40px rgb(147 197 253 / 0.06);
}

.hero-tagline__lead::after {
  content: '';
  display: block;
  width: 2.75rem;
  height: 1px;
  margin: 0.85rem auto 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 0.22) 50%,
    transparent
  );
}

.hero-tagline__era {
  margin: 0.65rem 0 0;
  font-size: clamp(1.0625rem, 2.35vw, 1.3125rem);
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.05em;
  line-height: 1.45;
  color: rgb(163 163 163 / 0.88);
  text-shadow: 0 0 18px rgb(255 255 255 / 0.08);
}

@media (min-width: 768px) {
  .hero-tagline {
    max-width: 32rem;
  }

  .hero-tagline__lead {
    letter-spacing: 0.14em;
  }
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
}

@media (min-width: 768px) {
  .hero-headline {
    --hero-copy-rail: clamp(0.875rem, 3.2vmin, 2rem);
  }

  .hero-headline--tight {
    --hero-copy-rail: clamp(0.4rem, 1.6vmin, 1rem);
    --hero-headline-extra-copy-inset: clamp(0.85rem, 2.8vmin, 2rem);
  }
}

/* Bottom breathing room — moon layer + home indicator safe area */
.hero-stats-pad {
  padding-bottom: max(clamp(5rem, 20vmin, 11rem), env(safe-area-inset-bottom, 0px));
}

@media (min-width: 768px) {
  .hero-stats-pad {
    padding-bottom: max(clamp(6rem, 24vmin, 12rem), env(safe-area-inset-bottom, 0px));
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

@media (min-width: 1280px) {
  .hero-stat-card {
    min-height: 204px;
    gap: 0.4rem;
    padding: 0.85rem 0.82rem 0.8rem;
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
  padding: 0.32rem 0.55rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.11);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
}

@media (min-width: 1280px) {
  .hero-stat-card__telemetry {
    padding: 0.34rem 0.62rem;
  }
}

.hero-stat-card--telemetry-busy .hero-stat-card__telemetry-scroll {
  min-height: 2.5rem;
}

@media (min-width: 1280px) {
  .hero-stat-card--telemetry-busy .hero-stat-card__telemetry-scroll {
    min-height: 2.75rem;
  }
}

.hero-stat-card--telemetry-busy .hero-stat-card__telemetry-row {
  gap: 0.125rem;
}

.hero-stat-card--telemetry-busy .hero-stat-card__metric {
  gap: 0.28rem;
}

.hero-stat-card--telemetry-busy .hero-stat-card__sep {
  margin: 0 0.45rem;
}

@media (min-width: 1280px) {
  .hero-stat-card--telemetry-busy .hero-stat-card__sep {
    margin: 0 0.5rem;
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

.hero-stat-card--telemetry-busy .hero-stat-card__figure {
  padding-inline: 0.15rem;
}

@media (min-width: 1280px) {
  .hero-stat-card--telemetry-busy .hero-stat-card__figure {
    min-height: 3.35rem;
    padding-inline: 0.1rem;
  }
}

.hero-stat-card__metric {
  display: inline-flex;
  align-items: baseline;
  gap: 0.375rem;
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
  margin: 0 0.65rem;
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