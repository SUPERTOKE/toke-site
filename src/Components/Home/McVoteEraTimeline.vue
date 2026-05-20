<script setup>
import McVoteSupplyBar from './McVoteSupplyBar.vue';
import VrfdTweetFeed from './VrfdTweetFeed.vue';
import { ERA_TIMELINE } from '../../data/mcVoteEraTimeline.js';

const yesLabel = (n) => `${n}%`;

/** Great McVote #3 (community era) with quorum — restore emerald glow on label + %. */
const isCommunityWin = (row) => row.id === 'community' && row.yesPercent >= 60;

/** Same sky/indigo halo as 2024 on every year — ecosystem/community-only gradients read too faint on this bg. */
const yearGlowClass =
  'bg-gradient-to-br from-sky-400/45 from-0% via-sky-500/35 to-indigo-500/40';

const MCVAULT_INTRO_LEAD =
  "Early in TOKE's history, a critical mistake left 7% of the token supply locked behind a smart-contract.";
const MCVAULT_INTRO_BODY =
  'Unlocking it required that 60% of the entire TOKE supply vote Yes on-chain, leading to the annual 4/20 Great McVote.';
const MCVAULT_INTRO_PAYOFF =
  'In the 3rd year, the McVault was finally cracked by TOKE holders.';
</script>

