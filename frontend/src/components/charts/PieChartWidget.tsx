import React, { useState } from 'react';

export interface PieChartSegment {
  label: string;
  value: number;
  color: string;
}

interface PieChartWidgetProps {
  title?: string;
  subtitle?: string;
  data: PieChartSegment[];
  size?: number;
  innerRadius?: number; // for Donut style
}

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({
  title,
  subtitle,
  data,
  size = 170,
  innerRadius = 50
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center text-slate-400 text-xs">
        <span>No chart data recorded yet</span>
      </div>
    );
  }

  const radius = size / 2;
  const center = radius;

  // Calculate slice coordinates
  let cumulativeAngle = 0;

  const slices = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    const percentage = Math.round((item.value / total) * 100);

    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Outer arc points
    const x1 = center + (radius - 10) * Math.cos(startRad);
    const y1 = center + (radius - 10) * Math.sin(startRad);
    const x2 = center + (radius - 10) * Math.cos(endRad);
    const y2 = center + (radius - 10) * Math.sin(endRad);

    // Inner arc points (donut hole)
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    // SVG path string for Donut slice
    const pathData = sliceAngle >= 359.9
      ? `M ${center} ${center - (radius - 10)}
         A ${radius - 10} ${radius - 10} 0 1 1 ${center - 0.01} ${center - (radius - 10)}
         L ${center - 0.01} ${center - innerRadius}
         A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
      : `M ${x1} ${y1}
         A ${radius - 10} ${radius - 10} 0 ${largeArcFlag} 1 ${x2} ${y2}
         L ${x3} ${y3}
         A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;

    return {
      ...item,
      percentage,
      pathData,
      index
    };
  });

  const activeSlice = activeIndex !== null ? slices[activeIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4 overflow-hidden h-full">
      {(title || subtitle) && (
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Donut Allocation
          </span>
        </div>
      )}

      {/* Donut Chart Display */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible transform drop-shadow-sm">
            {slices.map((slice) => (
              <path
                key={slice.index}
                d={slice.pathData}
                fill={slice.color}
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                style={{
                  transform: activeIndex === slice.index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${center}px ${center}px`
                }}
                onMouseEnter={() => setActiveIndex(slice.index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            ))}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate max-w-[100px]">
              {activeSlice ? activeSlice.label : 'TOTAL'}
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
              {activeSlice ? `${activeSlice.percentage}%` : `₹ ${total.toLocaleString()}`}
            </span>
            {activeSlice && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ₹ {activeSlice.value.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-1.5 text-xs min-w-0">
          {slices.map((slice) => (
            <div
              key={slice.index}
              onMouseEnter={() => setActiveIndex(slice.index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`p-2 rounded-xl transition-all border flex items-center justify-between cursor-pointer min-w-0 ${
                activeIndex === slice.index
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 font-bold shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2 truncate min-w-0 mr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate text-xs">{slice.label}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-extrabold text-slate-900 dark:text-white block text-xs">₹ {slice.value.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{slice.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
