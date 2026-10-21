<script setup>
/* Shared chrome (public/chrome.css): brand · Home · Explorer · Report · socials · status · disclaimer. Story is provenance and lives only in the Explorer. */
import { ref, onMounted } from 'vue'
import moonman from '../assets/moonman-head.png'
import xIcon from '../assets/logos/socials/app-icons/x.png'
import discordIcon from '../assets/logos/socials/app-icons/discord.png'

const EXPLORER_URL = 'https://mctoken.xyz/explorer/'
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
  <footer class="mcx-foot">
    <div class="mcx-foot-in">
      <div class="mcx-foot-bar">
        <a class="mcx-brand" href="/"><img :src="moonman" alt="McToken" width="34" height="34" /><span>McToken</span></a>
        <nav class="mcx-links" aria-label="Footer">
          <a href="/">Home</a>
          <a :href="EXPLORER_URL">Explorer</a>
          <a href="/investors">Report</a>
        </nav>
        <span class="mcx-space" />
        <div class="mcx-social">
          <a :href="X_URL" target="_blank" rel="noopener" title="X" aria-label="X"><img :src="xIcon" alt="" width="20" height="20" loading="lazy" /></a>
          <a :href="GROUP_URL" target="_blank" rel="noopener" title="Group chat" aria-label="Group chat"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-4.6A8 8 0 1 1 21 12Z"/></svg></a>
          <a :href="DISCORD_URL" target="_blank" rel="noopener" title="Discord" aria-label="Discord"><img :src="discordIcon" alt="" width="20" height="20" loading="lazy" /></a>
        </div>
        <a class="mcx-status" :href="STATUS_URL" target="_blank" rel="noopener" :title="'Systems: ' + statusState">
          <span class="mcx-sdot" :class="statusState"></span>Status
        </a>
      </div>
      <p class="mcx-disc">Not financial advice. Verify on-chain, do your own research.</p>
    </div>
  </footer>
</template>

