/** Resample irregular OHLC points onto a uniform time grid, then lightly smooth. */
export function prepareSparklineValues(points, { samples = 64, smoothPasses = 2 } = {}) {
  if (!points?.length) return [];

  const sorted = [...points]
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value) && p.value > 0)
    .sort((a, b) => a.time - b.time);
  if (sorted.length === 0) return [];
  if (sorted.length === 1) return Array(samples).fill(sorted[0].value);

  const t0 = sorted[0].time;
  const t1 = sorted[sorted.length - 1].time;
  const span = Math.max(t1 - t0, 1);

  const resampled = [];
  for (let i = 0; i < samples; i++) {
    const t = t0 + (span * i) / Math.max(samples - 1, 1);
    resampled.push(interpolateValueAt(sorted, t));
  }

  let out = resampled;
  for (let p = 0; p < smoothPasses; p++) {
    out = movingAverage(out, 3);
  }
  return out;
}

function interpolateValueAt(sorted, t) {
  if (t <= sorted[0].time) return sorted[0].value;
  if (t >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  let hi = 1;
  while (hi < sorted.length && sorted[hi].time < t) hi++;
  const lo = sorted[hi - 1];
  const up = sorted[hi];
  const dt = up.time - lo.time;
  if (dt <= 0) return lo.value;
  const w = (t - lo.time) / dt;
  return lo.value + (up.value - lo.value) * w;
}

function movingAverage(values, windowSize) {
  if (values.length <= 2 || windowSize < 2) return values;
  const half = Math.floor(windowSize / 2);
  return values.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j < 0 || j >= values.length) continue;
      sum += values[j];
      n++;
    }
    return n ? sum / n : values[i];
  });
}

/**
 * Smooth cubic SVG path through normalized Y values (viewBox 0 0 width height).
 * @param {number} yInset — fraction of inner height reserved top/bottom (keeps curve + overshoot visible)
 */
export function buildSmoothSvgPaths(
  values,
  width = 100,
  height = 32,
  padding = 2,
  yInset = 0.14
) {
  if (!values.length) return { line: '', area: '' };

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const inset = Math.min(Math.max(yInset, 0), 0.4);
  const plotH = innerH * (1 - 2 * inset);
  const plotTop = padding + innerH * inset;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || max * 0.0001 || 1;

  const pts = values.map((v, i) => ({
    x: padding + (i / Math.max(values.length - 1, 1)) * innerW,
    y: plotTop + (1 - (v - min) / range) * plotH
  }));

  const line = catmullRomPath(pts, false);
  const baseline = padding + innerH;
  const area = `${line} L ${pts[pts.length - 1].x} ${baseline} L ${pts[0].x} ${baseline} Z`;

  return { line, area };
}

function catmullRomPath(points, closed) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const d = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 8;
    const cp1y = p1.y + (p2.y - p0.y) / 8;
    const cp2x = p2.x - (p3.x - p1.x) / 8;
    const cp2y = p2.y - (p3.y - p1.y) / 8;
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
  }
  if (closed) d.push('Z');
  return d.join(' ');
}

export function toneFromChangePct(pct) {
  if (pct == null || !Number.isFinite(pct)) return 'neutral';
  if (pct > 0) return 'up';
  if (pct < 0) return 'down';
  return 'neutral';
}
