<script setup>
import { computed, toRef } from 'vue';
import { useTokePriceSeries } from '../../composables/useTokePriceSeries';

const props = defineProps({
  /** SVG viewport height (width is always 100 via viewBox). */
  height: { type: Number, default: 40 },
  /** `area` fills under the line; `line` is stroke only. */
  variant: { type: String, default: 'area' },
  /** `auto` follows 24h % — otherwise force palette. */
  tone: { type: String, default: 'auto' },
  /** Extra classes on the root wrapper. */
  rootClass: { type: String, default: '' },
  /** Decorative — hide from assistive tech when true. */
  decorative: { type: Boolean, default: true },
  /** ViewBox edge padding for the path. */
  pathPadding: { type: Number, default: 3 },
  /** Vertical breathing room so smooth curves are not clipped (0–0.4). */
  yInset: { type: Number, default: 0.14 },
  /** Share of plot height used for the series swing, centered (0.2–1; hero defaults ~0.52). */
  yPlotFill: { type: Number, default: undefined },
  /** `none` stretches to fill; `meet` shows the full series without crop (better in short pills). */
  aspectFit: { type: String, default: 'none' },
  /** `default` for navbar pill; `hero` for featured stat tile (fills frame, richer stroke). */
  presentation: { type: String, default: 'default' },
  /** @deprecated Use `presentation="hero"` — kept for compatibility. */
  featured: { type: Boolean, default: false },
  /** Draw horizontal + vertical guide lines behind the series. */
  showGrid: { type: Boolean, default: false },
  /** Extra smoothing passes when resampling OHLCV (hero benefits from 3). */
  smoothPasses: { type: Number, default: undefined }
});

let sparkIdCounter = 0;
const uid = `s${++sparkIdCounter}-${Math.random().toString(36).slice(2, 9)}`;

const isHero = computed(
  () => props.presentation === 'hero' || props.featured
);

const smoothPasses = computed(
  () => props.smoothPasses ?? (isHero.value ? 3 : 2)
);

const yPlotFill = computed(() => {
  if (props.yPlotFill != null) return props.yPlotFill;
  return isHero.value ? 0.52 : 1;
});

const {
  changePct24h,
  loading,
  error: loadError,
  isStale,
  tone: autoTone,
  paths,
  hasSeries: hasPath
} = useTokePriceSeries({
  height: toRef(props, 'height'),
  pathPadding: toRef(props, 'pathPadding'),
  yInset: toRef(props, 'yInset'),
  yPlotFill,
  smoothPasses
});

const resolvedTone = computed(() =>
  props.tone !== 'auto' ? props.tone : autoTone.value
);

const strokeClass = computed(() => {
  const t = resolvedTone.value;
  if (t === 'up') return 'toke-sparkline--up';
  if (t === 'down') return 'toke-sparkline--down';
  return 'toke-sparkline--neutral';
});

const preserveAspectRatio = computed(() =>
  props.aspectFit === 'meet' ? 'xMidYMid meet' : 'none'
);

const gridSegments = computed(() => {
  if (!props.showGrid) return [];
  const h = props.height;
  const pad = props.pathPadding;
  const innerW = 100 - pad * 2;
  const innerH = h - pad * 2;
  const segments = [];
  const hSteps = 4;
  for (let i = 0; i <= hSteps; i += 1) {
    const y = pad + (innerH * i) / hSteps;
    segments.push({ axis: 'h', d: `M ${pad} ${y} L ${100 - pad} ${y}` });
  }
  const vSteps = 5;
  for (let i = 0; i <= vSteps; i += 1) {
    const x = pad + (innerW * i) / vSteps;
    segments.push({ axis: 'v', d: `M ${x} ${pad} L ${x} ${h - pad}` });
  }
  return segments;
});

const heroBaselineD = computed(() => {
  if (!isHero.value || paths.value.baseline == null) return '';
  const pad = props.pathPadding;
  return `M ${pad} ${paths.value.baseline} L ${100 - pad} ${paths.value.baseline}`;
});

defineExpose({
  changePct24h,
  loading,
  loadError,
  isStale,
  tone: resolvedTone
});
</script>

