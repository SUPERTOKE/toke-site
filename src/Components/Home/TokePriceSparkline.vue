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
  /** `none` stretches to fill; `meet` shows the full series without crop (better in short pills). */
  aspectFit: { type: String, default: 'none' }
});

let sparkIdCounter = 0;
const uid = `s${++sparkIdCounter}-${Math.random().toString(36).slice(2, 9)}`;

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
  yInset: toRef(props, 'yInset')
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
    :class="[strokeClass, rootClass]"
    :aria-hidden="decorative ? 'true' : undefined"
    role="img"
    :aria-label="decorative ? undefined : '$TOKE price trend, last 24 hours'"
  >
    <svg
      v-if="hasPath"
      class="block h-auto w-full overflow-visible"
      :viewBox="`0 0 100 ${height}`"
      :preserveAspectRatio="preserveAspectRatio"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="`toke-spark-fill-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" class="toke-sparkline__fill-stop-top" />
          <stop offset="100%" class="toke-sparkline__fill-stop-bottom" />
        </linearGradient>
        <linearGradient :id="`toke-spark-stroke-${uid}`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" class="toke-sparkline__stroke-stop-a" />
          <stop offset="100%" class="toke-sparkline__stroke-stop-b" />
        </linearGradient>
      </defs>
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
.toke-sparkline--neutral .toke-sparkline__fill-stop-top {
  stop-color: rgb(167 139 250 / 0.32);
}
.toke-sparkline--neutral .toke-sparkline__fill-stop-bottom {
  stop-color: rgb(167 139 250 / 0);
}
</style>
