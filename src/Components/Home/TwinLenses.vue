<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

/* Two ways to read the chain — the port routes every traveler to the twin
   lenses: the Explorer (data render) and the Voyager (lore render).
   Both cards run on the same published datasets; nothing here is invented. */

const EXPLORER_URL = 'https://explorer.mctoken.xyz';
const VOYAGER_URL = 'https://voyager.mctoken.xyz';

const holdersCount = ref(null);
const grade = ref(null);
const top10 = ref(null);
const lpLocked = ref(null);
const topVessel = ref(null);

const jf = async (u) => {
  try {
    const r = await fetch(u, { cache: 'no-cache' });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.data !== undefined ? j.data : j;
  } catch { return null; }
};
const ex = async (name) => (await jf(`/xapi/explorer/${name}`)) || (await jf(`https://api.mctoken.xyz/v1/${name}`));

const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const fmtPct = (n) => (n == null ? '—' : Number(n).toFixed(1) + '%');

/* mini starfield for the Voyager lens */
const cvEl = ref(null);
let raf = null;
function startStars() {
  const cv = cvEl.value;
  if (!cv) return;
  const cx = cv.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = () => {
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return r;
  };
  let { width: W, height: H } = size();
  const stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    z: Math.random() * 0.9 + 0.1, tw: Math.random() * 6.28,
  }));
  let t = 0;
  const draw = () => {
    t += 0.016;
    const r = cv.getBoundingClientRect();
    if (Math.abs(r.width - W) > 2) { ({ width: W, height: H } = size()); }
    cx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.x -= s.z * 0.5;
      if (s.x < -2) { s.x = W + 2; s.y = Math.random() * H; }
      const a = 0.25 + s.z * 0.5 + Math.sin(t * 2 + s.tw) * 0.12;
      cx.fillStyle = `rgba(231,234,239,${Math.max(0, a)})`;
      cx.fillRect(s.x, s.y, s.z > 0.6 ? 1.6 : 1, s.z > 0.6 ? 1.6 : 1);
    }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
}

onMounted(async () => {
  startStars();
  const [token, health, holders] = await Promise.all([ex('token.json'), ex('health.json'), ex('holders.json')]);
  if (token) {
    holdersCount.value = token.holders_count ?? null;
    lpLocked.value = token.lp_locked_pct ?? null;
  }
  if (health) {
    grade.value = health.grade ?? null;
    top10.value = health.top10_pct ?? null;
    if (lpLocked.value == null) lpLocked.value = health.lp_locked_pct ?? null;
  }
  const rows = Array.isArray(holders) ? holders : holders?.holders || [];
  const top = rows.find((r) => r && (!r.type || r.type === 'holder'));
  if (top) topVessel.value = { name: top.sns || (top.address ? top.address.slice(0, 4) + '…' + top.address.slice(-4) : '—'), pct: top.pct };
});

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });
</script>