<template>
  <div
    class="toke-sparkline w-full"
    :class="[
      strokeClass,
      {
        'toke-sparkline--hero': isHero,
        'toke-sparkline--featured': featured && !isHero
      },
      rootClass
    ]"
    :aria-hidden="decorative ? 'true' : undefined"
    role="img"
    :aria-label="decorative ? undefined : '$TOKE price trend, last 24 hours'"
  >
    <svg
      v-if="hasPath"
      class="block h-auto w-full overflow-visible"
      :class="{ 'toke-sparkline__svg--hero': isHero }"
      :viewBox="`0 0 100 ${height}`"
      :preserveAspectRatio="preserveAspectRatio"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="`toke-spark-fill-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="toke-sparkline__fill-stop-top" />
          <stop
            v-if="isHero"
            offset="42%"
            class="toke-sparkline__fill-stop-mid"
          />
          <stop offset="100%" class="toke-sparkline__fill-stop-bottom" />
        </linearGradient>
        <linearGradient :id="`toke-spark-stroke-${uid}`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" class="toke-sparkline__stroke-stop-a" />
          <stop offset="55%" class="toke-sparkline__stroke-stop-b" />
          <stop offset="100%" class="toke-sparkline__stroke-stop-c" />
        </linearGradient>
      </defs>
      <g v-if="showGrid" class="toke-sparkline__grid" aria-hidden="true">
        <path
          v-for="(seg, idx) in gridSegments"
          :key="`grid-${seg.axis}-${idx}`"
          :d="seg.d"
          class="toke-sparkline__grid-line"
          :class="seg.axis === 'h' ? 'toke-sparkline__grid-line--h' : 'toke-sparkline__grid-line--v'"
        />
      </g>
      <path
        v-if="isHero && heroBaselineD"
        :d="heroBaselineD"
        class="toke-sparkline__baseline"
        aria-hidden="true"
      />
      <path
        v-if="variant === 'area'"
        :d="paths.area"
        class="toke-sparkline__area"
        :fill="`url(#toke-spark-fill-${uid})`"
      />
      <path
        :d="paths.line"
        class="toke-sparkline__line"
        :stroke="`url(#toke-spark-stroke-${uid})`"
        fill="none"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div
      v-else-if="loading"
      class="toke-sparkline__placeholder font-exo text-[10px] text-neutral-600 sm:text-xs"
    >
      …
    </div>
  </div>
</template>

<style scoped>
.toke-sparkline__line {
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.toke-sparkline__area {
  opacity: 0.35;
}

.toke-sparkline__grid-line {
  fill: none;
  stroke: rgba(103, 232, 249, 0.14);
  vector-effect: non-scaling-stroke;
}

.toke-sparkline__grid-line--h {
  stroke-width: 0.65;
}

.toke-sparkline__grid-line--v {
  stroke-width: 0.5;
  stroke: rgba(148, 163, 184, 0.1);
}

/* Hero — wide stat tile: fill frame, pill palette, clearer silhouette */
.toke-sparkline--hero .toke-sparkline__area {
  opacity: 1;
}

.toke-sparkline--hero .toke-sparkline__line {
  stroke-width: 2.15;
  /* Directional bloom: pool below the line, faint lift above (not a uniform halo). */
  filter:
    drop-shadow(0 5px 14px rgb(var(--toke-spark-glow-rgb) / 0.28))
    drop-shadow(0 2px 5px rgb(var(--toke-spark-glow-rgb) / 0.18))
    drop-shadow(0 -2px 7px rgb(var(--toke-spark-glow-rgb) / 0.09))
    drop-shadow(0 0 2px rgb(var(--toke-spark-glow-rgb) / 0.22));
}

.toke-sparkline--hero.toke-sparkline--up {
  --toke-spark-glow-rgb: 52 211 153;
}

.toke-sparkline--hero.toke-sparkline--down {
  --toke-spark-glow-rgb: 248 113 113;
}

.toke-sparkline--hero.toke-sparkline--neutral {
  --toke-spark-glow-rgb: 167 139 250;
}

.toke-sparkline--hero .toke-sparkline__baseline {
  fill: none;
  stroke: rgba(148, 163, 184, 0.14);
  stroke-width: 0.75;
  vector-effect: non-scaling-stroke;
}

.toke-sparkline--hero.toke-sparkline--up .toke-sparkline__fill-stop-top {
  stop-color: rgb(52 211 153 / 0.42);
}

.toke-sparkline--hero.toke-sparkline--up .toke-sparkline__fill-stop-mid {
  stop-color: rgb(52 211 153 / 0.14);
}

.toke-sparkline--hero.toke-sparkline--up .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(52 211 153 / 0);
}

