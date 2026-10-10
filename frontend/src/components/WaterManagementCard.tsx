import React, { useState, useEffect } from 'react';
import { Droplet, AlertTriangle, Clock, CloudRain, CheckCircle2 } from 'lucide-react';

export const WaterManagementCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaterAdvisory();
  }, []);

  const fetchWaterAdvisory = async () => {
    try {
      const res = await fetch('/api/ai/water-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: 'Basmati Rice', growthStage: 'Tillering' })
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.advisory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border animate-pulse h-36"></div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Droplet className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Smart Water Management</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
          FAO-56 Drip Engine
        </span>
      </div>

      <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-teal-900 dark:text-teal-200 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Recommended Today: Execute Drip Cycle</span>
          </span>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300">18mm Water Depth</span>
        </div>
        <p className="text-xs text-teal-800 dark:text-teal-300">
          {data?.reason || 'Soil moisture (38%) is below threshold. Schedule an 18mm drip cycle (~182,000 Liters/acre) early morning.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div>Timing: <strong className="text-slate-900 dark:text-white">{data?.recommendedTiming || '06:00 AM - 09:00 AM'}</strong></div>
        <div>Volume: <strong className="text-slate-900 dark:text-white">{(data?.waterVolumeLitersPerAcre || 182000).toLocaleString()} Liters</strong></div>
        <div>Rain Forecast: <strong className="text-slate-900 dark:text-white">{data?.rainForecastMm24h || 0.0} mm (Clear)</strong></div>
      </div>
    </div>
  );
};
