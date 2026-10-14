<script setup>
import moonman from '../../assets/moonman-head.png';

const X_URL = 'https://x.com/TokeCommunity';
const DISCORD_URL = 'https://discord.com/invite/gTYuUCthvC';

/* Featured post — curated highlight, rendered in-brand (editorial, always clean).
   Swap this for the latest post later if we wire the X API behind the same card. */
const featured = {
  text: 'Great McVote #3 PASSED — the McVault is OPEN. Third time was the charm: the community banded together year after year, 69% voted YES, and ~6.78% of supply unlocked. A new era begins.',
  date: 'Apr 23, 2026',
  url: X_URL,
};
</script>

<template>
  <section class="cx">
    <div class="cx-in">
      <p class="cx-eyebrow"><span class="cx-dot" />On X</p>
      <h2 class="cx-h2">Join the <span class="b">community.</span></h2>
      <p class="cx-lede">$TOKE is community-run — it happens out loud on X. Follow along and jump in.</p>

      <div class="cx-grid">
        <div class="cx-card cx-account">
          <div class="cx-id">
            <img class="cx-avatar" :src="moonman" alt="McToken on X" width="56" height="56" />
            <div>
              <div class="cx-name">TOKE | McToken</div>
              <div class="cx-handle">@TokeCommunity</div>
            </div>
          </div>
          <p class="cx-bio">Drifting moonward. 🌕 A community-run memecoin on Solana — the vault is open, a new era begins.</p>
          <div class="cx-actions">
            <a class="cx-btn cx-btn--primary" :href="X_URL" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow on X
            </a>
            <a class="cx-btn" :href="DISCORD_URL" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.225.645-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Discord
            </a>
          </div>
        </div>

        <a class="cx-card cx-post" :href="featured.url" target="_blank" rel="noopener">
          <div class="cx-post-head">
            <img class="cx-post-avatar" :src="moonman" alt="" width="34" height="34" />
            <div class="cx-post-id">
              <span class="cx-post-name">TOKE | McToken</span>
              <span class="cx-post-handle">@TokeCommunity · {{ featured.date }}</span>
            </div>
            <span class="cx-pinned">📌 Pinned</span>
          </div>
          <p class="cx-post-text">{{ featured.text }}</p>
          <span class="cx-post-cta">View on X →</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cx { position: relative; background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.cx-in { max-width: 1180px; margin: 0 auto; padding: 72px 22px; }
.cx-eyebrow { font-family: var(--mc-mono); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 14px; display: flex; align-items: center; gap: 8px; justify-content: center; }
.cx-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mc-teal); }
.cx-h2 { font-family: var(--mc-display); font-weight: 700; font-size: clamp(28px, 4.5vw, 46px); letter-spacing: -1px; text-align: center; margin: 0 0 14px; line-height: 1.05; color: var(--mc-text); }
.cx-h2 .b { color: var(--mc-blue); }
.cx-lede { text-align: center; color: var(--mc-mut); max-width: 520px; margin: 0 auto 42px; font-size: 15.5px; line-height: 1.6; }
.cx-grid { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 16px; align-items: stretch; }
.cx-card { background: var(--mc-panel); border: 1px solid var(--mc-line); border-radius: 16px; padding: 22px; }
.cx-account { display: flex; flex-direction: column; }
.cx-id { display: flex; align-items: center; gap: 12px; }
.cx-avatar { border-radius: 50%; display: block; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12); }
.cx-name { font-family: var(--mc-display); font-weight: 600; font-size: 16px; }
.cx-handle { font-size: 13px; color: var(--mc-mut); font-family: var(--mc-mono); }
.cx-bio { color: var(--mc-mut); font-size: 14px; line-height: 1.6; margin: 16px 0 20px; }
.cx-actions { display: flex; gap: 10px; margin-top: auto; flex-wrap: wrap; }
.cx-btn { display: inline-flex; align-items: center; gap: 8px; font-family: var(--mc-display); font-size: 14px; font-weight: 500; border-radius: 10px; padding: 10px 16px; border: 1px solid var(--mc-line-2); background: var(--mc-panel-2); color: var(--mc-text); text-decoration: none; transition: border-color 0.15s var(--mc-ease), background 0.15s var(--mc-ease); }
.cx-btn:hover { border-color: var(--mc-mut); }
.cx-btn--primary { background: var(--mc-blue); border-color: var(--mc-blue); color: var(--mc-blue-ink); font-weight: 600; }
.cx-btn--primary:hover { background: #74b1ff; }
.cx-post { display: flex; flex-direction: column; text-decoration: none; color: var(--mc-text); transition: border-color 0.15s var(--mc-ease); }
.cx-post:hover { border-color: var(--mc-line-2); }
.cx-post-head { display: flex; align-items: center; gap: 10px; }
.cx-post-avatar { border-radius: 50%; display: block; }
.cx-post-id { display: flex; flex-direction: column; line-height: 1.3; }
.cx-post-name { font-family: var(--mc-display); font-weight: 600; font-size: 14px; }
.cx-post-handle { font-size: 12px; color: var(--mc-mut); font-family: var(--mc-mono); }
.cx-pinned { margin-left: auto; font-size: 11px; color: var(--mc-mut-2); font-family: var(--mc-mono); }
.cx-post-text { font-size: 15px; line-height: 1.55; color: var(--mc-text); margin: 14px 0 0; }
.cx-post-cta { margin-top: auto; padding-top: 16px; font-family: var(--mc-display); font-size: 13px; font-weight: 500; color: var(--mc-blue); }
@media (max-width: 760px) { .cx-grid { grid-template-columns: 1fr; } }
</style>
