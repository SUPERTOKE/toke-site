<script setup>
import { ref } from 'vue';
import {
  coinbaseVenue,
  swapVenues,
  swapTileGridClass,
  swapTileClass,
  tokenOfficialInfo,
} from '../../data/tradeVenues';
import coinbasePhone from '../../assets/trade-previews/toke-coinbase-mobile.png';
import coinbaseWordmark from '../../assets/logos/trade/coinbase-wordmark.svg';

const copyState = ref('idle');

async function copyMintAddress() {
  try {
    await navigator.clipboard.writeText(tokenOfficialInfo.mint);
    copyState.value = 'copied';
    window.setTimeout(() => {
      copyState.value = 'idle';
    }, 2000);
  } catch {
    copyState.value = 'error';
    window.setTimeout(() => {
      copyState.value = 'idle';
    }, 2000);
  }
}
</script>

<template>
  <div class="relative py-10 md:py-16 lg:py-20">
    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 h-[min(70vw,28rem)] -translate-y-1/2 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(139,92,246,0.22),transparent_55%)] md:h-[min(55vw,32rem)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 h-[min(70vw,28rem)] -translate-y-1/2 bg-[radial-gradient(ellipse_80%_60%_at_82%_50%,rgba(34,211,238,0.14),transparent_55%)] md:h-[min(55vw,32rem)]"
      aria-hidden="true"
    />
    <div class="relative container mx-auto px-4 sm:px-6 max-w-5xl">
      <div
        class="trade-spotlight relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/[0.12] bg-neutral-950/55 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_100px_-24px_rgba(0,0,0,0.75)] backdrop-blur-md md:backdrop-blur-2xl px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-14"
      >
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_40%,#000_20%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -left-1/4 top-0 h-px w-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent trade-spotlight-shimmer"
          aria-hidden="true"
        />
        <div class="relative z-[1] flex flex-col items-center text-center space-y-5 sm:space-y-6 md:space-y-8">
          <p class="font-orbitron text-[1.65rem] min-[400px]:text-3xl sm:text-5xl md:text-6xl font-semibold text-center pb-1 relative leading-tight tracking-wide [text-shadow:0_0_40px_rgba(255,255,255,0.12)]">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-white to-neutral-100">TRADE</span>
          </p>

          <div class="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-8 pt-1 text-left">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <!-- Coinbase: entire tile is the link -->
            <a
              :href="coinbaseVenue.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative flex min-h-[232px] sm:min-h-[280px] flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-white/[0.08] bg-gradient-to-b from-violet-500/[0.12] via-neutral-950/90 to-neutral-950 text-left no-underline outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 ease-out motion-reduce:transition-none active:scale-[0.99] sm:active:scale-100 hover:-translate-y-2 hover:border-violet-400/40 hover:shadow-[0_28px_64px_-16px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 touch-manipulation"
            >
              <div
                class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:bg-violet-400/30 motion-reduce:group-hover:scale-100"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-violet-400/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              ></div>

              <div class="relative flex flex-1 flex-col items-center justify-end px-4 pt-8 pb-3 sm:px-6 sm:pt-12 sm:pb-4">
                <div class="relative isolate mx-auto w-full max-w-[138px] sm:max-w-[158px] md:max-w-[188px]">
                  <div
                    class="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.35)_0%,_rgba(0,0,0,0.5)_45%,_transparent_72%)] blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-3xl motion-reduce:group-hover:blur-2xl"
                    aria-hidden="true"
                  ></div>
                  <img
                    :src="coinbasePhone"
                    alt="McToken on Coinbase app"
                    class="relative z-[1] block h-auto w-full max-h-[260px] object-contain object-center select-none transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100 sm:max-h-[300px] md:max-h-[340px] [filter:drop-shadow(0_28px_48px_rgba(0,0,0,0.55))]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div
                class="relative mt-auto flex min-h-[3.25rem] items-center justify-center border-t border-white/[0.1] bg-black/35 px-11 py-3.5 backdrop-blur-sm sm:min-h-[3.5rem] sm:px-12 sm:py-5 sm:backdrop-blur-md"
              >
                <img
                  :src="coinbaseWordmark"
                  alt=""
                  aria-hidden="true"
                  class="h-9 w-auto max-h-9 max-w-[min(100%,11rem)] origin-center scale-[0.78] object-contain object-center select-none transition-opacity duration-300 group-hover:opacity-100 sm:h-10 sm:max-h-10 md:scale-[0.82] opacity-95"
                  loading="lazy"
                  decoding="async"
                />
                <svg
                  class="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white motion-reduce:group-hover:translate-x-0 sm:right-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </a>

            <!-- Swap venues grid inside Jupiter-style card -->
            <div
              class="group relative flex min-h-[232px] sm:min-h-[280px] flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-white/[0.08] bg-[linear-gradient(to_bottom,_rgba(34,211,238,0.10)_0%,_rgba(10,10,10,1)_100%)] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 ease-out motion-reduce:transition-none hover:-translate-y-2 hover:border-cyan-400/35 hover:shadow-[0_28px_64px_-16px_rgba(34,211,238,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] motion-reduce:hover:translate-y-0"
            >
              <div
                class="pointer-events-none absolute -left-8 -top-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl"
                aria-hidden="true"
              ></div>
              <div
                class="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-400/18 to-transparent opacity-90"
                aria-hidden="true"
              ></div>
              <div
                class="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent"
                aria-hidden="true"
              ></div>

              <div class="relative flex flex-1 w-full flex-col items-center justify-center px-5 py-7 sm:px-6 sm:py-8">
                <div :class="swapTileGridClass">
                  <a
                    v-for="venue in swapVenues"
                    :key="venue.name"
                    :href="venue.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    :class="[
                      'group/tile flex items-center justify-center rounded-lg border border-white/[0.08] bg-black/25 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 touch-manipulation hover:border-cyan-400/35 hover:bg-cyan-400/[0.06] active:scale-[0.98]',
                      swapTileClass,
                    ]"
                  >
                    <img
                      :src="venue.logo"
                      :alt="venue.name"
                      :class="[
                        venue.logoClass,
                        'opacity-90 transition-all duration-200 group-hover/tile:opacity-100 group-hover/tile:scale-105 motion-reduce:group-hover/tile:scale-100',
                      ]"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                </div>
              </div>
            </div>

            </div>

            <section
              class="rounded-2xl md:rounded-3xl border border-white/[0.1] bg-neutral-950/70 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              aria-label="Token details"
            >
              <dl class="font-exo space-y-1.5 text-sm">
                <div class="flex items-baseline justify-between gap-4">
                  <dt class="shrink-0 text-neutral-500">Token</dt>
                  <dd class="font-medium text-white">{{ tokenOfficialInfo.name }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-4">
                  <dt class="shrink-0 text-neutral-500">Ticker</dt>
                  <dd class="font-medium text-white">{{ tokenOfficialInfo.ticker }}</dd>
                </div>
                <div class="flex min-w-0 items-center gap-2">
                  <dt class="shrink-0 text-neutral-500">Address</dt>
                  <code
                    :title="tokenOfficialInfo.mint"
                    class="min-w-0 flex-1 truncate rounded-md border border-white/[0.08] bg-black/35 px-2 py-1 font-mono text-[0.625rem] leading-none text-neutral-300 sm:text-[0.6875rem]"
                  >{{ tokenOfficialInfo.mint }}</code>
                  <button
                    type="button"
                    @click="copyMintAddress"
                    class="inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 font-exo text-[0.6875rem] font-medium leading-none text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    :aria-label="copyState === 'copied' ? 'Address copied' : 'Copy address'"
                  >
                    <svg
                      v-if="copyState !== 'copied'"
                      class="h-3.5 w-3.5 shrink-0 text-neutral-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Failed' : 'Copy' }}</span>
                  </button>
                </div>
              </dl>

              <p class="mt-2.5 border-t border-white/[0.08] pt-2.5 font-exo text-xs leading-relaxed text-neutral-500">
                {{ tokenOfficialInfo.disclaimer }}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes trade-spotlight-shimmer {
  0% { opacity: 0.35; transform: translateX(-8%); }
  50% { opacity: 0.85; }
  100% { opacity: 0.35; transform: translateX(8%); }
}
.trade-spotlight-shimmer {
  animation: trade-spotlight-shimmer 7s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .trade-spotlight-shimmer {
    animation: none;
    opacity: 0.45;
    transform: none;
  }
}
</style>
