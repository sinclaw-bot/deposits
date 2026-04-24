import type { Deposit } from '../types';

/**
 * Данные для сегментов donut-графика — распределение по банкам
 */
export interface DonutSlice {
  bank: string;
  amount: number;
  color: string;
  percent: number;
}

/**
 * Собрать сегменты для donut-графика по активным вкладам
 * Если банк не указан — группируем как "Без банка"
 */
export function calcDonutSlices(deposits: Deposit[]): DonutSlice[] {
  const active = deposits.filter(d => d.status === 'active');
  if (active.length === 0) return [];

  const groups = new Map<string, { amount: number; color: string }>();

  for (const d of active) {
    const key = d.bank || 'Без банка';
    const existing = groups.get(key);
    if (existing) {
      existing.amount += d.amount;
    } else {
      groups.set(key, { amount: d.amount, color: d.color || '#999' });
    }
  }

  const total = active.reduce((s, d) => s + d.amount, 0);
  const result = Array.from(groups.entries())
    .map(([bank, { amount, color }]) => ({
      bank,
      amount,
      color,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

/**
 * SVG donut chart (без легенды, только сегменты + кружок)
 */
export function DonutChart({ slices, size = 80 }: { slices: DonutSlice[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.14;
  const gapDeg = 2; // gap between segments in degrees
  const total = 360 - slices.length * gapDeg;

  // Normalize percents to fill 360° exactly
  const totalPct = slices.reduce((s, sl) => s + sl.percent, 0) || 1;
  let currentAngle = -90; // start from top

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    ].join(' ');
  }

  // For small number of segments, draw arcs; for many, use simple approach
  const segments = slices.map((slice) => {
    const sliceAngle = (slice.percent / totalPct) * total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle + gapDeg;

    if (sliceAngle < 0.5) return null; // too small to render

    return (
      <path
        key={slice.bank}
        d={describeArc(startAngle, endAngle)}
        fill="none"
        stroke={slice.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }).filter(Boolean);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle (for empty slots) */}
      {slices.length > 0 && (
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="var(--g-color-line-generic)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
      )}
      {segments}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="var(--g-color-text-secondary)" opacity={0.4} />
    </svg>
  );
}
