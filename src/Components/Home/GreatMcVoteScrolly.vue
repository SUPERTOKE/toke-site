<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STEPS, FINALE, SCROLL_VH } from '../../data/greatMcVoteStory.js';

gsap.registerPlugin(ScrollTrigger);

const rootRef = ref(null);
const trackRef = ref(null);
const pinRef = ref(null);

const useFallback = ref(false);

let ctx;
let resizeTimer;

/** Skip pin + scrub; show stacked sections (same path as GSAP init failure). */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const trackHeightStyle = computed(() =>
  useFallback.value ? {} : { height: `${SCROLL_VH}vh` }
);

function setFallback() {
  useFallback.value = true;
}

function queryScrollyEls() {
  const pin = pinRef.value;
  if (!pin) return null;

  const stepEls = STEPS.map((_, i) => pin.querySelector(`[data-scrolly-step="${i}"]`)).filter(Boolean);
  const finaleEl = pin.querySelector('[data-scrolly-finale]');
  const vizEls = STEPS.map((_, i) => pin.querySelector(`[data-scrolly-viz="${i}"]`)).filter(Boolean);
  const glow = pin.querySelector('[data-scrolly-viz-glow]');
  const aura = pin.querySelector('[data-scrolly-bg-aura]');

  if (stepEls.length !== STEPS.length || !finaleEl || vizEls.length !== STEPS.length || !glow || !aura) {
    return null;
  }
  return { stepEls, finaleEl, vizEls, glow, aura };
}

