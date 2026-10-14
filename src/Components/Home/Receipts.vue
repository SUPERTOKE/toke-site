<script setup>
/* One panel, two columns: the receipts (what $TOKE is, with live facts) and the three steps to get it.
   Replaces the former "What is TOKE" + "How to buy" sections. */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { subscribeLiveStats } from '../../utils/liveStatsPoll';
import { statNum } from '../../utils/statsApi';
import { openBuyToke } from '../../lib/buyToke';
import phantom from '../../assets/logos/trade/app-icons/phantom.png';
import solflare from '../../assets/logos/trade/app-icons/solflare.png';
import backpack from '../../assets/logos/trade/app-icons/backpack.png';
import jupiter from '../../assets/logos/trade/app-icons/jupiter.png';
import coinbase from '../../assets/logos/trade/app-icons/coinbase.png';
import okx from '../../assets/logos/trade/app-icons/okx.png';
import cmc from '../../assets/logos/platforms/app-icons/coinmarketcap.png';
import dexscreener from '../../assets/logos/platforms/app-icons/dexscreener.png';
import birdeye from '../../assets/logos/platforms/app-icons/birdeye.png';
import solscan from '../../assets/logos/explorers/app-icons/solscan.png';
import orb from '../../assets/logos/explorers/app-icons/orb.png';
import solanaExplorer from '../../assets/logos/explorers/app-icons/solana-explorer-icon-filled-256.png';
import tokeMark from '../../assets/logo.png';

const MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';
const BUY_URL = `https://jup.ag/tokens/${MINT}`;
const EXPLORER_URL = 'https://explorer.mctoken.xyz';

const holdersStr = ref('—');
let unsub = null;
onMounted(() => {
  unsub = subscribeLiveStats(({ data, error }) => {
    if (error || !data) return;
    const n = statNum(data.holderCount ?? data.holders);
    if (Number.isFinite(n) && n > 0) holdersStr.value = Math.round(n).toLocaleString('en-US');
  });
});
onBeforeUnmount(() => { if (unsub) unsub(); unsub = null; });

const wallets = [
  { name: 'Phantom', logo: phantom },
  { name: 'Solflare', logo: solflare },
  { name: 'Backpack', logo: backpack },
];
const venues = [
  { name: 'Jupiter', logo: jupiter, href: BUY_URL },
  { name: 'Coinbase', logo: coinbase, href: 'https://www.coinbase.com/price/mctoken-solana-amgumqeqw8h74trc8ukkjzzwtxbdps496wh4gly2mcpo-token' },
  { name: 'OKX', logo: okx, href: `https://www.okx.com/en-us/trade-cedefi/solana/${MINT}` },
];
const markets = [
  { name: 'CoinMarketCap', logo: cmc, href: 'https://coinmarketcap.com/currencies/mctoken' },
  { name: 'Dexscreener', logo: dexscreener, href: 'https://dexscreener.com/solana/ad6negrxhsbagwfsttbshmkqgedhotcjzyfwcgrraxc9' },
  { name: 'Birdeye', logo: birdeye, href: `https://birdeye.so/token/${MINT}?chain=solana` },
];
const chain = [
  { name: 'Solscan', logo: solscan, href: `https://solscan.io/token/${MINT}` },
  { name: 'Orb', logo: orb, href: `https://orbmarkets.io/token/${MINT}` },
  { name: 'Solana Explorer', logo: solanaExplorer, href: `https://explorer.solana.com/address/${MINT}` },
];
const explorer = [{ name: 'The Explorer', logo: tokeMark, href: EXPLORER_URL }];
</script>

