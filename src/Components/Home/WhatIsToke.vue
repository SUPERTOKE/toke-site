<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { subscribeLiveStats } from '../../utils/liveStatsPoll';
import { statNum } from '../../utils/statsApi';
const EXPLORER_URL = 'https://explorer.mctoken.xyz';
const holdersStr = ref('12,993');
let unsub = null;
onMounted(() => {
  unsub = subscribeLiveStats(({ data, error }) => {
    if (error || !data) return;
    const n = statNum(data.holderCount ?? data.holders);
    if (Number.isFinite(n) && n > 0) holdersStr.value = Math.round(n).toLocaleString('en-US');
  });
});
onBeforeUnmount(() => { if (unsub) unsub(); unsub = null; });
const cards = [
  {
    key: 'meme', title: 'The meme',
    body: 'Moon Man, the blue astronaut, and a supply number that could only be a joke.',
    factLabel: 'Supply', factValue: '420,000,069',
  },
  {
    key: 'substance', title: 'The substance',
    body: 'A real on-chain explorer for every wallet that ever touched $TOKE. Mint authority revoked — the supply can’t inflate.',
    factLabel: 'Holders · on-chain', factValue: null,
  },
  {
    key: 'community', title: 'The community',
    body: 'A community that governs in the open — and shows up when it counts. Mods, memes, and votes that settle on-chain.',
    factLabel: 'Holder governance', factValue: 'on-chain',
  },
];
</script>

<template>
  <section class="wit">
    <div class="wit-in">
      <p class="wit-eyebrow"><span class="wit-dot" />Proof of Meme</p>
      <h2 class="wit-h2">A memecoin, <span class="b">with receipts.</span></h2>
      <p class="wit-lede">
        Most memecoins are a vibe and a chart. $TOKE is a vibe and a chart
        <b>and a paper trail</b> — three things, every one verifiable.
      </p>

      <div class="wit-cards">
        <div v-for="c in cards" :key="c.key" class="wit-card">
          <span class="wit-ic" aria-hidden="true">
            <svg v-if="c.key === 'meme'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5aa2ff" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
            <svg v-else-if="c.key === 'substance'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5aa2ff" stroke-width="1.8"><path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5aa2ff" stroke-width="1.8"><path d="M5 4h14v12H7l-2 2Z"/><path d="M9 9l2 2 4-4"/></svg>
          </span>
          <h3 class="wit-card-h">{{ c.title }}</h3>
          <p class="wit-card-p">{{ c.body }}</p>
          <div class="wit-fact"><span>{{ c.factLabel }}</span><b>{{ c.key === 'substance' ? holdersStr : c.factValue }}</b></div>
        </div>
      </div>

      <div class="wit-cta">
        <a class="wit-btn" :href="EXPLORER_URL" target="_blank" rel="noopener">See the proof on the explorer →</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wit { position: relative; background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.wit-h2, .wit-card-h { color: var(--mc-text); }
.wit-in { max-width: 1180px; margin: 0 auto; padding: 72px 22px; }
.wit-eyebrow { font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 14px; display: flex; align-items: center; gap: 8px; justify-content: center; }
.wit-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.wit-h2 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(28px, 4.5vw, 46px); letter-spacing: -1px; text-align: center; margin: 0 0 14px; line-height: 1.05; }
.wit-h2 .b { color: var(--mc-blue); }
.wit-lede { text-align: center; color: var(--mc-mut); max-width: 580px; margin: 0 auto 42px; font-size: 15.5px; line-height: 1.6; }
.wit-lede b { color: var(--mc-text); font-weight: 500; }
.wit-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.wit-card { background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px; padding: 24px 22px; }
.wit-ic { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: rgba(90, 162, 255, 0.12); margin-bottom: 16px; }
.wit-card-h { font-family: var(--mc-display); font-weight: 600; font-size: 19px; margin: 0 0 8px; }
.wit-card-p { color: var(--mc-mut); font-size: 14px; line-height: 1.6; margin: 0 0 14px; }
.wit-fact { font-family: var(--mc-mono); font-size: 12px; color: var(--mc-blue); border-top: 1px solid var(--mc-line); padding-top: 12px; display: flex; justify-content: space-between; }
.wit-fact b { color: var(--mc-text); font-weight: 500; }
.wit-cta { text-align: center; margin-top: 34px; }
.wit-btn { font-family: var(--mc-display); font-size: 14px; border-radius: 10px; padding: 11px 18px; border: 1px solid var(--mc-line-2); background: var(--mc-panel-2); color: var(--mc-text); text-decoration: none; display: inline-block; transition: border-color 0.15s var(--mc-ease); }
.wit-btn:hover { border-color: var(--mc-blue); }
@media (max-width: 760px) { .wit-cards { grid-template-columns: 1fr; } }
</style>
