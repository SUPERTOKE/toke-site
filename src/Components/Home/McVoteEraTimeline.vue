<script setup>
import { ERA_TIMELINE } from '../../data/mcVoteEraTimeline.js';

/**
 * Slim provenance feature bar. The full interactive Great McVote breakdown
 * (quorum bars, exact on-chain results, per-wallet Voted/NFT filtering) lives on
 * the explorer provenance bar — single source of truth. This bar gives the saga
 * its visual beat (the three commemorative medals) right after the receipts
 * section, then hands off.
 */
const EXPLORER_MCVAULT_URL = 'https://explorer.mctoken.xyz/#mcvault-era';
</script>

<template>
  <section class="mvb" id="TheMcVaultEra" aria-labelledby="mvb-title">
    <div class="mvb-in">
      <div class="mvb-bar">
        <ul class="mvb-medals" aria-label="The three Great McVote commemorative medals">
          <li v-for="row in ERA_TIMELINE" :key="row.id" class="mvb-medal" :class="{ win: row.id === 'community' }">
            <img
              :src="row.commemorativeArt"
              :alt="`Commemorative art for ${row.mcVoteLabel}`"
              loading="lazy"
              decoding="async"
            />
            <span class="mvb-yr">'{{ String(row.year).slice(-2) }}</span>
          </li>
        </ul>

        <div class="mvb-txt">
          <p class="mvb-eyebrow"><span class="mvb-dot" />The Great McVote</p>
          <h2 id="mvb-title" class="mvb-h">A vault the community <span class="b">cracked on the third try.</span></h2>
          <p class="mvb-sub">
            7% of supply locked by an early mistake. Three annual 4/20 votes to free it.
            In 2026, quorum finally hit — and the McVault opened.
          </p>
        </div>

        <a class="mvb-go" :href="EXPLORER_MCVAULT_URL" target="_blank" rel="noopener">
          Explore <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mvb { background: var(--mc-bg); border-top: 1px solid var(--mc-line); font-family: var(--mc-sans); color: var(--mc-text); }
.mvb-in { max-width: 1180px; margin: 0 auto; padding: 30px 22px; }
.mvb-bar {
  display: flex; align-items: center; gap: 26px;
  background:
    radial-gradient(120% 160% at 0% 0%, rgba(90, 162, 255, 0.06), transparent 60%),
    var(--mc-panel);
  border: 1px solid var(--mc-line); border-radius: var(--mc-r-lg); padding: 20px 24px;
}
.mvb-medals { display: flex; align-items: flex-end; gap: 9px; list-style: none; margin: 0; padding: 0; flex: 0 0 auto; }
.mvb-medal { position: relative; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.mvb-medal img {
  height: 64px; width: 48px; object-fit: contain; object-position: center;
  border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.14); background: rgba(0, 0, 0, 0.4);
  display: block;
}
.mvb-medal.win img { border-color: rgba(231, 184, 74, 0.5); box-shadow: inset 0 0 0 1px rgba(231, 184, 74, 0.22); }
.mvb-yr { font-family: var(--mc-mono); font-size: 9.5px; color: var(--mc-blue); }

.mvb-txt { flex: 1; min-width: 0; }
.mvb-eyebrow { font-family: var(--mc-mono); font-size: 10px; letter-spacing: 2.2px; text-transform: uppercase; color: var(--mc-blue); margin: 0 0 7px; display: flex; align-items: center; gap: 7px; }
.mvb-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--mc-teal); }
.mvb-h { font-family: var(--mc-display); font-weight: 600; font-size: clamp(17px, 2.2vw, 21px); letter-spacing: -0.3px; margin: 0 0 5px; line-height: 1.15; color: var(--mc-text); }
.mvb-h .b { color: var(--mc-blue); }
.mvb-sub { font-size: 13px; line-height: 1.5; color: var(--mc-mut); margin: 0; max-width: 580px; }

.mvb-go {
  flex: 0 0 auto; display: inline-flex; align-items: center; gap: 7px;
  border: 1px solid rgba(90, 162, 255, 0.4); background: rgba(90, 162, 255, 0.1);
  border-radius: 11px; padding: 11px 17px;
  font-family: var(--mc-display); font-size: 13px; font-weight: 600; color: #dbe8ff;
  text-decoration: none; white-space: nowrap; transition: background 0.15s var(--mc-ease), border-color 0.15s var(--mc-ease);
}
.mvb-go:hover { background: rgba(90, 162, 255, 0.2); border-color: rgba(90, 162, 255, 0.7); }

@media (max-width: 760px) {
  .mvb-bar { flex-wrap: wrap; gap: 16px; }
  .mvb-medals { order: 1; }
  .mvb-txt { order: 2; flex-basis: 100%; }
  .mvb-go { order: 3; width: 100%; justify-content: center; }
}
</style>