function buildTimeline() {
  const track = trackRef.value;
  const pin = pinRef.value;
  if (!track || !pin) return;

  const els = queryScrollyEls();
  if (!els) return;

  const { stepEls, finaleEl, vizEls, glow, aura } = els;

  const stepsCount = STEPS.length;
  const storyDuration = 0.82;
  const seg = storyDuration / stepsCount;
  const finaleStart = seg * stepsCount;
  const finaleDur = 0.14;
  const cross = Math.min(0.07, seg * 0.42);

  ctx = gsap.context(() => {
    gsap.set(stepEls, { autoAlpha: 0, y: 36 });
    gsap.set(finaleEl, { autoAlpha: 0, y: 28 });
    gsap.set(vizEls, { autoAlpha: 0, scale: 0.88, y: 12 });
    gsap.set(glow, { autoAlpha: 0, scale: 0.75 });
    gsap.set(aura, { opacity: 0.35, scale: 1 });

    gsap.set(stepEls[0], { autoAlpha: 1, y: 0 });
    gsap.set(vizEls[0], { autoAlpha: 1, scale: 0.92, y: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        pin: pin,
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.addLabel('step0', 0)
      .to(aura, { opacity: 0.45, scale: 1.02, duration: seg }, 0)
      .to(vizEls[0], { scale: 0.94, duration: seg * 0.9 }, 0);

    for (let i = 1; i < stepsCount; i += 1) {
      const at = seg * i;
      tl.addLabel(`step${i}`, at)
        .to(
          stepEls[i - 1],
          { autoAlpha: 0, y: -28, duration: cross, ease: 'power2.in' },
          at - cross * 0.3
        )
        .to(stepEls[i], { autoAlpha: 1, y: 0, duration: cross }, at - cross * 0.2)
        .to(
          vizEls[i - 1],
          { autoAlpha: 0, scale: 0.9, y: -16, duration: cross },
          at - cross * 0.35
        )
        .to(
          vizEls[i],
          { autoAlpha: 1, scale: 1.01, y: 0, duration: cross },
          at - cross * 0.25
        )
        .to(aura, { opacity: 0.5 + i * 0.1, scale: 1.02 + i * 0.02, duration: seg }, at - cross * 0.2);
    }

    tl.addLabel('finale', finaleStart)
      .to(
        stepEls[stepsCount - 1],
        { autoAlpha: 0, y: -24, duration: cross, ease: 'power2.in' },
        finaleStart - cross * 0.35
      )
      .to(finaleEl, { autoAlpha: 1, y: 0, duration: cross * 1.2 }, finaleStart - cross * 0.25)
      .to(
        vizEls[stepsCount - 1],
        { scale: 1.08, duration: finaleDur, ease: 'power1.out' },
        finaleStart - cross * 0.2
      )
      .to(glow, { autoAlpha: 1, scale: 1.15, duration: finaleDur }, finaleStart)
      .to(aura, { opacity: 1, scale: 1.12, duration: finaleDur }, finaleStart)
      .to(vizEls[stepsCount - 1], { scale: 1.12, duration: finaleDur * 0.8 }, finaleStart + finaleDur * 0.2)
      .to({}, { duration: 0.12 }, finaleStart + finaleDur);
  }, pinRef.value);
}

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
}

onMounted(async () => {
  if (prefersReducedMotion()) {
    setFallback();
    return;
  }

  await nextTick();

  try {
    buildTimeline();
    if (!ctx) setFallback();
  } catch {
    setFallback();
  }

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  clearTimeout(resizeTimer);
  ctx?.revert();
  ctx = undefined;
});
</script>

<template>
  <section ref="rootRef" class="relative" aria-labelledby="great-mcvote-scrolly-title">
    <div class="absolute -top-16 right-0 md:left-auto md:right-8 h-16 bg-gradient-to-b from-neutral-900/80 to-neutral-900/80 rounded-t-2xl border-t border-l border-r border-white/[0.05] px-6 [border-bottom:none] z-20">
      <div class="relative">
        <div class="absolute -top-8 right-12 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div class="absolute -bottom-8 left-12 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl"></div>

        <div class="flex items-center justify-center gap-4">
          <div class="relative w-12 h-12 flex items-center justify-center z-10 hidden md:flex">
            <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
            <svg class="relative w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 11H18C19.1046 11 20 11.8954 20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13C4 11.8954 4.89543 11 6 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
          </div>
          <p class="font-orbitron text-6xl font-semibold text-start md:text-center pt-1 relative">
            <span class="text-white">T<span class="text-5xl">HE</span> G<span class="text-5xl">REAT</span> M<span class="text-5xl">C</span>V<span class="text-5xl">OTE</span></span>
          </p>
        </div>
      </div>
    </div>

    <div
      class="relative bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 border border-white/[0.05] md:rounded-tl-3xl rounded-tr-md rounded-b-3xl overflow-hidden z-10"
    >
    <!-- Fallback: reduced motion / init failure — stacked sections -->
    <div
      v-if="useFallback"
      class="container mx-auto px-6 py-20 md:py-28 space-y-16 max-w-3xl"
    >
      <h2 id="great-mcvote-scrolly-title" class="sr-only">Great McVote</h2>
      <article
        v-for="step in STEPS"
        :key="step.id"
        class="space-y-4 border-b border-white/[0.06] pb-12 last:border-0"
      >
        <p class="font-orbitron text-xs uppercase tracking-[0.2em] text-sky-400/90">
          {{ step.label }}
        </p>
        <h3 class="font-orbitron text-3xl md:text-4xl text-white">{{ step.headline }}</h3>
        <p
          v-if="step.subheadline"
          class="font-orbitron text-sm uppercase tracking-[0.14em] text-sky-400/90"
        >
          {{ step.subheadline }}
        </p>
        <img
          :src="step.image"
          :alt="step.headline"
          class="w-full max-w-md mx-auto md:mx-0 rounded-xl opacity-90"
        />
        <p
          v-for="(line, j) in step.body"
          :key="j"
          class="font-exo text-neutral-300 text-lg leading-relaxed"
        >
          {{ line }}
        </p>
        <p
          v-if="step.emphasisLine"
          class="font-orbitron text-sm md:text-base uppercase tracking-[0.12em] text-sky-200 border-l-2 border-sky-400/70 pl-4 py-1"
        >
          {{ step.emphasisLine }}
        </p>
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <div
            v-if="step.metricValue"
            class="inline-flex items-center rounded-lg border border-white/[0.12] bg-neutral-900/60 px-4 py-2"
          >
            <span class="font-orbitron text-xs uppercase tracking-[0.14em] text-neutral-400">
              {{ step.metricLabel || 'Unique Voters:' }}
            </span>
            <span class="ml-2 font-orbitron text-sm text-white">{{ step.metricValue }}</span>
          </div>
          <a
            :href="step.actionHref || step.resultsHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-xs uppercase tracking-[0.12em] hover:bg-sky-500/15 hover:border-sky-400/60 transition-all"
          >
            {{ step.actionLabel || 'Results' }}
          </a>
        </div>
      </article>
      <article class="space-y-6 pt-4">
        <h3 class="font-orbitron text-3xl md:text-4xl text-white text-balance">
          {{ FINALE.headline }}
        </h3>
        <a
          :href="FINALE.ctaHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900/80 border border-sky-500/30 text-sky-200 font-orbitron text-sm hover:bg-sky-500/10 transition-colors"
        >
          {{ FINALE.ctaLabel }}
        </a>
      </article>
    </div>

    <div
      v-else
      ref="trackRef"
      class="relative"
      :style="trackHeightStyle"
    >
      <div
        ref="pinRef"
        class="flex flex-col md:flex-row md:items-center md:justify-center md:gap-14 min-h-[100dvh] h-[100dvh] w-full box-border"
      >
        <div
          data-scrolly-bg-aura
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(129,140,248,0.1),transparent_50%)] opacity-40 will-change-transform"
        />

        <div
          class="relative order-2 md:order-1 w-full md:w-[40%] md:flex-none h-[38vh] md:h-full flex items-center justify-center shrink-0 px-4 md:px-0"
        >
          <div class="relative w-full max-w-[min(100%,420px)] aspect-square flex items-center justify-center will-change-transform">
            <div
              data-scrolly-viz-glow
              class="pointer-events-none absolute inset-[-8%] rounded-full bg-gradient-to-br from-sky-400/25 via-indigo-500/20 to-purple-500/25 blur-2xl opacity-0 scale-75"
            />
            <img
              v-for="(step, i) in STEPS"
              :key="step.id"
              :data-scrolly-viz="i"
              :src="step.image"
              :alt="step.headline"
              class="absolute max-h-[min(38vh,320px)] md:max-h-[min(72vh,480px)] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <div
          class="relative order-1 md:order-2 w-full md:w-[40%] md:flex-none flex flex-col justify-center px-6 md:px-0 pt-10 pb-6 md:py-12 min-h-0"
        >
          <h2 id="great-mcvote-scrolly-title" class="sr-only">Great McVote</h2>

          <div class="relative min-h-[12rem] md:min-h-[16rem]">
            <div
              v-for="(step, i) in STEPS"
              :key="step.id"
              :data-scrolly-step="i"
              class="absolute inset-0 flex flex-col justify-center pointer-events-none md:pointer-events-auto"
            >
              <p class="font-orbitron text-[10px] md:text-xs uppercase tracking-[0.25em] text-sky-400/90 mb-2 md:mb-3">
                {{ step.label }}
              </p>
              <h3 class="font-orbitron text-3xl sm:text-4xl md:text-5xl text-white leading-tight text-balance mb-4 md:mb-6">
                {{ step.headline }}
              </h3>
              <p
                v-if="step.subheadline"
                class="font-orbitron text-[10px] md:text-sm uppercase tracking-[0.16em] text-sky-400/90 mb-3"
              >
                {{ step.subheadline }}
              </p>
              <div class="max-w-prose space-y-1.5 md:space-y-2">
                <p
                  v-for="(line, j) in step.body"
                  :key="j"
                  class="font-exo text-neutral-300 text-base md:text-lg leading-snug md:leading-relaxed"
                >
                  {{ line }}
                </p>
              </div>
              <p
                v-if="step.emphasisLine"
                class="mt-4 font-orbitron text-[11px] md:text-sm uppercase tracking-[0.14em] text-sky-200 border-l-2 border-sky-400/70 pl-4 py-1"
              >
                {{ step.emphasisLine }}
              </p>
              <div class="mt-4 md:mt-6 flex flex-wrap items-center gap-3 pointer-events-auto">
                <div
                  v-if="step.metricValue"
                  class="inline-flex items-center rounded-lg border border-white/[0.12] bg-neutral-900/60 px-4 py-2"
                >
                  <span class="font-orbitron text-[10px] md:text-xs uppercase tracking-[0.14em] text-neutral-400">
                    {{ step.metricLabel || 'Unique Voters:' }}
                  </span>
                  <span class="ml-2 font-orbitron text-xs md:text-sm text-white">{{ step.metricValue }}</span>
                </div>
                <a
                  :href="step.actionHref || step.resultsHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-[10px] md:text-xs uppercase tracking-[0.12em] hover:bg-sky-500/15 hover:border-sky-400/60 transition-all"
                >
                  {{ step.actionLabel || 'Results' }}
                </a>
              </div>
            </div>

            <div
              data-scrolly-finale
              class="absolute inset-0 flex flex-col justify-center gap-6 pointer-events-none md:pointer-events-auto"
            >
              <h3 class="font-orbitron text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-indigo-200 leading-tight text-balance">
                {{ FINALE.headline }}
              </h3>
              <a
                :href="FINALE.ctaHref"
                target="_blank"
                rel="noopener noreferrer"
                class="pointer-events-auto inline-flex w-fit items-center justify-center px-6 py-3 rounded-xl bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-sm hover:bg-sky-500/15 hover:border-sky-400/60 transition-all shadow-[0_0_24px_rgba(56,189,248,0.15)]"
              >
                {{ FINALE.ctaLabel }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>
