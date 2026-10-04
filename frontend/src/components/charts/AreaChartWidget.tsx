import React, { useState } from 'react';

export interface AreaChartPoint {
  label: string; // e.g. 'Jan', 'Feb', 'Mar'
  cost: number;
  revenue: number;
}

interface AreaChartWidgetProps {
  title?: string;
  subtitle?: string;
  totalValue?: string;
  data: AreaChartPoint[];
  costColor?: string;
  revenueColor?: string;
}

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = ({
  title = "Cost And Revenue",
  subtitle = "(Million Rupees)",
  totalValue = "Rs. 230.9k",
  data,
  costColor = "#16a34a",
  revenueColor = "#bef264"
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 700;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(100, ...data.map(d => Math.max(d.cost, d.revenue)));

  const getX = (index: number) => {
    if (data.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate smooth cubic bezier curve SVG path
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const costPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.cost) }));
  const revenuePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));

  const costCurve = createSmoothPath(costPoints);
  const revenueCurve = createSmoothPath(revenuePoints);

  const costArea = `${costCurve} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  const revenueArea = `${revenueCurve} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {title} <span className="text-xs font-normal text-slate-400">{subtitle}</span>
          </h3>
          <div className="text-2xl font-black text-slate-900 dark:text-emerald-400 mt-1">
            {totalValue}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: costColor }} />
            <span className="text-slate-700 dark:text-slate-300">Cost</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: revenueColor }} />
            <span className="text-slate-700 dark:text-slate-300">Revenue</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={costColor} stopOpacity="0.75" />
              <stop offset="100%" stopColor={costColor} stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={revenueColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor={revenueColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
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
                  x={paddingLeft - 8}
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

          {/* Area fills */}
          <path d={revenueArea} fill="url(#revenueGradient)" />
          <path d={costArea} fill="url(#costGradient)" />

          {/* Smooth curves */}
          <path d={revenueCurve} fill="none" stroke={revenueColor} strokeWidth="3" />
          <path d={costCurve} fill="none" stroke={costColor} strokeWidth="3" />

          {/* Data Nodes & X Axis Labels */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyRevenue = getY(d.revenue);
            const cyCost = getY(d.cost);

            return (
              <g key={i}>
                <text
                  x={cx}
                  y={height - 10}
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.label}
                </text>

                {/* Revenue Node */}
                <circle
                  cx={cx}
                  cy={cyRevenue}
                  r="4"
                  fill={revenueColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />

                {/* Cost Node */}
                <circle
                  cx={cx}
                  cy={cyCost}
                  r="4"
                  fill={costColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div className="mt-2 p-2 bg-slate-900 text-white rounded-xl text-xs flex justify-between items-center animate-in fade-in">
            <span className="font-bold">{data[hoverIndex].label}:</span>
            <div className="flex space-x-4">
              <span className="text-emerald-400 font-mono">Revenue: Rs. {data[hoverIndex].revenue.toLocaleString()}</span>
              <span className="text-lime-400 font-mono">Cost: Rs. {data[hoverIndex].cost.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
