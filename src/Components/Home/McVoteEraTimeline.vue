<script setup>
import { ERA_TIMELINE } from '../../data/mcVoteEraTimeline.js';

/**
 * Slim teaser. The full, interactive Great McVote breakdown (quorum bars, exact
 * on-chain results, per-wallet Voted/NFT filtering) now lives on the explorer:
 * explorer.mctoken.xyz/#mcvault-era. This homepage section keeps the narrative beat
 * + the three medals, and links out — single source of truth = the explorer.
 */
const EXPLORER_MCVAULT_URL = 'https://explorer.mctoken.xyz/#mcvault-era';

const MCVAULT_INTRO_LEAD =
  'A critical mistake once left 7% of tokens locked on-chain.';
const MCVAULT_INTRO_BODY =
  'Unlocking it required a full 60% of the $TOKE supply to vote Yes during the annual 4/20 Great McVote.';
const MCVAULT_INTRO_PAYOFF =
  'In the 3rd year, the McVault was finally cracked.';
</script>

<template>
  <section
    id="TheMcVaultEra"
    class="relative scroll-mt-[calc(5.25rem+env(safe-area-inset-top,0px))] py-12 sm:py-16 md:py-20"
    aria-labelledby="the-mcvault-era-title"
  >
    <div class="relative container mx-auto px-3.5 sm:px-6 max-w-3xl">
      <div
        class="flex flex-col items-center text-center space-y-8 sm:space-y-10 w-full"
      >
        <p
          id="the-mcvault-era-title"
          class="font-orbitron text-[1.65rem] min-[400px]:text-3xl sm:text-5xl md:text-6xl font-semibold text-center pb-1 relative leading-tight tracking-wide"
        >
          <span class="text-white">MCVAULT ERA</span>
        </p>

        <div class="mx-auto w-full max-w-2xl space-y-4 px-1 text-center sm:space-y-5">
          <p
            class="font-exo m-0 text-[0.9375rem] leading-relaxed sm:text-base [text-wrap:balance]"
          >
            <span class="text-neutral-300">{{ MCVAULT_INTRO_LEAD }}</span><span class="text-neutral-400">{{ ' ' + MCVAULT_INTRO_BODY }}</span>
          </p>
          <p
            class="font-exo m-0 text-[0.9375rem] font-medium leading-relaxed text-emerald-50 sm:text-base [text-wrap:balance] drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
          >
            {{ MCVAULT_INTRO_PAYOFF }}
          </p>
        </div>

        <ul
          class="flex items-end justify-center gap-3 sm:gap-5 list-none p-0 m-0"
          aria-label="The three Great McVote commemorative medals"
        >
          <li
            v-for="row in ERA_TIMELINE"
            :key="row.id"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="relative block h-[7.75rem] w-[5.875rem] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:h-[9.5rem] sm:w-[7.25rem]"
            >
              <img
                :src="row.commemorativeArt"
                :alt="`Commemorative art for ${row.mcVoteLabel}`"
                class="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span
              class="font-orbitron text-xs uppercase tracking-[0.1em] text-sky-300/90"
            >{{ row.year }} · {{ row.eraName }}</span>
          </li>
        </ul>

        <a
          :href="EXPLORER_MCVAULT_URL"
          target="_blank"
          rel="noopener"
          class="group inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 font-orbitron text-sm font-semibold uppercase tracking-wide text-emerald-50 transition hover:border-emerald-300/70 hover:bg-emerald-400/20 sm:text-base"
        >
          Explore the Great McVote
          <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
        <p class="font-exo m-0 text-xs text-neutral-500 [text-wrap:balance]">
          Quorum tracking, exact on-chain results, and every voter &amp; medal — live on the explorer.
        </p>
      </div>
    </div>
  </section>
</template>
