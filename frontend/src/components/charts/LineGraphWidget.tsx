import React, { useState } from 'react';

export interface LineGraphDataPoint {
  label: string; // e.g. 'Jan', 'Sowing Stage', 'Harvest Cycle'
  revenue: number;
  expense: number;
  profit: number;
}

interface LineGraphWidgetProps {
  title?: string;
  subtitle?: string;
  data: LineGraphDataPoint[];
  height?: number;
}

export const LineGraphWidget: React.FC<LineGraphWidgetProps> = ({
  title,
  subtitle,
  data,
  height = 240
}) => {
  const [hoveredNode, setHoveredNode] = useState<{ pointIndex: number; series: string } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-slate-400 text-xs">
        <span>No line graph data available</span>
      </div>
    );
  }

  const width = 600;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate Y max
  const maxVal = Math.max(
    100,
    ...data.map((d) => Math.max(d.revenue, d.expense, Math.abs(d.profit)))
  );

  // X coordinate mapping
  const getX = (index: number) => {
    if (data.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  // Y coordinate mapping
  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Build SVG path strings
  const revenuePoints = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' L ');
  const expensePoints = data.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' L ');
  const profitPoints = data.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' L ');

  // Area fill paths
  const revenueArea = `M ${getX(0)},${getY(data[0].revenue)} L ${revenuePoints} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;
  const profitArea = `M ${getX(0)},${getY(data[0].profit)} L ${profitPoints} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  // Gridlines
  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];

  return (
    <div className="space-y-3">
      {(title || subtitle) && (
        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
          <div>
            {title && <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h4>}
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>

          {/* Graph Legend Badges */}
          <div className="flex items-center space-x-3 text-[11px] font-semibold">
            <span className="flex items-center space-x-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Income / Revenue</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Expenses</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Net Profit</span>
            </span>
          </div>
        </div>
      )}

      <div className="relative w-full overflow-x-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {yTicks.map((tick, i) => {
            const yPos = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  ₹{tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Gradient Areas */}
          <path d={revenueArea} fill="url(#revenueGrad)" />
          <path d={profitArea} fill="url(#profitGrad)" />

          {/* Trend Lines */}
          {/* Revenue Line (Green) */}
          <path
            d={`M ${revenuePoints}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expense Line (Red/Rose) */}
          <path
            d={`M ${expensePoints}`}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Net Profit Line (Blue) */}
          <path
            d={`M ${profitPoints}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes & X Axis Labels */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyRev = getY(d.revenue);
            const cyExp = getY(d.expense);
            const cyProf = getY(d.profit);

            return (
              <g key={i}>
                {/* X Axis Label */}
                <text
                  x={cx}
                  y={height - 12}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.label}
                </text>

                {/* Revenue Node Circle */}
                <circle
                  cx={cx}
                  cy={cyRev}
                  r="5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={() => setHoveredNode({ pointIndex: i, series: 'Revenue' })}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Expense Node Circle */}
                <circle
                  cx={cx}
                  cy={cyExp}
                  r="4"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredNode({ pointIndex: i, series: 'Expense' })}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Profit Node Circle */}
                <circle
                  cx={cx}
                  cy={cyProf}
                  r="5"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={() => setHoveredNode({ pointIndex: i, series: 'Profit' })}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredNode !== null && (
          <div className="mt-2 p-2 bg-slate-800 rounded-xl border border-slate-700 text-xs flex items-center justify-between animate-in fade-in">
            <span className="font-bold text-slate-300">
              {data[hoveredNode.pointIndex].label} — {hoveredNode.series}:
            </span>
            <span className="font-mono font-extrabold text-emerald-400">
              ₹ {
                hoveredNode.series === 'Revenue'
                  ? data[hoveredNode.pointIndex].revenue.toLocaleString()
                  : hoveredNode.series === 'Expense'
                  ? data[hoveredNode.pointIndex].expense.toLocaleString()
                  : data[hoveredNode.pointIndex].profit.toLocaleString()
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
