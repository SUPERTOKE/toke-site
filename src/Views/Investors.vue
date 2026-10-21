<script setup>
/* mctoken.xyz/investors — the $TOKE Tokenholder Report, living edition.
   Numbers: prospectus.json (pipeline, every 6h) + oracle (live) + reliability.json + status.
   Prose: src/data/prospectus/text.js (owner-written, git-versioned). */
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue';
import moonman from '../assets/moonman-head.png';
import { subscribeLiveStats } from '../utils/liveStatsPoll';
import { statNum, formatTokePriceDisplay, formatMarketCapDisplay } from '../utils/statsApi';
import { summary, treasuryPolicy, governanceHow, risks, roadmap, contributors, disclosures } from '../data/prospectus/text.js';
const Footer = defineAsyncComponent(() => import('../Components/Footer.vue'));

const MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';
const REALM = 'BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD'; // McToken DAO on Realms
// official marks, self-hosted (no CDN): DEX venues + pair tokens
import dexMeteora from '../assets/logos/dex/meteora.png';
import dexRaydium from '../assets/logos/dex/raydium.png';
import dexOrca from '../assets/logos/dex/orca.png';
import dexJupiter from '../assets/logos/dex/jupiter.png';
import tokToke from '../assets/logos/tokens/toke.png';
import tokSol from '../assets/logos/tokens/sol.png';
import tokUsdc from '../assets/logos/tokens/usdc.png';
import tokDank from '../assets/logos/tokens/dank.svg';
const DEX_ICON = { meteora: dexMeteora, raydium: dexRaydium, orca: dexOrca, jupiter: dexJupiter };
const TOK_ICON = { TOKE: tokToke, SOL: tokSol, WSOL: tokSol, USDC: tokUsdc, DANK: tokDank };
const dexIcon = (d) => DEX_ICON[String(d || '').toLowerCase()] || null;
const tokIcon = (t) => TOK_ICON[String(t || '').toUpperCase()] || null;
const DEX_NAME = { meteora: 'Meteora', raydium: 'Raydium', orca: 'Orca', jupiter: 'Jupiter' };
const dexName = (d) => DEX_NAME[String(d || '').toLowerCase()] || String(d || '—');
const EXPLORER_URL = 'https://explorer.mctoken.xyz';
const API = 'https://explorer.mctoken.xyz/api/v1';

const P = ref(null);          // prospectus.json
const R = ref(null);          // reliability.json
const O = ref(null);          // oracle (live)
const S = ref(null);          // status history
const editions = ref([]);
const live = ref({ price: '—', mcap: '—', holders: '—', change: null });
let unsub = null;

