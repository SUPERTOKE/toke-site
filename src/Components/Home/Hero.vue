<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import moonman from '../../assets/moonman-head.png';
import moonmanHero from '../../assets/moonman-hero.jpg';
import { subscribeLiveStats } from '../../utils/liveStatsPoll';
import { statNum, formatTokePriceDisplay, formatMarketCapDisplay } from '../../utils/statsApi';
import { openBuyToke, preloadBuyToke } from '../../lib/buyToke';

const MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';
const MAX_SUPPLY = 420000069;

const EXPLORER_URL = 'https://explorer.mctoken.xyz';
const BUY_URL = `https://jup.ag/tokens/${MINT}`;
const X_URL = 'https://x.com/TokeCommunity';

const priceStr = ref('—');
const mcapStr = ref('—');
const holdersStr = ref('—');
const supplyInt = ref('419,697,547');
const supplyFrac = ref('674');
const changeStr = ref(null);
const changeUp = ref(true);
const copied = ref(false);
const starsRef = ref([]);

const fmtInt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

function apply(data) {
  if (!data) return;
  const price = statNum(data.price);
  if (Number.isFinite(price) && price > 0) priceStr.value = formatTokePriceDisplay(price);

  const mcap = statNum(data.marketCap);
  if (Number.isFinite(mcap) && mcap > 0) mcapStr.value = formatMarketCapDisplay(mcap);

  const holders = statNum(data.holderCount ?? data.holders);
  if (Number.isFinite(holders) && holders > 0) holdersStr.value = fmtInt(holders);

  const supply = statNum(data.totalSupply ?? data.totalSupplyUi ?? data.supply);
  if (Number.isFinite(supply) && supply > 0) {
    const [i, f = '000'] = supply.toFixed(3).split('.');
    supplyInt.value = fmtInt(Number(i));
    supplyFrac.value = f;
  }

  const chg = statNum(data.priceChangeH24 ?? data.priceChangePct24h ?? data.priceChange);
  if (Number.isFinite(chg)) {
    changeUp.value = chg >= 0;
    changeStr.value = `${chg >= 0 ? '+' : ''}${chg.toFixed(1)}% · 24h`;
  }
}

function copyMint() {
  try {
    navigator.clipboard?.writeText(MINT);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1100);
  } catch {
    /* clipboard unavailable */
  }
}

let unsub = null;
onMounted(() => {
  starsRef.value = Array.from({ length: 64 }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: (Math.random() * 0.5 + 0.15).toFixed(2),
    scale: (Math.random() * 1.3 + 0.5).toFixed(2),
  }));
  preloadBuyToke();
  unsub = subscribeLiveStats(({ data, error }) => {
    if (error) return;
    apply(data);
  });
});
onBeforeUnmount(() => {
  if (unsub) unsub();
  unsub = null;
});
</script>

<template>
  <header class="mc-hero mc-grain">
    <div class="mc-stars" aria-hidden="true">
      <i v-for="(s, idx) in starsRef" :key="idx"
         :style="{ left: s.left, top: s.top, opacity: s.opacity, transform: `scale(${s.scale})` }" />
    </div>

    <nav class="mc-nav">
      <a class="mc-brand" href="/">
        <img class="mc-mark" :src="moonman" alt="McToken" width="34" height="34" />
        <span class="mc-wordmark">McToken</span>
      </a>
      <div class="mc-navspace" />
      <div class="mc-navlinks">
        <a :href="EXPLORER_URL" target="_blank" rel="noopener">Explorer</a>
        <a :href="X_URL" target="_blank" rel="noopener">X</a>
      </div>
      <a class="mc-btn mc-btn--primary" :href="BUY_URL" @click.prevent="openBuyToke" target="_blank" rel="noopener">Buy $TOKE</a>
    </nav>

    <div class="mc-hero-body">
      <p class="mc-eyebrow"><span class="mc-eyebrow-dot" />$TOKE · McToken · Solana</p>

      <div class="mc-moonwrap">
        <img class="mc-moon" :src="moonmanHero" alt="Moon Man — McToken" width="150" height="150" />
      </div>

      <h1 class="mc-h1">Same joke as the rest.<br /><span class="mc-h1-b">Real receipts.</span></h1>

      <p class="mc-sub">
        The honest memecoin on Solana — <b>every token accounted for on-chain</b>. The lore lives in the Explorer.
      </p>

      <div class="mc-cta">
        <a class="mc-btn mc-btn--primary mc-btn--lg" :href="BUY_URL" @click.prevent="openBuyToke" target="_blank" rel="noopener">Buy $TOKE</a>
        <a class="mc-btn mc-btn--lg" :href="EXPLORER_URL" target="_blank" rel="noopener">Explore every wallet →</a>
      </div>

      <div class="mc-mintline">
        <span class="mc-mono">{{ MINT.slice(0, 4) }}…{{ MINT.slice(-4) }}</span>
        <button class="mc-copy" type="button" @click="copyMint">{{ copied ? 'copied ✓' : 'copy ⧉' }}</button>
        <span>· mint authority revoked · supply fixed</span>
      </div>
    </div>

    <div class="mc-strip">
      <div class="mc-strip-in">
        <div class="mc-stat">
          <div class="mc-stat-l"><span class="mc-live" />Price</div>
          <div class="mc-stat-v mc-blue">{{ priceStr }}</div>
          <div class="mc-stat-s" :class="changeUp ? 'mc-up' : 'mc-down'">{{ changeStr || 'live' }}</div>
        </div>
        <div class="mc-stat">
          <div class="mc-stat-l">Market cap</div>
          <div class="mc-stat-v">{{ mcapStr }}</div>
          <div class="mc-stat-s">fully diluted</div>
        </div>
        <div class="mc-stat">
          <div class="mc-stat-l">Holders</div>
          <div class="mc-stat-v">{{ holdersStr }}</div>
          <div class="mc-stat-s">on-chain</div>
        </div>
        <div class="mc-stat">
          <div class="mc-stat-l">Supply</div>
          <div class="mc-stat-v">{{ supplyInt }}<span class="mc-g">.{{ supplyFrac }}</span></div>
          <div class="mc-stat-s">of 420,000,069</div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mc-hero {
  position: relative;
  font-family: var(--mc-sans);
  color: var(--mc-text);
  background:
    radial-gradient(130% 80% at 78% -8%, rgba(90, 162, 255, 0.12), transparent 58%),
    var(--mc-bg);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}
