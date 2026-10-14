<script setup>
/* Three equal doors: X, the group chat, Discord. */
import xIcon from '../../assets/logos/socials/app-icons/x.png';
import discordIcon from '../../assets/logos/socials/app-icons/discord.png';

const tiles = [
  { key: 'x', name: 'X', handle: '@TokeCommunity', line: 'The feed. Community-run, out loud.', cta: 'Follow', href: 'https://x.com/TokeCommunity', icon: xIcon },
  { key: 'group', name: 'Group chat', handle: '$TOKE UP · on X', line: 'Holders, mods and memes in one room.', cta: 'Join', href: 'https://x.com/i/chat/group_join/g2102219613270610394/x2jHihm793', icon: null },
  { key: 'discord', name: 'Discord', handle: 'McToken server', line: 'Voice, channels, the long conversations.', cta: 'Join', href: 'https://discord.com/invite/gTYuUCthvC', icon: discordIcon },
];
</script>

<template>
  <section class="cx">
    <div class="cx-in">
      <p class="cx-eyebrow"><span class="cx-dot" />Community</p>
      <div class="cx-grid">
        <a v-for="t in tiles" :key="t.key" class="cx-tile" :href="t.href" target="_blank" rel="noopener">
          <span class="cx-ico">
            <img v-if="t.icon" :src="t.icon" :alt="t.name" width="26" height="26" />
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-4.6A8 8 0 1 1 21 12Z"/></svg>
          </span>
          <span class="cx-txt">
            <span class="cx-name">{{ t.name }}</span>
            <span class="cx-handle">{{ t.handle }}</span>
            <span class="cx-line">{{ t.line }}</span>
          </span>
          <span class="cx-cta">{{ t.cta }} →</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cx { position: relative; background: var(--mc-bg); font-family: var(--mc-sans); color: var(--mc-text); }
.cx-in { max-width: 1180px; margin: 0 auto; padding: 0 22px 48px; }
.cx-eyebrow { font-family: var(--mc-mono); font-size: 10.5px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.cx-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.cx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cx-tile {
  display: flex; align-items: center; gap: 14px; text-decoration: none; color: var(--mc-text);
  background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px; padding: 18px 20px;
  transition: border-color 0.15s var(--mc-ease);
}
.cx-tile:hover { border-color: var(--mc-mut); }
.cx-ico { width: 44px; height: 44px; border-radius: 12px; background: var(--mc-panel-2); border: 1px solid var(--mc-line-2); display: flex; align-items: center; justify-content: center; flex: 0 0 auto; color: var(--mc-blue); }
.cx-ico img { width: 26px; height: 26px; border-radius: 7px; object-fit: cover; display: block; }
.cx-txt { display: flex; flex-direction: column; line-height: 1.3; flex: 1; min-width: 0; }
.cx-name { font-family: var(--mc-display); font-weight: 600; font-size: 15px; }
.cx-handle { font-family: var(--mc-mono); font-size: 11px; color: var(--mc-mut); margin-top: 1px; }
.cx-line { font-size: 12.5px; color: var(--mc-mut); margin-top: 5px; }
.cx-cta { font-family: var(--mc-display); font-size: 13px; font-weight: 500; color: var(--mc-blue); white-space: nowrap; }
@media (max-width: 820px) { .cx-grid { grid-template-columns: 1fr; } }
</style>
