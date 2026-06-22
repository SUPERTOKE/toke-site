<script setup>
import { ref, onMounted } from 'vue'
import BrandLogoName from './BrandLogoName.vue'

const EXPLORER_URL = 'https://explorer.mctoken.xyz'
const LINKS_URL = `${EXPLORER_URL}/api/v1/links.json`

/* Built-in fallback = canonical footer directory (mirrors links.json). Renders instantly; the
   fetch below just keeps it fresh from the shared source so the two sites never drift. */
const FALLBACK = [
  { title: 'Trade', links: [
    { label: 'Jupiter', href: 'https://jup.ag/tokens/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
    { label: 'Coinbase', href: 'https://www.coinbase.com/price/mctoken-solana-amgumqeqw8h74trc8ukkjzzwtxbdps496wh4gly2mcpo-token' },
    { label: 'OKX', href: 'https://www.okx.com/en-us/trade-cedefi/solana/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
  ]},
  { title: 'Markets', links: [
    { label: 'CoinMarketCap', href: 'https://coinmarketcap.com/currencies/mctoken' },
    { label: 'Dexscreener', href: 'https://dexscreener.com/solana/ad6negrxhsbagwfsttbshmkqgedhotcjzyfwcgrraxc9' },
    { label: 'Birdeye', href: 'https://birdeye.so/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo?chain=solana' },
  ]},
  { title: 'Chain', links: [
    { label: 'Solscan', href: 'https://solscan.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
    { label: 'Orb', href: 'https://orbmarkets.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
    { label: 'Solana Explorer', href: 'https://explorer.solana.com/address/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
  ]},
  { title: 'Connect', links: [
    { label: 'X', href: 'https://x.com/TokeCommunity', icon: 'x' },
    { label: 'Discord', href: 'https://discord.com/invite/gTYuUCthvC', icon: 'discord' },
  ]},
]

const columns = ref(FALLBACK)
const statusUrl = ref('https://status.mctoken.xyz')
const statusState = ref('idle')

onMounted(async () => {
  try {
    const r = await fetch(LINKS_URL, { cache: 'no-cache' })
    const j = await r.json()
    if (j?.footer?.columns?.length) columns.value = j.footer.columns
    if (j?.status?.href) statusUrl.value = j.status.href
  } catch { /* keep fallback */ }
  try {
    const sr = await fetch('https://status.mctoken.xyz/api/history', { cache: 'no-store' })
    const sj = await sr.json()
    if (sj?.current?.overall) statusState.value = sj.current.overall
  } catch { /* dot stays idle */ }
})
</script>

<template>
  <footer class="mcfoot">
    <div class="mcfoot-in">
      <div class="mcfoot-grid">
        <div class="mcfoot-brand">
          <BrandLogoName variant="footer" />
          <p class="mcfoot-tag">The honest memecoin on Solana — anonymous, verifiable, on-chain.</p>
          <a class="mcfoot-cross" :href="EXPLORER_URL" target="_blank" rel="noopener">Open the Explorer ↗</a>
        </div>

        <nav class="mcfoot-cols" aria-label="Footer links">
          <div v-for="col in columns" :key="col.title" class="mcfoot-col">
            <h4>{{ col.title }}</h4>
            <a
              v-for="link in col.links"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
            >
              <svg v-if="link.icon === 'x'" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <svg v-else-if="link.icon === 'discord'" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.225.645-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span>{{ link.label }}</span>
            </a>
          </div>
        </nav>
      </div>

      <div class="mcfoot-base">
        <a class="mcfoot-status" :href="statusUrl" target="_blank" rel="noopener" :title="'Systems: ' + statusState">
          <span class="sdot" :class="statusState"></span>Status
        </a>
        <span class="mcfoot-disc">Informational only — not financial advice. $TOKE is a community token; always verify on-chain and do your own research.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.mcfoot { background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); }
.mcfoot-in { max-width: 1180px; margin: 0 auto; padding: 56px 22px 44px; }
.mcfoot-grid { display: grid; grid-template-columns: 1.5fr 2.5fr; gap: 40px; }
.mcfoot-tag { color: var(--mc-mut); font-size: 13px; line-height: 1.6; margin: 16px 0 14px; max-width: 280px; }
.mcfoot-cross { font-family: var(--mc-display); font-size: 13px; color: var(--mc-blue); text-decoration: none; font-weight: 500; }
.mcfoot-cross:hover { color: #74b1ff; }
.mcfoot-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.mcfoot-col h4 { font-family: var(--mc-display); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.4px; color: var(--mc-mut); margin: 0 0 14px; }
.mcfoot-col a { display: flex; align-items: center; gap: 7px; color: var(--mc-text); text-decoration: none; font-size: 13.5px; padding: 5px 0; transition: color 0.12s var(--mc-ease); }
.mcfoot-col a:hover { color: var(--mc-blue); }
.mcfoot-col a svg { color: var(--mc-mut); flex: 0 0 auto; }
.mcfoot-col a:hover svg { color: var(--mc-blue); }
.mcfoot-base { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--mc-line); font-size: 11.5px; color: var(--mc-mut-2); }
.mcfoot-disc { max-width: 560px; }
.mcfoot-status { display: inline-flex; align-items: center; gap: 7px; font-family: var(--mc-mono); font-size: 11.5px; color: var(--mc-mut); text-decoration: none; white-space: nowrap; }
.mcfoot-status:hover { color: var(--mc-text); }
.sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--mc-mut-2); }
.sdot.ok { background: #34d399; } .sdot.warn { background: #e7b84a; } .sdot.down { background: #ff6b6b; }
@media (max-width: 760px) {
  .mcfoot-grid { grid-template-columns: 1fr; gap: 28px; }
  .mcfoot-cols { grid-template-columns: repeat(2, 1fr); }
  .mcfoot-disc { text-align: left; }
}
</style>
