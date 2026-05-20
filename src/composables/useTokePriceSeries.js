import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { subscribeTokeChart } from '../utils/tokeChartPoll';
import {
  prepareSparklineValues,
  buildSmoothSvgPaths,
  toneFromChangePct
} from '../utils/tokeChartSeries';

/**
 * Shared 24h price series from `/api/toke-chart` for custom layouts (not only `<TokePriceSparkline>`).
 *
 * @example
 * const { linePath, changePct24h, tone } = useTokePriceSeries({ height: 32 });
 */
export function useTokePriceSeries(options = {}) {
  const { height = 40 } = options;

  const rawPoints = ref([]);
  const changePct24h = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isStale = ref(false);

  let unsubscribe = null;

  const tone = computed(() => toneFromChangePct(changePct24h.value));

  const paths = computed(() => {
    const values = prepareSparklineValues(rawPoints.value);
    return buildSmoothSvgPaths(values, 100, height, 3);
  });

  const linePath = computed(() => paths.value.line);
  const areaPath = computed(() => paths.value.area);
  const hasSeries = computed(() => Boolean(linePath.value));

  function applyPayload({ data, err }) {
    if (err) {
      error.value = err?.message ?? 'Unavailable';
      if (!rawPoints.value.length) loading.value = false;
      return;
    }
    error.value = null;
    rawPoints.value = data?.points ?? [];
    changePct24h.value =
      data?.changePct24h != null && Number.isFinite(Number(data.changePct24h))
        ? Number(data.changePct24h)
        : null;
    isStale.value = Boolean(data?.stale);
    loading.value = false;
  }

  onMounted(() => {
    unsubscribe = subscribeTokeChart(({ data, error: pollErr }) => {
      applyPayload({ data, err: pollErr });
    });
  });

  onBeforeUnmount(() => {
    unsubscribe?.();
  });

  return {
    rawPoints,
    changePct24h,
    loading,
    error,
    isStale,
    tone,
    linePath,
    areaPath,
    hasSeries
  };
}
