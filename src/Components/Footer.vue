<script setup>
/* One bar that mirrors the header: brand · Explorer · Report · socials · status · disclaimer. Story is provenance and lives only in the Explorer. */
import { ref, onMounted } from 'vue'
import BrandLogoName from './BrandLogoName.vue'
import xIcon from '../assets/logos/socials/app-icons/x.png'
import discordIcon from '../assets/logos/socials/app-icons/discord.png'

const EXPLORER_URL = 'https://explorer.mctoken.xyz'
const X_URL = 'https://x.com/TokeCommunity'
const GROUP_URL = 'https://x.com/i/chat/group_join/g2102219613270610394/x2jHihm793'
const DISCORD_URL = 'https://discord.com/invite/gTYuUCthvC'
const STATUS_URL = 'https://status.mctoken.xyz'
const statusState = ref('idle')

onMounted(async () => {
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
      <div class="mcfoot-bar">
        <BrandLogoName variant="footer" />
        <nav class="mcfoot-links" aria-label="Footer">
          <a :href="EXPLORER_URL" target="_blank" rel="noopener">Explorer</a>
          <a href="/investors">Report</a>
        </nav>
        <span class="mcfoot-space" />
        <div class="mcfoot-social">
          <a :href="X_URL" target="_blank" rel="noopener" title="X" aria-label="X"><img :src="xIcon" alt="" width="20" height="20" loading="lazy" /></a>
          <a :href="GROUP_URL" target="_blank" rel="noopener" title="Group chat" aria-label="Group chat"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-4.6A8 8 0 1 1 21 12Z"/></svg></a>
          <a :href="DISCORD_URL" target="_blank" rel="noopener" title="Discord" aria-label="Discord"><img :src="discordIcon" alt="" width="20" height="20" loading="lazy" /></a>
        </div>
        <a class="mcfoot-status" :href="STATUS_URL" target="_blank" rel="noopener" :title="'Systems: ' + statusState">
          <span class="sdot" :class="statusState"></span>Status
        </a>
      </div>
      <p class="mcfoot-disc">Not financial advice. Verify on-chain, do your own research.</p>
    </div>
  </footer>
</template>

<style scoped>
.mcfoot { background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); }
.mcfoot-in { max-width: 1180px; margin: 0 auto; padding: 22px 22px 20px; }
.mcfoot-bar { display: flex; align-items: center; gap: 24px; }
.mcfoot-links { display: flex; gap: 22px; margin-left: 10px; font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
.mcfoot-links a { color: var(--mc-mut); text-decoration: none; transition: color 0.12s var(--mc-ease); }
.mcfoot-links a:hover { color: var(--mc-text); }
.mcfoot-space { flex: 1; }
.mcfoot-social { display: flex; gap: 8px; }
.mcfoot-social a { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--mc-line); background: var(--mc-panel); color: var(--mc-mut); text-decoration: none; transition: border-color 0.12s var(--mc-ease), color 0.12s var(--mc-ease); }
.mcfoot-social a:hover { border-color: var(--mc-mut); color: var(--mc-text); }
.mcfoot-social img { width: 20px; height: 20px; border-radius: 6px; object-fit: cover; display: block; }
.mcfoot-status { display: inline-flex; align-items: center; gap: 7px; font-family: var(--mc-mono); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--mc-mut); text-decoration: none; white-space: nowrap; }
.mcfoot-status:hover { color: var(--mc-text); }
.sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--mc-mut-2); }
.sdot.ok { background: #34d399; } .sdot.warn { background: #e7b84a; } .sdot.down { background: #ff6b6b; }
.mcfoot-disc { margin: 14px 0 0; font-size: 11px; color: var(--mc-mut-2); }
@media (max-width: 760px) {
  .mcfoot-bar { flex-wrap: wrap; gap: 14px; }
  .mcfoot-links { margin-left: 0; }
  .mcfoot-space { display: none; }
  .mcfoot-status { margin-left: auto; }
}
</style>
