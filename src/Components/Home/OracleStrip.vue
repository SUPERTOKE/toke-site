<script setup>
import { ref, onMounted } from 'vue';

/* The homepage carries a receipt: live oracle numbers stamped with the
   dataset's as_of time, straight from the shared Explorer substrate. */
const price = ref(null);
const mcap = ref(null);
const liq = ref(null);
const asOf = ref(null);

const jf = async (u) => {
  try {
    const r = await fetch(u, { cache: 'no-cache' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
};

onMounted(async () => {
  const j = (await jf('/xapi/explorer/oracle.json')) || (await jf('https://api.mctoken.xyz/v1/oracle.json'));
  if (!j) return;
  const d = j.data !== undefined ? j.data : j;
  price.value = d.liquidity_weighted_price_usd ?? d.price_usd ?? null;
  mcap.value = d.implied_mcap_usd ?? null;
  liq.value = d.total_pool_liquidity_usd ?? null;
  asOf.value = j.as_of || null;
});

const fmtPrice = (n) => (n == null ? '—' : '$' + (n < 0.01 ? n.toFixed(6) : n.toFixed(4)));
const fmtUsd = (n) => (n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US'));
const fmtAsOf = (s) => {
  try { return new Date(s).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; }
  catch { return s; }
};
</script>

<template>
  <div v-if="price !== null" class="ostrip" role="note" aria-label="Live oracle">
    <span class="o-eyebrow"><span class="o-dot" />Oracle</span>
    <span class="o-item">$TOKE <b>{{ fmtPrice(price) }}</b></span>
    <span class="o-item">mcap <b>{{ fmtUsd(mcap) }}</b></span>
    <span class="o-item o-liq">liquidity <b>{{ fmtUsd(liq) }}</b></span>
    <span v-if="asOf" class="o-asof">receipts as of {{ fmtAsOf(asOf) }}</span>
    <a class="o-verify" href="https://api.mctoken.xyz/v1/oracle" target="_blank" rel="noopener">verify ↗</a>
  </div>
</template>

<style scoped>
.ostrip {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  max-width: 1180px; margin: 0 auto; padding: 12px 22px;
  border-top: 1px solid var(--mc-line); border-bottom: 1px solid var(--mc-line);
  background: color-mix(in srgb, var(--mc-panel) 55%, transparent);
  font-family: var(--mc-mono); font-size: 11.5px; color: var(--mc-mut);
}
.o-eyebrow { display: inline-flex; align-items: center; gap: 7px; letter-spacing: 2.5px; text-transform: uppercase; font-size: 10.5px; color: var(--mc-blue); }
.o-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); animation: opulse 2.4s var(--mc-ease) infinite; }
@keyframes opulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.o-item b { color: var(--mc-text); font-weight: 500; }
.o-asof { color: var(--mc-mut-2); margin-left: auto; }
.o-verify { color: var(--mc-mut-2); text-decoration: none; }
.o-verify:hover { color: var(--mc-blue); }
@media (max-width: 760px) {
  .ostrip { gap: 12px; font-size: 10.5px; }
  .o-liq { display: none; }
  .o-asof { margin-left: 0; width: 100%; }
}
</style>