const jf = async (u) => { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
const first = async (...urls) => { for (const u of urls) { try { return await jf(u); } catch { /* next */ } } return null; };

onMounted(async () => {
  unsub = subscribeLiveStats(({ data, error }) => {
    if (error || !data) return;
    const p = statNum(data.price), m = statNum(data.marketCap), h = statNum(data.holderCount ?? data.holders);
    if (p > 0) live.value.price = formatTokePriceDisplay(p);
    if (m > 0) live.value.mcap = formatMarketCapDisplay(m);
    if (h > 0) live.value.holders = Math.round(h).toLocaleString('en-US');
    const c = statNum(data.priceChangeH24); live.value.change = Number.isFinite(c) ? c : null;
  });
  const cb = Date.now();
  [P.value, R.value, O.value, S.value] = await Promise.all([
    first(`/xapi/explorer/prospectus.json?cb=${cb}`, `${API}/prospectus.json?cb=${cb}`),
    first(`/xapi/explorer/reliability.json?cb=${cb}`, `${API}/reliability.json?cb=${cb}`),
    first(`/xapi/toke/oracle?cb=${cb}`, `https://api.mctoken.xyz/v1/oracle?cb=${cb}`),
    first('https://status.mctoken.xyz/api/history'),
  ]);
  const idx = await first(`/xapi/explorer/reports/index.json?cb=${cb}`, `${API}/reports/index.json?cb=${cb}`);
  editions.value = (idx && idx.editions) || [];
});
onBeforeUnmount(() => { if (unsub) unsub(); unsub = null; });

/* ── formatters ── */
const num = (v) => (v == null || v === '' || v === false ? NaN : +v);   // null/undefined/false → '—', never 0
const n0 = (v) => (Number.isFinite(num(v)) ? Math.round(num(v)).toLocaleString('en-US') : '—');
const n3 = (v) => (Number.isFinite(num(v)) ? num(v).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '—');
const pct = (v, d = 2) => (Number.isFinite(num(v)) ? `${num(v).toFixed(d)}%` : '—');
const usd = (v) => (Number.isFinite(num(v)) ? `$${Math.round(num(v)).toLocaleString('en-US')}` : '—');
const signed = (v) => (Number.isFinite(num(v)) ? `${num(v) > 0 ? '+' : ''}${n0(v)}` : '—');
const spct = (v, d = 1) => (Number.isFinite(num(v)) ? `${num(v) > 0 ? '+' : ''}${num(v).toFixed(d)}%` : '—');
const short = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—');
const when = (iso) => (iso ? iso.replace('T', ' ').replace(/:\d\d(\.\d+)?Z$/, ' UTC') : '—');
const dt = (iso) => (iso ? iso.slice(0, 10) : '—');

/* ── derived ── */
const od = computed(() => (O.value && O.value.data) || {});
const gateOk = computed(() => R.value && R.value.gate_a === 'GREEN');
const classes = computed(() => {
  const c = (P.value && P.value.holders && P.value.holders.class_pct) || {};
  return [
    { k: 'Liquidity pools', v: c['liquidity-pool'], color: '#5aa2ff' },
    { k: 'Treasury & governance', v: c['treasury-gov'], color: '#9b8cff' },
    { k: 'Programs & routers', v: c['program'], color: '#e7b84a' },
    { k: 'Top-100 people', v: c['top100-people'], color: '#5ad1b3' },
    { k: 'All other people', v: c['rest'], color: '#2e3540' },
  ].filter((x) => Number.isFinite(+x.v));
});
const treasuryPct = computed(() => P.value && P.value.treasury ? pct(P.value.treasury.total_pct) : '—');
const TIERS = { 1: 'council-controlled', 2: 'member-controlled escrow', 3: 'member-controlled individual' };
const tierOf = (w) => w.tier || (w.category === 'governance' ? 2 : 1);
const tierName = (t) => TIERS[t] || '—';
const mem = computed(() => (P.value && P.value.treasury && P.value.treasury.members) || null);
// DAO treasury proper (treasury/dao wallets) vs the Realms governance escrow (members' voting deposits)
const treSplit = computed(() => {
  const ws = P.value && P.value.treasury && P.value.treasury.wallets;
  if (!ws) return { dao: '—', escrow: '—' };
  const sum = (f) => ws.filter(f).reduce((a, w) => a + (num(w.pct) || 0), 0);
  return { dao: pct(sum((w) => w.category !== 'governance')), escrow: pct(sum((w) => w.category === 'governance')) };
});
const opsOk = computed(() => (S.value && S.value.current && S.value.current.overall) || 'idle');
const statusDays = computed(() => {
  const h = (S.value && (S.value.history || S.value.days)) || [];
  const n = h.length; if (!n) return null;
  const ok = h.filter((d) => (d.overall || d.status) === 'ok').length;
  return { n, ok };
});
const pdfUrl = (ed) => `${API}/reports/prospectus-${ed}.json`;
function printPage() { try { window.print(); } catch { /* no print */ } }
</script>

<template>
  <div class="iv">
    <nav class="iv-nav">
      <a class="iv-brand" href="/"><img :src="moonman" alt="McToken" width="34" height="34" /><span>McToken</span></a>
      <span class="iv-space" />
      <div class="iv-links">
        <a :href="EXPLORER_URL" target="_blank" rel="noopener">Explorer</a>
        <a href="/investors" aria-current="page" class="on">Report</a>
      </div>
    </nav>

    <main class="iv-main">
      <!-- title -->
      <div class="iv-title">
        <div>
          <p class="eyebrow"><i />Tokenholder report · living edition</p>
          <h1>Every number on this page<br /><b>carries its source.</b></h1>
          <p class="lede">An informational report on the $TOKE token, regenerated every six hours by the self-checking, publicly verifiable pipeline that feeds the Explorer. Not an offering. Not advice. Receipts.</p>
        </div>
        <div class="panel badge">
          <div class="chips">
            <span class="chip" :class="{ ok: gateOk, warn: R && !gateOk }" title="Gate-A: the pipeline's publish gate. GREEN = genesis, exact balances, complete listing, independent cross-index and freshness all passed on this run."><i />Audit {{ R ? R.gate_a : '…' }}</span>
            <span class="chip" :class="{ ok: R && R.flow_reconciled }" title="Every wallet's net transfer history equals its on-chain balance.">Flows {{ R && R.flow_reconciled ? 'reconciled' : '—' }}</span>
            <span class="chip" :class="{ ok: R && R.publish_allowed }" title="The redaction gate scans every published file for private data before it can go live; nothing is published if it fails.">Redaction {{ R && R.publish_allowed ? 'passed' : '—' }}</span>
          </div>
          <div class="asof" title="The chain snapshot is the last block the pipeline has fully reconciled; the page is published after each six-hourly run, so it trails the chain by up to half a day.">Chain snapshot {{ when(R && R.as_of) }} · published {{ when(R && R.generated) }}<template v-if="R && R.lag_hours != null"> · {{ Math.round(R.lag_hours) }} h behind chain</template> · <a :href="`${API}/reliability.json`" target="_blank" rel="noopener">proof ↗</a></div>
          <div class="acts">
            <button type="button" class="ghost" @click="printPage">Save as PDF</button>
            <a class="ghost" href="#s12">Quarterly archive</a>
            <a class="ghost" :href="`${API}/prospectus.json`" target="_blank" rel="noopener">Raw data (JSON)</a>
          </div>
        </div>
      </div>

      <div class="toc">
        <a href="#s1">01 Summary</a><a href="#s2">02 Token</a><a href="#s3">03 Market</a><a href="#s4">04 Holders</a><a href="#s5">05 Treasury</a><a href="#s6">06 Governance</a><a href="#s7">07 Liquidity</a><a href="#s8">08 Operations</a><a href="#s9">09 Risks</a><a href="#s10">10 Roadmap</a><a href="#s11">11 Contributors</a><a href="#s12">12 Disclosures</a>
      </div>

      <!-- 01 -->
      <section id="s1" class="sec">
        <p class="eyebrow"><i />01 · Summary</p>
        <h2>A memecoin <b>with an audit trail.</b></h2>
        <p class="body">{{ summary.text }}</p>
        <div class="stats">
          <div class="panel stat"><div class="l">Price</div><div class="n blue">{{ live.price }}</div><div class="s" :class="live.change != null ? (live.change >= 0 ? 'up' : 'down') : ''">{{ live.change != null ? `24h ${live.change >= 0 ? '+' : ''}${live.change.toFixed(1)}%` : 'live' }}</div></div>
          <div class="panel stat"><div class="l">Market cap</div><div class="n">{{ live.mcap }}</div><div class="s">price × supply</div></div>
          <div class="panel stat"><div class="l">Holders</div><div class="n">{{ live.holders }}</div><div class="s">on-chain</div></div>
          <div class="panel stat"><div class="l">Liquidity</div><div class="n">{{ usd(od.total_pool_liquidity_usd) }}</div><div class="s">{{ od.pools ? od.pools.length : '—' }} pools</div></div>
          <div class="panel stat"><div class="l">DAO treasury</div><div class="n purple">{{ treSplit.dao }}</div><div class="s">of supply · {{ treSplit.escrow }} in governance escrow</div></div>
        </div>
        <div class="asof">Source: oracle (live) · prospectus.json · last edited {{ summary.lastEdited }}</div>
      </section>

      <!-- 02 · 03 -->
      <div class="two">
        <section id="s2" class="sec">
          <p class="eyebrow"><i />02 · Token facts</p>
          <h2>Fixed. <b>Verifiable.</b></h2>
          <div class="panel rows">
            <div class="row"><span class="k">Mint</span><span class="v">{{ short(MINT) }} <a :href="`https://solscan.io/token/${MINT}`" target="_blank" rel="noopener">↗</a></span></div>
            <div class="row"><span class="k">Max supply</span><span class="v">{{ n0(P && P.token.max_supply) }}</span></div>
            <div class="row"><span class="k">Current supply</span><span class="v">{{ n3(P && P.token.current_supply) }}</span></div>
            <div class="row"><span class="k">Burned</span><span class="v">{{ n3(P && P.token.burned) }} <small>({{ pct(P && P.token.burned_pct, 3) }})</small></span></div>
            <div class="row"><span class="k">Decimals · program</span><span class="v">{{ P ? P.token.decimals : '—' }} · SPL Token</span></div>
            <div class="row"><span class="k">Mint authority</span><span class="v teal">{{ P && P.token.authorities && P.token.authorities.mint === null ? 'revoked' : '—' }}</span></div>
            <div class="row"><span class="k">Freeze authority</span><span class="v teal">{{ P && P.token.authorities ? (P.token.authorities.freeze == null || P.token.authorities.freeze === 'likely_null' ? 'none' : short(P.token.authorities.freeze)) : '—' }}</span></div>
            <div class="row"><span class="k">Metadata authority</span><span class="v">{{ P && P.token.authorities && P.token.authorities.update ? short(P.token.authorities.update) : '—' }} <small>active — name, symbol, image editable</small></span></div>
            <div class="row"><span class="k">First seen on-chain</span><span class="v">{{ dt(P && P.token.launched) }}</span></div>
          </div>
          <div class="asof">Source: token.json · base_lean.json · as of {{ when(P && P.as_of) }}</div>
        </section>
        <section id="s3" class="sec">
          <p class="eyebrow"><i />03 · Market</p>
          <h2>Liquidity-weighted, <b>no single venue.</b></h2>
          <div class="panel rows">
            <div class="row"><span class="k">Price (liquidity-weighted across pools)</span><span class="v">{{ od.liquidity_weighted_price_usd ? `$${od.liquidity_weighted_price_usd.toFixed(7)}` : '—' }}</span></div>
            <div class="row"><span class="k">24h change · price / mcap / liquidity</span><span class="v">{{ spct(od.price_change_h24) }} · {{ spct(od.mcap_change_pct_24h) }} · {{ spct(od.liquidity_change_pct_24h) }}</span></div>
            <div class="row"><span class="k">24h volume</span><span class="v">{{ usd(od.total_volume_h24_usd) }}</span></div>
            <div class="row"><span class="k">Implied market cap</span><span class="v">{{ usd(od.implied_mcap_usd) }}</span></div>
            <div class="row"><span class="k">Pools priced · used in price</span><span class="v">{{ od.pools ? `${od.pools.length} · ${od.pools.filter((p) => p.in_vwap).length}` : '—' }}</span></div>
            <div class="row"><span class="k">Price source</span><span class="v">TOKE oracle · quotes: {{ O && O.source ? Object.entries(O.source).map(([k, v]) => `${String(v).replace('dexscreener', 'DexScreener')}, ${k}`).join(' · ') : '—' }}</span></div>
          </div>
          <div class="asof">Source: TOKE oracle, api.mctoken.xyz/v1/oracle (liquidity-weighted across pools; quotes from DexScreener) · as of {{ when(O && O.as_of) }}</div>
        </section>
      </div>

      <!-- 04 -->
      <section id="s4" class="sec">
        <p class="eyebrow"><i />04 · Holders &amp; distribution</p>
        <h2>Who holds it, <b>and how much.</b></h2>
        <div class="two tight">
          <div class="panel rows">
            <div class="row"><span class="k">Wallets that ever held $TOKE</span><span class="v">{{ n0(P && P.holders.universe) }}</span></div>
            <div class="row"><span class="k">Current holders (balance &gt; 0)</span><span class="v">{{ n0(P && P.holders.holders) }}</span></div>
            <div class="row"><span class="k">First-time wallets · 1d / 7d / 30d</span><span class="v">{{ P ? ['1d', '7d', '30d'].map((f) => n0(P.holders.growth[f] && P.holders.growth[f].new_wallets)).join(' / ') : '—' }}</span></div>
            <div class="row"><span class="k">Holders with a domain name</span><span class="v">{{ n0(P && P.holders.with_domains.total) }} <small>(.sol {{ n0(P && P.holders.with_domains.sol) }} · ANS {{ n0(P && P.holders.with_domains.ans) }} · some both)</small></span></div>
            <div class="row"><span class="k">Top-10 / 50 / 100 — all wallets</span><span class="v">{{ P ? [10, 50, 100].map((n) => pct(P.holders.concentration_all[`top${n}_pct`], 1)).join(' / ') : '—' }}</span></div>
            <div class="row"><span class="k">Top-10 / 50 / 100 — people only</span><span class="v">{{ P ? [10, 50, 100].map((n) => pct(P.holders.concentration_people[`top${n}_pct`], 1)).join(' / ') : '—' }}</span></div>
          </div>
          <div class="panel classes">
            <div class="l">Supply by holder class</div>
            <div class="bar"><i v-for="c in classes" :key="c.k" :style="{ width: c.v + '%', background: c.color }" :title="`${c.k} ${pct(c.v)}`" /></div>
            <div class="legend">
              <span v-for="c in classes" :key="c.k"><i :style="{ background: c.color }" />{{ c.k }} <b>{{ pct(c.v, 1) }}</b></span>
            </div>
            <p class="note" v-if="P && P.holders.class_pct">Plainly: excluding pools, programs and treasury wallets, the 100 largest people hold <b>{{ pct(P.holders.class_pct['top100-people'], 0) }}</b> of supply and all other people hold <b>{{ pct(P.holders.class_pct['rest'], 0) }}</b>.</p>
            <div class="asof">"People" = wallets not labelled as a pool, program or treasury. Labels are proven on-chain (labels.json).</div>
          </div>
        </div>
        <div class="asof">Source: base_lean.json · labels.json · movers.json · as of {{ when(P && P.as_of) }}</div>
      </section>

      <!-- 05 -->
      <section id="s5" class="sec">
        <p class="eyebrow"><i />05 · Treasury &amp; governance wallets</p>
        <h2>Where the DAO's tokens sit, <b>live.</b></h2>
        <div class="panel scroll">
          <table>
            <thead><tr><th>Control</th><th>Wallet</th><th>Role</th><th class="r">$TOKE balance</th><th class="r">% supply</th><th class="r">30d net flow</th><th>Proof</th><th></th></tr></thead>
            <tbody>
              <tr v-for="w in (P ? P.treasury.wallets : [])" :key="w.address">
                <td><span class="tier" :class="`t${tierOf(w)}`">{{ tierOf(w) }}</span><div class="sub">{{ tierName(tierOf(w)) }}</div></td>
                <td><div class="m">{{ w.sns || short(w.address) }}</div><div class="m sub">{{ w.address }}</div></td>
                <td>{{ w.name }}<div class="sub">{{ w.display }}</div></td>
                <td class="r m">{{ n3(w.balance) }}</td>
                <td class="r m">{{ pct(w.pct, 3) }}</td>
                <td class="r m">{{ w.flow_30d ? signed(w.flow_30d.net) : '—' }}<div class="sub" v-if="w.flow_30d">{{ w.flow_30d.legs }} legs</div></td>
                <td><span class="tag" :class="{ ok: w.confidence === 'corroborated' }">{{ w.confidence || '—' }}</span></td>
                <td class="r"><a :href="`${EXPLORER_URL}/?v=${w.address}`" target="_blank" rel="noopener">↗</a></td>
              </tr>
              <tr v-if="P"><td colspan="3" class="sum">Total in council and escrow wallets (tiers 1–2)</td><td class="r m sum">{{ n3(P.treasury.total_balance) }}</td><td class="r m sum">{{ pct(P.treasury.total_pct, 3) }}</td><td colspan="3"></td></tr>
              <tr v-if="P">
                <td><span class="tier t3">3</span><div class="sub">{{ tierName(3) }}</div></td>
                <td colspan="2">DAO members — every wallet that has voted in a McToken DAO proposal<div class="sub">{{ mem ? `${n0(mem.wallets)} wallets · ${n0(mem.holding)} still holding · ${mem.proposals} proposals` : 'aggregate only · available after the next pipeline run' }}</div></td>
                <td class="r m">{{ mem ? n3(mem.balance) : '—' }}</td>
                <td class="r m">{{ mem ? pct(mem.pct, 3) : '—' }}</td>
                <td class="r m">—</td>
                <td><span class="tag ok" v-if="mem">on-chain rolls</span></td>
                <td class="r"><a :href="`https://app.realms.today/dao/${REALM}`" target="_blank" rel="noopener" title="McToken DAO on Realms">↗</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="body small"><b>Treasury policy.</b> {{ treasuryPolicy.text }} <span class="asof">Last edited {{ treasuryPolicy.lastEdited }}</span></p>
        <div class="asof">Source: labels.json (treasury / governance) · base_lean.json · ledger (30d flows) · as of {{ when(P && P.as_of) }}</div>
      </section>

      <!-- 06 -->
      <section id="s6" class="sec">
        <p class="eyebrow"><i />06 · Governance</p>
        <h2>Three votes. <b>All on-chain.</b></h2>
        <div class="two tight">
          <div class="panel scroll">
            <table>
              <thead><tr><th>Vote</th><th>Date</th><th class="r">Voters</th><th class="r">Turnout</th><th class="r">Yes (of supply)</th><th>Result</th><th></th></tr></thead>
              <tbody>
                <tr v-for="v in (P ? P.governance.votes : [])" :key="v.year">
                  <td>Great McVote <span class="m">#{{ v.year - 2023 }}</span><div class="sub">{{ v.theme }}</div></td>
                  <td class="m">{{ v.date }}</td>
                  <td class="r m">{{ v.voters }}</td>
                  <td class="r m">{{ pct(v.turnout_pct, 1) }}</td>
                  <td class="r m">{{ pct(v.yes_pct_of_supply, 1) }}</td>
                  <td><span class="tag" :class="v.passed ? 'ok' : 'no'">{{ v.passed ? 'passed' : 'quorum missed' }}</span></td>
                  <td class="r"><a v-if="v.proposal" :href="`https://app.realms.today/dao/${REALM}/proposal/${v.proposal}`" target="_blank" rel="noopener" title="Proposal on Realms">↗</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel tl">
            <div><span class="d">Mechanism</span><span class="t">{{ governanceHow.mechanism }}</span></div>
            <div><span class="d">Quorum</span><span class="t"><b>{{ P ? P.governance.quorum_pct : 60 }}% of supply</b> voting Yes.</span></div>
            <div><span class="d">Escrow</span><span class="t"><b>{{ P && P.governance.escrow.length ? n3(P.governance.escrow[0].balance) : '—' }} $TOKE</b> in the Realms governance escrow — members' voting deposits, withdrawable by each depositor; not treasury.</span></div>
            <div><span class="d">Delivered</span><span class="t">The 2026 vote unlocked <b>28,474,786 $TOKE</b> from the McVault to the council (TIP-4, 2026-04-23); <b>13,742,077 $TOKE</b> was paid to voters on 2026-04-28 <a :href="`https://app.realms.today/dao/${REALM}/proposal/7Xk2w2q4mGTy66UEW59NHkJb3ixwimra3CGspdRr174d`" target="_blank" rel="noopener" title="TIP-4 execution proposal on Realms">↗</a></span></div>
            <div><span class="d">Proposals</span><span class="t">{{ governanceHow.proposals }}</span></div>
            <div><span class="d">Next vote</span><span class="t"><b>{{ P ? P.governance.next_vote : '2027-04-20' }}.</b> {{ governanceHow.nextAgenda }}</span></div>
          </div>
        </div>
        <div class="asof">Source: mcvote_nfts.json (on-chain voter rolls, reconciled to Realms) · governance.json · last edited {{ governanceHow.lastEdited }}</div>
      </section>

      <!-- 07 · 08 -->
      <div class="two">
        <section id="s7" class="sec">
          <p class="eyebrow"><i />07 · Liquidity &amp; venues</p>
          <h2>Pools, <b>by address.</b></h2>
          <div class="panel scroll">
            <table>
              <thead><tr><th>DEX</th><th>Pair · pool</th><th class="r">Liquidity</th><th class="r">$TOKE price here</th><th class="r" title="Counted in the liquidity-weighted price in 03">In price?</th></tr></thead>
              <tbody>
                <tr v-for="p in (od.pools || [])" :key="p.cite && p.cite.ref">
                  <td><span class="ent"><img v-if="dexIcon(p.dex)" :src="dexIcon(p.dex)" :alt="dexName(p.dex)" width="18" height="18" />{{ dexName(p.dex) }}</span></td>
                  <td class="m"><span class="pair"><img v-if="tokIcon(p.base)" :src="tokIcon(p.base)" :alt="p.base" width="16" height="16" /><img v-if="tokIcon(p.quote)" :src="tokIcon(p.quote)" :alt="p.quote" width="16" height="16" class="q" />{{ p.base }}/{{ p.quote }}</span> · <a :href="`https://solscan.io/account/${p.cite.ref}`" target="_blank" rel="noopener">{{ short(p.cite.ref) }}</a></td>
                  <td class="r m">{{ usd(p.liquidityUsd) }}</td>
                  <td class="r m">{{ String(p.base).toUpperCase() === 'TOKE' && p.priceUsd ? `$${p.priceUsd}` : '—' }}<div class="sub" v-if="String(p.base).toUpperCase() !== 'TOKE'">{{ p.base }}-priced pool</div></td>
                  <td class="r"><span class="tag" :class="p.in_vwap ? 'ok' : 'no'">{{ p.in_vwap ? 'yes' : 'no' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="asof">Source: TOKE oracle (api.mctoken.xyz) · quotes: DexScreener, live; registry pools backfilled from GeckoTerminal · as of {{ when(O && O.as_of) }}</div>
        </section>
        <section id="s8" class="sec">
          <p class="eyebrow"><i />08 · Operations</p>
          <h2>What runs, <b>and its uptime.</b></h2>
          <div class="panel rows">
            <div class="row"><span class="k">All services now</span><span class="v" :class="opsOk === 'ok' ? 'teal' : ''">{{ opsOk === 'ok' ? 'operational' : opsOk }}</span></div>
            <div class="row"><span class="k">Last pipeline run</span><span class="v">{{ when(R && R.generated) }}</span></div>
            <div class="row"><span class="k">Days with every service OK</span><span class="v">{{ statusDays ? `${statusDays.ok} / ${statusDays.n}` : '—' }}</span></div>
            <div class="row"><span class="k">Data pipeline</span><span class="v">4 runs/day · publishes only when every check passes</span></div>
            <div class="row"><span class="k">Checks passing this run</span><span class="v">{{ R && R.gating ? `${R.gating.filter((g) => g.status === 'pass').length} / ${R.gating.length}` : '—' }}</span></div>
            <div class="row"><span class="k">Independent cross-check</span><span class="v">supply re-read from a public RPC each run</span></div>
            <div class="row"><span class="k">Source code</span><span class="v"><a href="https://github.com/ogxrish/toke-explorer" target="_blank" rel="noopener">toke-explorer</a> · <a href="https://github.com/ogxrish/toke-status" target="_blank" rel="noopener">toke-status</a></span></div>
          </div>
          <div class="asof">Source: <a href="https://status.mctoken.xyz" target="_blank" rel="noopener">status.mctoken.xyz</a> (history) · reliability.json</div>
        </section>
      </div>

      <!-- 09 -->
      <section id="s9" class="sec">
        <p class="eyebrow"><i />09 · Risk factors</p>
        <h2>Plainly, <b>what could go wrong.</b></h2>
        <div class="risk"><div v-for="r in risks.items" :key="r.t"><b>{{ r.t }}</b>{{ r.d }}</div></div>
        <div class="asof">Owner-written · not counsel-reviewed · last edited {{ risks.lastEdited }}</div>
      </section>

      <!-- 10 -->
      <section id="s10" class="sec">
        <p class="eyebrow"><i />10 · Roadmap</p>
        <h2>Staged, <b>and honest about it.</b></h2>
        <div class="panel tl">
          <div v-for="it in roadmap.items" :key="it.t"><span class="d" :class="it.state.replace(' ', '-')">{{ it.state }}</span><span class="t"><b>{{ it.t }}.</b> {{ it.d }}</span></div>
        </div>
        <div class="asof">Revenue: none to date. Owner-maintained · last edited {{ roadmap.lastEdited }}</div>
      </section>

      <!-- 11 · 12 -->
      <div class="two">
        <section id="s11" class="sec">
          <p class="eyebrow"><i />11 · Contributors</p>
          <h2>Roles, <b>not identities.</b></h2>
          <div class="panel rows"><div v-for="c in contributors.items" :key="c.role" class="row"><span class="k">{{ c.role }}</span><span class="v">{{ c.who }}</span></div></div>
          <div class="asof">{{ contributors.note }} · last edited {{ contributors.lastEdited }}</div>
        </section>
        <section id="s12" class="sec">
          <p class="eyebrow"><i />12 · Disclosures &amp; archive</p>
          <h2>What this page <b>is not.</b></h2>
          <div class="panel body small">
            {{ disclosures.text }}
            <div class="archive">
              <span class="l">Quarterly editions (frozen data, JSON)</span>
              <a v-for="e in editions" :key="e" class="tag" :href="pdfUrl(e)" target="_blank" rel="noopener">{{ e }} ↗</a>
              <span v-if="!editions.length" class="tag no">first edition freezes at quarter close</span>
              <a class="tag" href="https://github.com/ogxrish/mctoken-site/commits/main/src/data/prospectus" target="_blank" rel="noopener">changelog ↗</a>
            </div>
          </div>
          <div class="asof">Last edited {{ disclosures.lastEdited }}</div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.iv { background: var(--mc-bg); color: var(--mc-text); font-family: var(--mc-sans); min-height: 100vh; }
.iv-nav { max-width: 1180px; margin: 0 auto; padding: 20px 22px; display: flex; align-items: center; gap: 24px; }
.iv-brand { display: flex; align-items: center; gap: 11px; text-decoration: none; color: var(--mc-text); }
.iv-brand img { border-radius: 8px; display: block; }
.iv-brand span { font-family: var(--mc-display); font-weight: 700; font-size: 19px; letter-spacing: -0.3px; }
.iv-space { flex: 1; }
.iv-links { display: flex; gap: 26px; margin-right: 6px; font-family: var(--mc-mono); font-size: 11.5px; letter-spacing: 2px; text-transform: uppercase; }
.iv-links a { color: var(--mc-mut); text-decoration: none; } .iv-links a.on, .iv-links a:hover { color: var(--mc-text); }
.iv-btn { font-family: var(--mc-display); font-size: 13.5px; font-weight: 600; border-radius: 10px; padding: 9px 16px; background: var(--mc-blue); color: var(--mc-blue-ink); text-decoration: none; white-space: nowrap; }
.iv-main { max-width: 1180px; margin: 0 auto; padding: 28px 22px 60px; }

.eyebrow { font-family: var(--mc-mono); font-size: 10.5px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); display: flex; align-items: center; gap: 8px; margin: 0; }
.eyebrow i { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.asof { font-family: var(--mc-mono); font-size: 10.5px; color: var(--mc-mut-2); letter-spacing: 0.5px; margin-top: 8px; }
.asof a { color: var(--mc-mut); text-decoration: none; }
h1 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(32px, 4.2vw, 46px); letter-spacing: -1.4px; line-height: 1.02; margin: 14px 0; }
h1 b, h2 b { color: var(--mc-blue); font-weight: 700; }
.lede { color: var(--mc-mut); font-size: 15px; line-height: 1.6; margin: 0; max-width: 560px; }
.iv-title { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; align-items: end; }
.panel { background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px; padding: 22px 24px; }
.badge { display: flex; flex-direction: column; gap: 12px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mc-mono); font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid var(--mc-line); border-radius: 999px; padding: 4px 10px; color: var(--mc-mut); }
.chip i { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-mut-2); }
.chip.ok { border-color: rgba(90, 209, 179, 0.35); color: var(--mc-teal); } .chip.ok i { background: var(--mc-teal); }
.chip.warn { border-color: rgba(231, 184, 74, 0.4); color: var(--mc-gold); } .chip.warn i { background: var(--mc-gold); }
.acts { display: flex; gap: 10px; flex-wrap: wrap; }
.ghost { font-family: var(--mc-display); font-size: 13px; font-weight: 500; border: 1px solid var(--mc-line-2); border-radius: 10px; padding: 8px 14px; color: var(--mc-text); background: var(--mc-panel-2); text-decoration: none; cursor: pointer; }
.ghost:hover { border-color: var(--mc-mut); }
.toc { margin: 30px 0 0; display: flex; gap: 18px; flex-wrap: wrap; font-family: var(--mc-mono); font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; border-top: 1px solid var(--mc-line); padding-top: 14px; }
.toc a { color: var(--mc-mut); text-decoration: none; } .toc a:hover { color: var(--mc-text); }