<template>
  <section class="rc" id="buy">
    <div class="rc-in">
      <div class="rc-panel">
        <div class="rc-col">
          <p class="rc-eyebrow"><span class="rc-dot" />Receipts</p>
          <h2 class="rc-h">Proof of <span class="b">meme.</span></h2>
          <ul class="rc-list">
            <li>
              <div><span class="rc-k">The meme</span><span class="rc-t">Moon Man, and a supply number that could only be a joke.</span></div>
              <div class="rc-right"><span class="rc-v">420,000,069</span><span class="rc-icons"><a v-for="m in markets" :key="m.name" :href="m.href" target="_blank" rel="noopener" :title="m.name"><img :src="m.logo" :alt="m.name" /></a></span></div>
            </li>
            <li>
              <div><span class="rc-k">The ledger</span><span class="rc-t">Every wallet that ever touched $TOKE, verifiable on the Explorer.</span></div>
              <div class="rc-right"><span class="rc-v">{{ holdersStr }} <small>holders</small></span><span class="rc-icons"><a v-for="e in explorer" :key="e.name" :href="e.href" target="_blank" rel="noopener" :title="e.name"><img :src="e.logo" :alt="e.name" /></a></span></div>
            </li>
            <li>
              <div><span class="rc-k">The rules</span><span class="rc-t">Mint authority revoked. Votes settle on-chain.</span></div>
              <div class="rc-right"><span class="rc-v rc-blue">fixed</span><span class="rc-icons"><a v-for="c in chain" :key="c.name" :href="c.href" target="_blank" rel="noopener" :title="c.name"><img :src="c.logo" :alt="c.name" /></a></span></div>
            </li>
          </ul>
          <a class="rc-link" :href="EXPLORER_URL" target="_blank" rel="noopener">See the proof on the Explorer →</a>
        </div>

        <div class="rc-col rc-col--buy">
          <p class="rc-eyebrow"><span class="rc-dot" />Get $TOKE</p>
          <h2 class="rc-h">Three <span class="b">steps.</span></h2>
          <ol class="rc-steps">
            <li>
              <span class="rc-n">01</span>
              <div><b>Get a Solana wallet.</b> <span>Free, a minute, a little SOL for fees.</span></div>
              <span class="rc-logos"><img v-for="w in wallets" :key="w.name" :src="w.logo" :alt="w.name" :title="w.name" /></span>
            </li>
            <li>
              <span class="rc-n">02</span>
              <div><b>Swap SOL → $TOKE.</b> <span>Right here, in-page. Fiat? Coinbase.</span></div>
              <span class="rc-logos"><a v-for="v in venues" :key="v.name" :href="v.href" target="_blank" rel="noopener" :title="v.name"><img :src="v.logo" :alt="v.name" /></a></span>
            </li>
            <li>
              <span class="rc-n">03</span>
              <div><b>Verify on the Explorer.</b> <span>Your wallet, and every other one.</span></div>
              <span class="rc-logos"><a :href="EXPLORER_URL" target="_blank" rel="noopener" title="The Explorer"><img :src="tokeMark" alt="The Explorer" /></a></span>
            </li>
          </ol>
          <div class="rc-cta">
            <a class="rc-btn" :href="BUY_URL" @click.prevent="openBuyToke" target="_blank" rel="noopener">Buy $TOKE →</a>
            <span class="rc-mono">{{ MINT.slice(0, 6) }}…{{ MINT.slice(-6) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rc { background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.rc-in { max-width: 1180px; margin: 0 auto; padding: 48px 22px; }
.rc-panel {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 18px; overflow: hidden;
}
.rc-col { padding: 30px 32px; display: flex; flex-direction: column; }
.rc-col--buy { border-left: 1px solid var(--mc-line); background: rgba(255, 255, 255, 0.015); }
.rc-eyebrow { font-family: var(--mc-mono); font-size: 10.5px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
.rc-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.rc-h { font-family: var(--mc-display); font-weight: 700; font-size: clamp(22px, 2.6vw, 30px); letter-spacing: -0.6px; margin: 0 0 20px; line-height: 1.05; }
.rc-h .b { color: var(--mc-blue); }

.rc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rc-list li { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 12px 0; border-top: 1px solid var(--mc-line); }
.rc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex: 0 0 auto; }
.rc-icons { display: flex; gap: 5px; }
.rc-icons img, .rc-logos img { width: 20px; height: 20px; border-radius: 6px; object-fit: cover; opacity: 0.8; transition: opacity 0.12s var(--mc-ease); display: block; }
.rc-icons a:hover img, .rc-logos a:hover img { opacity: 1; }
.rc-list li:last-child { border-bottom: 1px solid var(--mc-line); }
.rc-k { display: block; font-family: var(--mc-display); font-weight: 600; font-size: 14px; }
.rc-t { display: block; color: var(--mc-mut); font-size: 13px; line-height: 1.45; margin-top: 2px; }
.rc-v { font-family: var(--mc-mono); font-size: 15px; white-space: nowrap; letter-spacing: -0.3px; }
.rc-v small { font-size: 10px; color: var(--mc-mut); letter-spacing: 1px; text-transform: uppercase; margin-left: 3px; }
.rc-v.rc-blue { color: var(--mc-blue); }
.rc-link { margin-top: auto; padding-top: 18px; font-family: var(--mc-display); font-size: 13px; font-weight: 500; color: var(--mc-blue); text-decoration: none; }
.rc-link:hover { color: #74b1ff; }

.rc-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rc-steps li { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid var(--mc-line); font-size: 13.5px; }
.rc-steps li:last-child { border-bottom: 1px solid var(--mc-line); }
.rc-steps li > div { flex: 1; line-height: 1.45; }
.rc-steps b { font-family: var(--mc-display); font-weight: 600; }
.rc-steps span:not(.rc-n):not(.rc-logos) { color: var(--mc-mut); }
.rc-n { font-family: var(--mc-mono); font-size: 11px; color: var(--mc-blue); width: 22px; flex: 0 0 auto; }
.rc-logos { display: flex; gap: 6px; flex: 0 0 auto; }
.rc-cta { margin-top: auto; padding-top: 18px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.rc-btn { font-family: var(--mc-display); font-size: 14px; font-weight: 600; border-radius: 10px; padding: 11px 18px; background: var(--mc-blue); color: var(--mc-blue-ink); text-decoration: none; border: 1px solid var(--mc-blue); white-space: nowrap; }
.rc-btn:hover { background: #74b1ff; border-color: #74b1ff; }
.rc-mono { font-family: var(--mc-mono); font-size: 11.5px; color: var(--mc-mut-2); }

@media (max-width: 820px) {
  .rc-panel { grid-template-columns: 1fr; }
  .rc-col--buy { border-left: 0; border-top: 1px solid var(--mc-line); }
  .rc-col { padding: 24px 20px; }
  .rc-list li, .rc-steps li { align-items: flex-start; }
}
</style>
