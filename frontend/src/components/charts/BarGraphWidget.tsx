import React, { useState } from 'react';

export interface BarGraphItem {
  category: string;
  value: number; // e.g., Kg or Quintals or Capacity
  color?: string;
}

interface BarGraphWidgetProps {
  title?: string;
  subtitle?: string;
  unit?: string;
  data: BarGraphItem[];
}

export const BarGraphWidget: React.FC<BarGraphWidgetProps> = ({
  title = "Materials In Store",
  subtitle = "(Quintals / Kg Inventory)",
  unit = "Qtl",
  data
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(100, ...data.map(d => d.value));
  const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  const barWidth = Math.min(36, (chartWidth / data.length) * 0.55);

  const getX = (index: number) => {
    const slotWidth = chartWidth / data.length;
    return paddingLeft + index * slotWidth + slotWidth / 2 - barWidth / 2;
  };

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {title} <span className="text-xs font-normal text-slate-400 lowercase">{subtitle}</span>
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          🟢 Inventory Active
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const yPos = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars */}
          {data.map((item, index) => {
            const x = getX(index);
            const y = getY(item.value);
            const barH = paddingTop + chartHeight - y;
            const barColor = item.color || '#15803d';

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barH)}
                  rx="4"
                  ry="4"
                  fill={barColor}
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                />

                <text
                  x={x + barWidth / 2}
                  y={height - 12}
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {item.category.length > 8 ? `${item.category.substring(0, 7)}…` : item.category}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div className="mt-2 p-2 bg-slate-900 text-white rounded-xl text-xs flex justify-between items-center animate-in fade-in">
            <span className="font-bold">{data[hoverIndex].category}:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {data[hoverIndex].value.toLocaleString()} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
