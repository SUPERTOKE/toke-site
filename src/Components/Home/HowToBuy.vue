<script setup>
import { ref } from 'vue';
import phantom from '../../assets/logos/trade/app-icons/phantom.png';
import solflare from '../../assets/logos/trade/app-icons/solflare.png';
import backpack from '../../assets/logos/trade/app-icons/backpack.png';
import jupiter from '../../assets/logos/trade/app-icons/jupiter.png';
import coinbase from '../../assets/logos/trade/app-icons/coinbase.png';

const MINT = 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';
const BUY_URL = `https://jup.ag/tokens/${MINT}`;
const EXPLORER_URL = 'https://explorer.mctoken.xyz';
const copied = ref(false);

const wallets = [
  { name: 'Phantom', logo: phantom },
  { name: 'Solflare', logo: solflare },
  { name: 'Backpack', logo: backpack },
];
const venues = [
  { name: 'Jupiter', logo: jupiter },
  { name: 'Coinbase', logo: coinbase },
];

function copyMint() {
  try {
    navigator.clipboard?.writeText(MINT);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1100);
  } catch { /* clipboard unavailable */ }
}
</script>

<template>
  <section class="htb" id="buy">
    <div class="htb-in">
      <p class="htb-eyebrow"><span class="htb-dot" />Get $TOKE</p>
      <h2 class="htb-h2">Buy in <span class="b">three steps.</span></h2>
      <p class="htb-lede">$TOKE is an SPL token on Solana. If you’ve got a wallet and a few minutes, you’re set.</p>

      <div class="htb-steps">
        <div class="htb-step">
          <div class="htb-n">01</div>
          <h4>Get a Solana wallet</h4>
          <p>Phantom, Solflare, or Backpack — free, takes a minute. Fund it with a little SOL for fees.</p>
          <div class="htb-logos">
            <span v-for="w in wallets" :key="w.name" class="htb-logo" :title="w.name"><img :src="w.logo" :alt="w.name" /></span>
          </div>
        </div>
        <div class="htb-step">
          <div class="htb-n">02</div>
          <h4>Swap for $TOKE</h4>
          <p>Open Jupiter, paste the mint, swap SOL → $TOKE. Prefer fiat? Start on Coinbase.</p>
          <div class="htb-logos">
            <span v-for="v in venues" :key="v.name" class="htb-logo" :title="v.name"><img :src="v.logo" :alt="v.name" /></span>
          </div>
        </div>
        <div class="htb-step">
          <div class="htb-n">03</div>
          <h4>Verify on the explorer</h4>
          <p>See your wallet — and every other — on the explorer. Anonymous, verifiable, on-chain.</p>
          <a class="htb-mini" :href="EXPLORER_URL" target="_blank" rel="noopener">explorer.mctoken.xyz →</a>
        </div>
      </div>

      <div class="htb-cta">
        <a class="htb-btn htb-btn--primary" :href="BUY_URL" target="_blank" rel="noopener">Buy on Jupiter →</a>
        <span class="htb-mint">
          <span class="htb-mono">{{ MINT.slice(0, 6) }}…{{ MINT.slice(-6) }}</span>
          <button class="htb-copy" type="button" @click="copyMint">{{ copied ? 'copied ✓' : 'copy ⧉' }}</button>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.htb { position: relative; background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); }
.htb-in { max-width: 1180px; margin: 0 auto; padding: 72px 22px; }
.htb-eyebrow { font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 14px; display: flex; align-items: center; gap: 8px; justify-content: center; }
.htb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.htb-h2 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(28px, 4.5vw, 46px); letter-spacing: -1px; text-align: center; margin: 0 0 14px; line-height: 1.05; }
.htb-h2 .b { color: var(--mc-blue); }
.htb-lede { text-align: center; color: var(--mc-mut); max-width: 560px; margin: 0 auto 42px; font-size: 15.5px; line-height: 1.6; }
.htb-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 26px; }
.htb-step { background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px; padding: 22px; }
.htb-n { font-family: var(--mc-mono); font-size: 12px; color: var(--mc-blue); margin-bottom: 10px; }
.htb-step h4 { font-family: var(--mc-display); font-weight: 600; font-size: 16px; margin: 0 0 6px; }
.htb-step p { color: var(--mc-mut); font-size: 13.5px; line-height: 1.55; margin: 0 0 14px; }
.htb-logos { display: flex; gap: 10px; }
.htb-logo { width: 40px; height: 40px; border-radius: 11px; background: var(--mc-panel-2); border: 1px solid var(--mc-line-2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.htb-logo img { width: 26px; height: 26px; object-fit: contain; display: block; }
.htb-mini { font-family: var(--mc-mono); font-size: 12px; color: var(--mc-blue); text-decoration: none; }
.htb-mini:hover { text-decoration: underline; }
.htb-cta { display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }
.htb-btn { font-family: var(--mc-display); font-size: 15px; font-weight: 500; border-radius: 10px; padding: 12px 20px; border: 1px solid var(--mc-line-2); background: var(--mc-panel-2); color: var(--mc-text); text-decoration: none; }
.htb-btn--primary { background: var(--mc-blue); border-color: var(--mc-blue); color: var(--mc-blue-ink); font-weight: 600; }
.htb-btn--primary:hover { background: #74b1ff; }
.htb-mint { display: inline-flex; align-items: center; gap: 8px; font-family: var(--mc-mono); font-size: 12px; color: var(--mc-mut-2); }
.htb-mono { font-family: var(--mc-mono); }
.htb-copy { border: 1px solid var(--mc-line-2); border-radius: 6px; padding: 3px 8px; color: var(--mc-mut); cursor: pointer; background: transparent; font-family: var(--mc-mono); font-size: 11px; }
.htb-copy:hover { color: var(--mc-text); border-color: var(--mc-mut); }
@media (max-width: 760px) { .htb-steps { grid-template-columns: 1fr; } }
</style>
