<script setup>
import { ref, onMounted } from 'vue'
import BrandLogoName from './BrandLogoName.vue'
import logoToke from '../assets/logo.png'
import logoJupiter from '../assets/logos/trade/app-icons/jupiter.png'
import logoCoinbase from '../assets/logos/trade/app-icons/coinbase.png'
import logoOkx from '../assets/logos/trade/app-icons/okx.png'
import logoCmc from '../assets/logos/platforms/app-icons/coinmarketcap.png'
import logoDexscreener from '../assets/logos/platforms/app-icons/dexscreener.png'
import logoBirdeye from '../assets/logos/platforms/app-icons/birdeye.png'
import logoSolscan from '../assets/logos/explorers/app-icons/solscan.png'
import logoOrb from '../assets/logos/explorers/app-icons/orb.png'
import logoSolanaExplorer from '../assets/logos/explorers/app-icons/solana-explorer-icon-filled-256.png'
import logoX from '../assets/logos/socials/app-icons/x.png'
import logoDiscord from '../assets/logos/socials/app-icons/discord.png'

/* Official app icons (shipped in-repo) keyed by the label links.json uses — the shared directory stays
   plain data; each site decides how to draw it. */
const LOGOS = {
  'Home': logoToke, 'The Explorer': logoToke,
  'Jupiter': logoJupiter, 'Coinbase': logoCoinbase, 'OKX': logoOkx,
  'CoinMarketCap': logoCmc, 'Dexscreener': logoDexscreener, 'Birdeye': logoBirdeye,
  'Solscan': logoSolscan, 'Orb': logoOrb, 'Solana Explorer': logoSolanaExplorer,
  'X': logoX, 'Group chat': logoX, 'Discord': logoDiscord,
}
const logoFor = (link) => LOGOS[link.label] || (link.icon === 'x' ? logoX : link.icon === 'discord' ? logoDiscord : null)

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
    { label: 'Group chat', href: 'https://x.com/i/chat/group_join/g2102219613270610394/x2jHihm793', icon: 'x' },
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
          <div class="mcfoot-twins">
            <a class="mcfoot-cross" :href="EXPLORER_URL" target="_blank" rel="noopener">Open the Explorer ↗</a>
          </div>
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
              <img v-if="logoFor(link)" class="mcfoot-ico" :src="logoFor(link)" alt="" width="18" height="18" loading="lazy" decoding="async" />
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
.mcfoot-twins { display: flex; gap: 18px; flex-wrap: wrap; }
.mcfoot-cross { font-family: var(--mc-display); font-size: 13px; color: var(--mc-blue); text-decoration: none; font-weight: 500; }
.mcfoot-cross:hover { color: #74b1ff; }
.mcfoot-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 24px; }
.mcfoot-col h4 { font-family: var(--mc-display); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.4px; color: var(--mc-mut); margin: 0 0 14px; }
.mcfoot-col a { display: flex; align-items: center; gap: 7px; color: var(--mc-text); text-decoration: none; font-size: 13.5px; padding: 5px 0; transition: color 0.12s var(--mc-ease); }
.mcfoot-col a:hover { color: var(--mc-blue); }
.mcfoot-ico { width: 18px; height: 18px; border-radius: 5px; object-fit: cover; flex: 0 0 auto; opacity: 0.85; transition: opacity 0.12s var(--mc-ease); }
.mcfoot-col a:hover .mcfoot-ico { opacity: 1; }
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
