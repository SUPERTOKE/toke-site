import { ref, computed, onMounted, onBeforeUnmount, toValue } from 'vue';
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
  const height = computed(() => toValue(options.height) ?? 40);
  const pathPadding = computed(() => toValue(options.pathPadding) ?? 3);
  const yInset = computed(() => toValue(options.yInset) ?? 0.14);
  const yPlotFill = computed(() => toValue(options.yPlotFill) ?? 1);
  const smoothPasses = computed(() => toValue(options.smoothPasses) ?? 2);

  const rawPoints = ref([]);
  const changePct24h = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isStale = ref(false);

  let unsubscribe = null;

  const tone = computed(() => toneFromChangePct(changePct24h.value));

  const paths = computed(() => {
    const values = prepareSparklineValues(rawPoints.value, {
      smoothPasses: smoothPasses.value
    });
    return buildSmoothSvgPaths(
      values,
      100,
      height.value,
      pathPadding.value,
      yInset.value,
      yPlotFill.value
    );
  });

  const linePath = computed(() => paths.value.line);
  const areaPath = computed(() => paths.value.area);
  const hasSeries = computed(() => Boolean(linePath.value));

  function applyPayload({ data, error: pollErr }) {
    if (pollErr) {
      error.value = pollErr?.message ?? 'Unavailable';
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
    unsubscribe = subscribeTokeChart(applyPayload);
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
    paths,
    linePath,
    areaPath,
    hasSeries
  };
}
