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

  const seg = 0.22;
  const finaleStart = seg * 3;
  const finaleDur = 0.14;
  const cross = 0.07;

  ctx = gsap.context(() => {
    gsap.set(stepEls, { autoAlpha: 0, y: 36 });
    gsap.set(finaleEl, { autoAlpha: 0, y: 28 });
    gsap.set(vizEls, { autoAlpha: 0, scale: 0.88, y: 12 });
    gsap.set(glow, { autoAlpha: 0, scale: 0.75 });
    gsap.set(aura, { opacity: 0.35, scale: 1 });

    gsap.set(stepEls[0], { autoAlpha: 1, y: 0 });
    gsap.set(vizEls[0], { autoAlpha: 1, scale: 0.92, y: 0 });

    gsap.timeline({
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
    })
      .addLabel('step1', 0)
      .to(aura, { opacity: 0.45, scale: 1.02, duration: seg }, 0)
      .to(vizEls[0], { scale: 0.94, duration: seg * 0.9 }, 0)

      .addLabel('step2', seg)
      .to(
        stepEls[0],
        { autoAlpha: 0, y: -28, duration: cross, ease: 'power2.in' },
        seg - cross * 0.3
      )
      .to(stepEls[1], { autoAlpha: 1, y: 0, duration: cross }, seg - cross * 0.2)
      .to(
        vizEls[0],
        { autoAlpha: 0, scale: 0.86, y: -16, duration: cross },
        seg - cross * 0.35
      )
      .to(
        vizEls[1],
        { autoAlpha: 1, scale: 0.98, y: 0, duration: cross },
        seg - cross * 0.25
      )
      .to(aura, { opacity: 0.62, scale: 1.05, duration: seg }, seg - cross * 0.2)

      .addLabel('step3', seg * 2)
      .to(
        stepEls[1],
        { autoAlpha: 0, y: -28, duration: cross, ease: 'power2.in' },
        seg * 2 - cross * 0.3
      )
      .to(stepEls[2], { autoAlpha: 1, y: 0, duration: cross }, seg * 2 - cross * 0.2)
      .to(
        vizEls[1],
        { autoAlpha: 0, scale: 0.9, y: -18, duration: cross },
        seg * 2 - cross * 0.35
      )
      .to(
        vizEls[2],
        { autoAlpha: 1, scale: 1.02, y: 0, duration: cross },
        seg * 2 - cross * 0.25
      )
      .to(aura, { opacity: 0.78, scale: 1.08, duration: seg }, seg * 2 - cross * 0.2)

      .addLabel('finale', finaleStart)
      .to(
        stepEls[2],
        { autoAlpha: 0, y: -24, duration: cross, ease: 'power2.in' },
        finaleStart - cross * 0.35
      )
      .to(finaleEl, { autoAlpha: 1, y: 0, duration: cross * 1.2 }, finaleStart - cross * 0.25)
      .to(
        vizEls[2],
        { scale: 1.08, duration: finaleDur, ease: 'power1.out' },
        finaleStart - cross * 0.2
      )
      .to(glow, { autoAlpha: 1, scale: 1.15, duration: finaleDur }, finaleStart)
      .to(aura, { opacity: 1, scale: 1.12, duration: finaleDur }, finaleStart)
      .to(vizEls[2], { scale: 1.12, duration: finaleDur * 0.8 }, finaleStart + finaleDur * 0.2)
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
  <section
    ref="rootRef"
    class="relative bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 border-x border-b border-white/[0.05] md:rounded-b-3xl rounded-b-3xl overflow-hidden z-10"
    aria-labelledby="great-mcvote-scrolly-title"
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
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <div class="inline-flex items-center rounded-lg border border-white/[0.12] bg-neutral-900/60 px-4 py-2">
            <span class="font-orbitron text-xs uppercase tracking-[0.14em] text-neutral-400">
              Unique Voters:
            </span>
            <span class="ml-2 font-orbitron text-sm text-white">{{ step.uniqueVoters }}</span>
          </div>
          <a
            :href="step.resultsHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-xs uppercase tracking-[0.12em] hover:bg-sky-500/15 hover:border-sky-400/60 transition-all"
          >
            Results
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
        class="flex flex-col md:flex-row md:items-center min-h-[100dvh] h-[100dvh] w-full box-border"
      >
        <div
          data-scrolly-bg-aura
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(129,140,248,0.1),transparent_50%)] opacity-40 will-change-transform"
        />

        <div
          class="relative order-2 md:order-1 w-full md:w-[45%] h-[38vh] md:h-full flex items-center justify-center shrink-0 px-4 md:px-8"
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
          class="relative order-1 md:order-2 flex-1 flex flex-col justify-center px-6 md:pr-12 md:pl-4 pt-10 pb-6 md:py-12 min-h-0"
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
              <div class="max-w-prose space-y-1.5 md:space-y-2">
                <p
                  v-for="(line, j) in step.body"
                  :key="j"
                  class="font-exo text-neutral-300 text-base md:text-lg leading-snug md:leading-relaxed"
                >
                  {{ line }}
                </p>
              </div>
              <div class="mt-4 md:mt-6 flex flex-wrap items-center gap-3 pointer-events-auto">
                <div class="inline-flex items-center rounded-lg border border-white/[0.12] bg-neutral-900/60 px-4 py-2">
                  <span class="font-orbitron text-[10px] md:text-xs uppercase tracking-[0.14em] text-neutral-400">
                    Unique Voters:
                  </span>
                  <span class="ml-2 font-orbitron text-xs md:text-sm text-white">{{ step.uniqueVoters }}</span>
                </div>
                <a
                  :href="step.resultsHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900/70 border border-sky-400/40 text-sky-100 font-orbitron text-[10px] md:text-xs uppercase tracking-[0.12em] hover:bg-sky-500/15 hover:border-sky-400/60 transition-all"
                >
                  Results
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
  </section>
</template>