.toke-sparkline--hero.toke-sparkline--down .toke-sparkline__fill-stop-top {
  stop-color: rgb(248 113 113 / 0.4);
}

.toke-sparkline--hero.toke-sparkline--down .toke-sparkline__fill-stop-mid {
  stop-color: rgb(248 113 113 / 0.13);
}

.toke-sparkline--hero.toke-sparkline--down .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(248 113 113 / 0);
}

.toke-sparkline--hero.toke-sparkline--neutral .toke-sparkline__fill-stop-top {
  stop-color: rgb(167 139 250 / 0.38);
}

.toke-sparkline--hero.toke-sparkline--neutral .toke-sparkline__fill-stop-mid {
  stop-color: rgb(167 139 250 / 0.12);
}

.toke-sparkline--hero.toke-sparkline--neutral .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(167 139 250 / 0);
}

.toke-sparkline--hero.toke-sparkline--up .toke-sparkline__stroke-stop-c {
  stop-color: rgb(110 231 183);
}

.toke-sparkline--hero.toke-sparkline--down .toke-sparkline__stroke-stop-c {
  stop-color: rgb(252 165 165);
}

.toke-sparkline--hero.toke-sparkline--neutral .toke-sparkline__stroke-stop-c {
  stop-color: rgb(221 214 254);
}

/* Legacy featured flag (non-hero) */
.toke-sparkline--featured .toke-sparkline__area {
  opacity: 0.5;
}

.toke-sparkline--featured .toke-sparkline__line {
  stroke-width: 2.35;
}

.toke-sparkline--featured .toke-sparkline__grid-line--h {
  stroke: rgba(103, 232, 249, 0.2);
}

.toke-sparkline--featured .toke-sparkline__grid-line--v {
  stroke: rgba(167, 139, 250, 0.14);
}

.toke-sparkline--featured.toke-sparkline--up .toke-sparkline__fill-stop-top {
  stop-color: rgb(52 211 153 / 0.48);
}

.toke-sparkline--featured.toke-sparkline--down .toke-sparkline__fill-stop-top {
  stop-color: rgb(248 113 113 / 0.45);
}

.toke-sparkline--featured.toke-sparkline--neutral .toke-sparkline__fill-stop-top {
  stop-color: rgb(167 139 250 / 0.42);
}

.toke-sparkline__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  opacity: 0.5;
}

.toke-sparkline--up .toke-sparkline__stroke-stop-a {
  stop-color: rgb(52 211 153);
}
.toke-sparkline--up .toke-sparkline__stroke-stop-b {
  stop-color: rgb(16 185 129);
}
.toke-sparkline--up .toke-sparkline__stroke-stop-c {
  stop-color: rgb(16 185 129);
}
.toke-sparkline--up .toke-sparkline__fill-stop-top {
  stop-color: rgb(52 211 153 / 0.35);
}
.toke-sparkline--up .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(52 211 153 / 0);
}

.toke-sparkline--down .toke-sparkline__stroke-stop-a {
  stop-color: rgb(248 113 113);
}
.toke-sparkline--down .toke-sparkline__stroke-stop-b {
  stop-color: rgb(239 68 68);
}
.toke-sparkline--down .toke-sparkline__stroke-stop-c {
  stop-color: rgb(239 68 68);
}
.toke-sparkline--down .toke-sparkline__fill-stop-top {
  stop-color: rgb(248 113 113 / 0.35);
}
.toke-sparkline--down .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(248 113 113 / 0);
}

.toke-sparkline--neutral .toke-sparkline__stroke-stop-a {
  stop-color: rgb(167 139 250);
}
.toke-sparkline--neutral .toke-sparkline__stroke-stop-b {
  stop-color: rgb(196 181 253);
}
.toke-sparkline--neutral .toke-sparkline__stroke-stop-c {
  stop-color: rgb(196 181 253);
}
.toke-sparkline--neutral .toke-sparkline__fill-stop-top {
  stop-color: rgb(167 139 250 / 0.32);
}
.toke-sparkline--neutral .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(167 139 250 / 0);
}
</style>