.sec { border-top: 1px solid var(--mc-line); padding: 34px 0 8px; }
.sec h2 { font-family: var(--mc-display); font-weight: 700; font-size: 26px; letter-spacing: -0.5px; margin: 6px 0 12px; }
.body { color: var(--mc-mut); font-size: 14px; line-height: 1.6; max-width: 760px; margin: 0 0 20px; }
.body.small { font-size: 12.5px; line-height: 1.6; margin: 12px 0 0; }
.body b { color: var(--mc-text); }
.note { color: var(--mc-mut); font-size: 13px; line-height: 1.55; margin: 12px 0 4px; }
.note b { color: var(--mc-text); font-family: var(--mc-mono, inherit); }
.tier { display: inline-block; min-width: 20px; padding: 2px 7px; border-radius: 6px; font-family: var(--mc-mono); font-size: 11px; text-align: center; border: 1px solid var(--mc-line); color: var(--mc-text); }
.tier.t1 { border-color: #9b8cff; color: #9b8cff; } .tier.t2 { border-color: #5aa2ff; color: #5aa2ff; } .tier.t3 { border-color: #5ad1b3; color: #5ad1b3; }
.ent { display: inline-flex; align-items: center; gap: 8px; }
.ent img { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
.pair { display: inline-flex; align-items: center; gap: 6px; }
.pair img { width: 16px; height: 16px; border-radius: 50%; object-fit: cover; background: #0a0c10; }
.pair img.q { margin-left: -9px; outline: 2px solid var(--mc-panel); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.two.tight { gap: 20px; }
.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.stat .l { font-family: var(--mc-mono); font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--mc-mut-2); }
.stat .n { font-family: var(--mc-mono); font-size: 21px; font-weight: 500; margin-top: 6px; letter-spacing: -0.5px; }
.stat .s { font-size: 10px; color: var(--mc-mut); margin-top: 3px; } .stat .s.up { color: var(--mc-teal); } .stat .s.down { color: #ff6b6b; }
.blue { color: var(--mc-blue); } .teal { color: var(--mc-teal); } .purple { color: var(--mc-purple); }
.rows { padding: 4px 24px; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 11px 0; border-top: 1px solid var(--mc-line); font-size: 13.5px; }
.row:first-child { border-top: 0; }
.row .k { color: var(--mc-mut); } .row .v { font-family: var(--mc-mono); font-size: 13.5px; text-align: right; }
.row .v small, .v small { font-size: 10.5px; color: var(--mc-mut); }
.classes { display: flex; flex-direction: column; gap: 12px; }
.classes .l { font-family: var(--mc-mono); font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--mc-mut-2); }
.bar { height: 10px; border-radius: 5px; background: var(--mc-panel-2); overflow: hidden; display: flex; }
.bar i { display: block; height: 100%; }
.legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 14px; font-size: 12px; color: var(--mc-mut); }
.legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 6px; } .legend b { color: var(--mc-text); font-family: var(--mc-mono); font-weight: 500; }
.scroll { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
th { font-family: var(--mc-mono); font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--mc-mut-2); text-align: left; font-weight: 500; padding: 0 8px 8px 0; }
td { padding: 9px 8px 9px 0; border-top: 1px solid var(--mc-line); vertical-align: top; }
td.r, th.r { text-align: right; } td.m, .m { font-family: var(--mc-mono); } .sub { font-size: 10.5px; color: var(--mc-mut-2); margin-top: 2px; word-break: break-all; }
td.sum { color: var(--mc-text); font-weight: 600; }
.tag { display: inline-block; font-family: var(--mc-mono); font-size: 10px; letter-spacing: 0.8px; text-transform: uppercase; padding: 2px 7px; border-radius: 6px; border: 1px solid var(--mc-line-2); color: var(--mc-mut); text-decoration: none; }
.tag.ok { color: var(--mc-teal); border-color: rgba(90, 209, 179, 0.35); } .tag.no { color: var(--mc-mut); }
.risk { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 4px; }
.risk div { background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 12px; padding: 14px 16px; font-size: 12.5px; line-height: 1.5; color: var(--mc-mut); }
.risk b { display: block; color: var(--mc-text); font-family: var(--mc-display); font-weight: 600; margin-bottom: 4px; }
.tl { display: flex; flex-direction: column; gap: 10px; }
.tl > div { display: flex; gap: 14px; align-items: flex-start; font-size: 13px; }
.tl .d { font-family: var(--mc-mono); color: var(--mc-blue); font-size: 11px; width: 92px; flex: 0 0 auto; padding-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
.tl .d.done { color: var(--mc-teal); } .tl .d.in-progress { color: var(--mc-gold); } .tl .d.later, .tl .d.optional { color: var(--mc-mut); }
.tl .t { color: var(--mc-mut); line-height: 1.5; } .tl .t b { color: var(--mc-text); }
.archive { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.archive .l { font-family: var(--mc-mono); font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--mc-mut-2); margin-right: 4px; }
a { color: var(--mc-blue); }

@media (max-width: 820px) {
  .iv-links { gap: 14px; }
  .iv-title, .two { grid-template-columns: 1fr; }
  td .sub.m { display: none; }
  td .sub { white-space: nowrap; }
  th, td { white-space: nowrap; }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .risk { grid-template-columns: 1fr; }
  .toc { display: none; }
}
@media print {
  .iv { background: #fff; color: #111; }
  .iv-nav, .toc, .acts, .iv-btn { display: none !important; }
  .panel, .risk div { background: #fff; border-color: #ccc; break-inside: avoid; }
  .sec { break-inside: avoid; border-top-color: #ddd; }
  .row .k, .body, .lede, .tl .t, .legend, .asof, .sub, th { color: #444; }
  h1 b, h2 b, .blue { color: #1f5fbf; } .teal, .tag.ok, .chip.ok { color: #0b7a5a; }
  a { color: #1f5fbf; text-decoration: none; }
  td.sum, .sum { color: #111 !important; }
  b, strong, .legend b, .note b, .tl .t b, .body b, .stat .l, .classes .l, .row .v, td, .m, .k, .risk b, .archive .l { color: #111; }
  .tag.no { color: #8a2b2b; border-color: #c99; } .tag, .chip { background: #fff; }
  .classes .bar { border: 1px solid #ccc; }
  .policy, .note { color: #333; }
  .pair img { background: #fff; outline-color: #fff; }
  @page { margin: 14mm; }
}
</style>
