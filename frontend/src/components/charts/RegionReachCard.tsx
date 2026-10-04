import React from 'react';
import { MapPin, Globe } from 'lucide-react';

export interface RegionShareItem {
  region: string;
  percentage: number;
  color?: string;
}

interface RegionReachCardProps {
  title?: string;
  items: RegionShareItem[];
}

export const RegionReachCard: React.FC<RegionReachCardProps> = ({
  title = "Market Share & Regional Access",
  items
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </h3>
        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Mini Region Visual Box */}
      <div className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center justify-between shadow-inner">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest block">Geographic Coverage</span>
          <span className="text-sm font-extrabold text-white">Northern India Agricultural Hubs</span>
        </div>
        <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700">
          <MapPin className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>

      {/* Progress Sliders */}
      <div className="space-y-3 pt-1">
        {items.map((item, index) => (
          <div key={index} className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>{item.region}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono">{item.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div
                style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#16a34a' }}
                className="h-full rounded-full transition-all duration-700 shadow-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