<template>
  <section
    id="TheMcVaultEra"
    class="relative scroll-mt-[calc(5.25rem+env(safe-area-inset-top,0px))] pt-12 pb-0 sm:pt-16 md:pt-24"
    aria-labelledby="the-mcvault-era-title"
  >
    <div class="relative container mx-auto px-3.5 sm:px-6 max-w-7xl">
      <div
        class="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full mb-8 sm:mb-10 md:mb-12 px-0.5 sm:px-1"
      >
        <p
          id="the-mcvault-era-title"
          class="font-orbitron text-[1.65rem] min-[400px]:text-3xl sm:text-5xl md:text-6xl font-semibold text-center pb-1 relative leading-tight tracking-wide"
        >
          <span class="text-white">MCVAULT ERA</span>
        </p>
        <div class="mx-auto w-full max-w-2xl space-y-4 px-1 text-center sm:space-y-5 sm:px-2">
          <p
            class="font-exo m-0 text-[0.9375rem] leading-relaxed sm:text-base [text-wrap:balance]"
          >
            <span class="text-neutral-300">{{ MCVAULT_INTRO_LEAD }}</span><span class="text-neutral-400">{{ ' ' + MCVAULT_INTRO_BODY }}</span>
          </p>
          <p
            class="font-exo m-0 text-[0.9375rem] leading-relaxed text-neutral-300 sm:text-base [text-wrap:balance]"
          >
            {{ MCVAULT_INTRO_PAYOFF }}
          </p>
        </div>
      </div>

      <ul
        class="flex flex-col gap-3 md:gap-3 list-none p-0 m-0 w-full"
        aria-label="Great McVote results by year"
      >
        <li
          v-for="row in ERA_TIMELINE"
          :key="row.id"
          class="w-full"
        >
          <div
            class="flex w-full min-w-0 flex-col gap-0 rounded-2xl border border-white/[0.07] bg-neutral-900/35 p-3 antialiased shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-md sm:p-5 sm:backdrop-blur-md md:p-6"
          >
            <!-- Mobile: vertical result card -->
            <div class="flex w-full min-w-0 flex-col gap-3.5 md:hidden">
              <div class="flex min-w-0 items-center gap-3 sm:gap-4">
                <div
                  class="relative flex h-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-neutral-950/80 px-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-sm sm:h-14 sm:px-3.5"
                >
                  <span
                    class="relative inline-flex shrink-0 items-baseline tabular-nums font-orbitron text-sm normal-case tracking-[0.1em] text-sky-400/90 sm:text-base"
                  >
                    <span
                      class="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-lg blur-xl"
                      :class="yearGlowClass"
                      aria-hidden="true"
                    />
                    <span
                      class="relative z-[1] leading-none drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                    >{{ row.year }}</span>
                  </span>
                </div>
                <div
                  class="flex min-h-12 min-w-0 flex-1 flex-col justify-center font-orbitron text-sm normal-case tracking-[0.1em] text-sky-400/90 sm:min-h-14 sm:text-base"
                >
                  <span class="leading-none uppercase text-sky-300/95">{{ row.eraName }}</span>
                </div>
                <span
                  :class="[
                    'ml-auto shrink-0 pl-2 font-orbitron text-sm font-semibold tabular-nums leading-none tracking-normal whitespace-nowrap sm:text-base [text-shadow:0_1px_2px_rgba(0,0,0,0.82)]',
                    row.yesPercent >= 60
                      ? 'text-emerald-50'
                      : 'text-neutral-50',
                    isCommunityWin(row)
                      ? 'drop-shadow-[0_0_14px_rgba(52,211,153,0.55)]'
                      : '',
                  ]"
                >{{ yesLabel(row.yesPercent) }}</span>
              </div>

              <McVoteSupplyBar
                layout="stacked"
                :yes-percent="row.yesPercent"
                :not-voted-percent="row.notVotedPercent"
                :emerald-mc-vault="row.yesPercent >= 60"
              />

              <p
                :class="[
                  'm-0 rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2.5 text-center font-orbitron text-sm font-semibold uppercase leading-snug tracking-normal text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.82)] sm:text-base',
                  row.yesPercent >= 60
                    ? 'text-emerald-50'
                    : 'text-neutral-50',
                  isCommunityWin(row)
                    ? 'drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]'
                    : '',
                ]"
              >
                {{ row.mcVoteLabel }}
              </p>

              <div
                class="mx-auto w-full max-w-[11.5rem] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <div class="relative aspect-[662/1024] w-full bg-black/40">
                  <img
                    :src="row.commemorativeArt"
                    :alt="`Commemorative art for ${row.mcVoteLabel}`"
                    class="absolute inset-0 h-full w-full object-contain object-center p-0.5 opacity-100"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <!-- Desktop: stretch row; left column = era row + bar (bar bottom = poster bottom) -->
            <div class="relative hidden w-full min-w-0 md:block">
              <div
                class="relative flex w-full min-w-0 flex-nowrap items-stretch gap-4 md:justify-between md:gap-6"
              >
                <div class="relative z-[2] flex min-w-0 flex-1 flex-col justify-between gap-0">
                  <div class="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4">
                    <div
                      class="relative flex h-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-neutral-950/80 px-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-sm sm:h-14 sm:px-3.5"
                    >
                      <span
                        class="relative inline-flex shrink-0 items-baseline tabular-nums font-orbitron text-sm normal-case tracking-[0.1em] text-sky-400/90 sm:text-base"
                      >
                        <span
                          class="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-lg blur-xl"
                          :class="yearGlowClass"
                          aria-hidden="true"
                        />
                        <span
                          class="relative z-[1] leading-none drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                        >{{ row.year }}</span>
                      </span>
                    </div>
                    <div
                      class="flex min-h-12 min-w-0 flex-1 flex-col justify-center font-orbitron text-sm normal-case tracking-[0.1em] text-sky-400/90 sm:min-h-14 sm:text-base"
                    >
                      <span
                        class="inline-block leading-none uppercase text-sky-300/95 pl-20 sm:pl-24"
                      >{{ row.eraName }}</span>
                    </div>
                    <span
                      :class="[
                        'ml-auto shrink-0 pl-2 font-orbitron text-sm font-semibold tabular-nums leading-none tracking-normal whitespace-nowrap sm:text-base [text-shadow:0_1px_2px_rgba(0,0,0,0.82)]',
                        row.yesPercent >= 60
                          ? 'text-emerald-50'
                          : 'text-neutral-50',
                        isCommunityWin(row)
                          ? 'drop-shadow-[0_0_14px_rgba(52,211,153,0.55)]'
                          : '',
                      ]"
                    >{{ yesLabel(row.yesPercent) }}</span>
                  </div>

                  <div class="w-full min-w-0 shrink-0">
                    <McVoteSupplyBar
                      :yes-percent="row.yesPercent"
                      :not-voted-percent="row.notVotedPercent"
                      :emerald-mc-vault="row.yesPercent >= 60"
                    />
                  </div>
                </div>

                <span
                  :class="[
                    'absolute left-[60%] top-7 z-[1] min-w-0 -translate-y-1/2 truncate text-left font-orbitron text-lg font-bold uppercase tracking-normal md:text-xl right-[max(7rem,env(safe-area-inset-right,0px))] sm:right-[max(7.75rem,env(safe-area-inset-right,0px))] [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]',
                    row.yesPercent >= 60
                      ? 'text-emerald-50'
                      : 'text-neutral-50',
                    isCommunityWin(row)
                      ? 'drop-shadow-[0_0_18px_rgba(52,211,153,0.5)]'
                      : '',
                  ]"
                >
                  {{ row.mcVoteLabel }}
                </span>

                <div class="relative z-[2] flex shrink-0 items-start">
                  <div
                    class="relative block aspect-[662/1024] w-[5rem] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:w-[5.25rem]"
                  >
                    <img
                      :src="row.commemorativeArt"
                      :alt="`Commemorative art for ${row.mcVoteLabel}`"
                      class="pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-100"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div
        class="mt-10 border-t border-white/[0.08] pt-10 pb-12 antialiased sm:mt-14 sm:pt-14 sm:pb-16 md:mt-16 md:pt-16 md:pb-20"
      >
        <VrfdTweetFeed />
      </div>
    </div>
  </section>
</template>
