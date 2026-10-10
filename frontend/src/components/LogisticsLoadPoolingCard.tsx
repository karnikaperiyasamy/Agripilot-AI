import React, { useState, useEffect } from 'react';
import { Truck, Users, MapPin, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const LogisticsLoadPoolingCard: React.FC = () => {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoadPools();
  }, []);

  const fetchLoadPools = async () => {
    try {
      const res = await fetch('/api/logistics/load-pooling');
      const data = await res.json();
      if (data.success) {
        setPools(data.loadPools || []);
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
          <Truck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Smart Logistics & Load Pooling</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          Route Optimization Engine
        </span>
      </div>

      <div className="space-y-4">
        {pools.map((pool, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {pool.poolStatus}
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{pool.route}</h4>
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                Total Payload: {pool.totalWeightKg} kg ({pool.totalFarmers} Farmers)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {pool.farmers.map((f: any, fIdx: number) => (
                <div key={fIdx} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">{f.name}</span>
                  <span className="text-slate-500 text-[11px]">{f.weightKg} kg • {f.crop}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 dark:text-slate-400 pt-1 gap-2">
              <div>Matched Vehicle: <strong className="text-slate-900 dark:text-white">{pool.recommendedVehicleType}</strong></div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                Pooled Freight Cost: ₹{pool.totalTransportCostTotal.toLocaleString()} (Avg ₹{pool.costPerFarmerAvg.toLocaleString()}/farmer)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