<template>
  <section class="tl">
    <div class="tl-in">
      <p class="tl-eyebrow"><span class="tl-dot" />Two ways to read the chain</p>
      <h2 class="tl-h2">The Explorer &amp; <span class="b">the Voyager.</span></h2>
      <p class="tl-lede">
        Same receipts, two renders. The Explorer reads the chain as data — every wallet, every
        badge, every proof. The Voyager reads it as lore — the same wallets as vessels on Moon
        Man's voyage. Two doors, one room.
      </p>

      <div class="tl-grid">
        <a class="tl-card tl-card--explorer" :href="EXPLORER_URL" target="_blank" rel="noopener">
          <div class="tl-tag">Data render</div>
          <h3 class="tl-nm">The Explorer</h3>
          <div class="tl-stats">
            <div class="tl-stat"><span class="k">Holders</span><span class="v">{{ fmtNum(holdersCount) }}</span></div>
            <div class="tl-stat"><span class="k">Health</span><span class="v">{{ grade ?? '—' }}</span></div>
            <div class="tl-stat"><span class="k">Top 10</span><span class="v">{{ fmtPct(top10) }}</span></div>
            <div class="tl-stat"><span class="k">LP locked</span><span class="v">{{ fmtPct(lpLocked) }}</span></div>
          </div>
          <p class="tl-desc">Every wallet that ever touched $TOKE — balances, badges, cohorts and provenance, reconciled against the chain and published for anyone to audit.</p>
          <span class="tl-cta">Read the chain ↗</span>
        </a>

        <a class="tl-card tl-card--voyager" :href="VOYAGER_URL" target="_blank" rel="noopener">
          <canvas ref="cvEl" class="tl-stars" aria-hidden="true"></canvas>
          <div class="tl-tag tl-tag--v">Lore render</div>
          <h3 class="tl-nm">The Voyager</h3>
          <p class="tl-lead" v-if="topVessel">
            Lead vessel: <b>{{ topVessel.name }}</b><template v-if="topVessel.pct != null"> · {{ Number(topVessel.pct).toFixed(1) }}% of supply</template>
          </p>
          <p class="tl-lead" v-else>Every wallet is already aboard.</p>
          <p class="tl-desc">Moon Man's idle game over the same data — your stash is the fuel, holding is the play. Search any address or name.sol and see how far it has flown.</p>
          <span class="tl-cta">Board the Voyager ↗</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tl { position: relative; background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.tl-in { max-width: 1180px; margin: 0 auto; padding: 72px 22px; }
.tl-eyebrow { font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.tl-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.tl-h2 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(28px, 4.5vw, 46px); letter-spacing: -1px; margin: 0 0 14px; line-height: 1.05; }
.tl-h2 .b { color: var(--mc-blue); }
.tl-lede { color: var(--mc-mut); font-size: 15.5px; line-height: 1.6; margin: 0 0 26px; max-width: 640px; }
.tl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.tl-card {
  position: relative; display: flex; flex-direction: column; gap: 10px; overflow: hidden;
  background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px;
  padding: 22px; text-decoration: none; color: var(--mc-text);
  transition: border-color 0.18s var(--mc-ease), transform 0.18s var(--mc-ease);
}
.tl-card:hover { border-color: var(--mc-blue); transform: translateY(-2px); }
.tl-tag { font-family: var(--mc-mono); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--mc-teal); border: 1px solid rgba(90, 209, 179, 0.35); border-radius: 6px; padding: 3px 8px; width: fit-content; }
.tl-tag--v { color: var(--mc-blue); border-color: rgba(90, 162, 255, 0.4); position: relative; z-index: 1; }
.tl-nm { font-family: var(--mc-display); font-weight: 600; font-size: 22px; margin: 2px 0 0; position: relative; z-index: 1; }
.tl-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 6px 0 2px; }
.tl-stat { background: var(--mc-bg); border: 1px solid var(--mc-line); border-radius: 10px; padding: 9px 10px; }
.tl-stat .k { display: block; font-family: var(--mc-mono); font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--mc-mut-2); }
.tl-stat .v { display: block; font-family: var(--mc-mono); font-size: 15px; color: var(--mc-text); margin-top: 3px; }
.tl-lead { font-family: var(--mc-mono); font-size: 12px; color: var(--mc-mut); margin: 6px 0 0; position: relative; z-index: 1; }
.tl-lead b { color: var(--mc-blue); font-weight: 500; }
.tl-desc { color: var(--mc-mut); font-size: 13px; line-height: 1.55; margin: 4px 0 0; position: relative; z-index: 1; }
.tl-cta { font-family: var(--mc-display); font-size: 13.5px; font-weight: 500; color: var(--mc-blue); margin-top: auto; padding-top: 10px; position: relative; z-index: 1; }
.tl-card--voyager { background: var(--mc-bg-deep, #06070a); }
.tl-stars { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.7; }
@media (max-width: 760px) {
  .tl-grid { grid-template-columns: 1fr; }
  .tl-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