.mc-stars { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.mc-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #9fb4d8; }

.mc-nav {
  position: relative; z-index: 5;
  display: flex; align-items: center; gap: 24px;
  max-width: 1180px; margin: 0 auto; width: 100%; padding: 20px 22px;
}
.mc-brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }
.mc-mark { border-radius: 8px; display: block; }
.mc-wordmark { font-family: var(--mc-display); font-weight: 700; font-size: 19px; letter-spacing: -0.3px; color: var(--mc-text); }
.mc-navlinks { display: flex; gap: 26px; margin-right: 6px; font-family: var(--mc-mono); font-size: 11.5px; letter-spacing: 2px; text-transform: uppercase; }
.mc-navlinks a { color: var(--mc-mut); text-decoration: none; transition: color 0.12s var(--mc-ease); }
.mc-navlinks a:hover { color: var(--mc-text); }
.mc-navspace { flex: 1; }

.mc-btn {
  font-family: var(--mc-display); font-size: 13.5px; font-weight: 500;
  border-radius: 10px; padding: 9px 16px; border: 1px solid var(--mc-line-2);
  background: var(--mc-panel-2); color: var(--mc-text); cursor: pointer; text-decoration: none;
  transition: border-color 0.15s var(--mc-ease), background 0.15s var(--mc-ease); white-space: nowrap;
}
.mc-btn:hover { border-color: var(--mc-mut); }
.mc-btn--primary { background: var(--mc-blue); border-color: var(--mc-blue); color: var(--mc-blue-ink); font-weight: 600; }
.mc-btn--primary:hover { background: #74b1ff; border-color: #74b1ff; }
.mc-btn--lg { padding: 12px 20px; font-size: 15px; }

.mc-hero-body {
  position: relative; z-index: 4; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  max-width: 900px; margin: 0 auto; width: 100%; padding: 30px 22px 26px;
}
.mc-eyebrow {
  font-family: var(--mc-mono); font-size: 11.5px; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--mc-blue); margin: 0 0 22px; display: flex; align-items: center; gap: 9px;
}
.mc-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); box-shadow: 0 0 0 3px rgba(90, 209, 179, 0.18); }
.mc-moonwrap { margin: 0 0 22px; }
.mc-moon { display: block; width: 150px; height: 150px; border-radius: 50%; object-fit: cover; object-position: 50% 22%; box-shadow: 0 0 0 1px rgba(90, 162, 255, 0.45), 0 0 0 6px rgba(90, 162, 255, 0.08), 0 18px 44px rgba(90, 162, 255, 0.28); }
.mc-h1 {
  font-family: var(--mc-display); font-weight: 700;
  font-size: clamp(38px, 7vw, 76px); line-height: 1.02; letter-spacing: -1.8px; margin: 0;
}
.mc-h1-b { color: var(--mc-blue); }
.mc-sub { font-size: clamp(15px, 1.8vw, 17px); color: var(--mc-mut); max-width: 540px; margin: 22px auto 30px; line-height: 1.6; }
.mc-sub b { color: var(--mc-text); font-weight: 500; }
.mc-cta { display: flex; gap: 13px; justify-content: center; flex-wrap: wrap; }
.mc-mintline { margin-top: 22px; font-family: var(--mc-mono); font-size: 11.5px; color: var(--mc-mut-2); display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap; }
.mc-mono { font-family: var(--mc-mono); }
.mc-copy { border: 1px solid var(--mc-line-2); border-radius: 6px; padding: 2px 7px; color: var(--mc-mut); cursor: pointer; background: transparent; font-family: var(--mc-mono); font-size: 11px; }
.mc-copy:hover { color: var(--mc-text); border-color: var(--mc-mut); }

.mc-strip { position: relative; z-index: 4; border-top: 1px solid var(--mc-line); background: rgba(255, 255, 255, 0.015); }
.mc-strip-in { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
.mc-stat { padding: 20px 16px; text-align: center; border-right: 1px solid var(--mc-line); }
.mc-stat:last-child { border-right: 0; }
.mc-stat-l { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--mc-mut-2); font-family: var(--mc-mono); }
.mc-stat-v { font-family: var(--mc-mono); font-size: 21px; font-weight: 500; margin-top: 6px; letter-spacing: -0.5px; }
.mc-stat-v.mc-blue { color: var(--mc-blue); }
.mc-g { color: var(--mc-purple); }
.mc-stat-s { font-size: 10px; color: var(--mc-mut); margin-top: 3px; }
.mc-stat-s.mc-up { color: var(--mc-teal); }
.mc-stat-s.mc-down { color: #ff6b6b; }
.mc-live { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); margin-right: 5px; vertical-align: middle; animation: mc-pulse 2s infinite; }
@keyframes mc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

@media (max-width: 760px) {
  .mc-navlinks { display: none; }
  .mc-nav { gap: 14px; }
  .mc-strip-in { grid-template-columns: repeat(2, 1fr); }
  .mc-stat { border-bottom: 1px solid var(--mc-line); }
}
@media (prefers-reduced-motion: reduce) {
  .mc-live { animation: none; }
}
</style>
