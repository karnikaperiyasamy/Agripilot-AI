import React, { useState, useEffect } from 'react';
import { Bug, AlertCircle, ShieldCheck, Search } from 'lucide-react';

export const PestForecastCard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPestForecast();
  }, []);

  const fetchPestForecast = async () => {
    try {
      const res = await fetch('/api/ai/pest-forecast?crop=Basmati%20Rice');
      const resData = await res.json();
      if (resData.success) {
        setData(resData.pestForecasts || []);
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
          <Bug className="w-5 h-5 text-rose-500" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Pest Risk Forecast</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
          Seasonal Predictive Model
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">{item.pestName}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {item.riskLevel} RISK ({item.probabilityPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Symptoms: <strong className="text-slate-800 dark:text-slate-200">{item.symptoms.join(', ')}</strong>
            </p>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Preventive protocol: {item.preventiveMeasures.join(' • ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
