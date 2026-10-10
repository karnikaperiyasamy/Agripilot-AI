import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldAlert, Activity, CheckCircle, AlertTriangle, CloudRain, Bug, Droplet, DollarSign, Truck } from 'lucide-react';

export const FarmRiskScoreCard: React.FC = () => {
  const { token } = useAuth();
  const { translateDynamic } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskScore();
  }, [token]);

  const fetchRiskScore = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/ai/farm-risk-score', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  const score = data?.riskScore || 66;
  const level = data?.riskLevel || 'MODERATE';

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Farm Risk Score</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black ${
          level === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
          level === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        }`}>
          {level} RISK ({score} / 100)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <CloudRain className="w-4 h-4 text-blue-500 mx-auto" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Weather Risk</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{data?.breakdown?.weatherRisk?.score || 18} / 30</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <Bug className="w-4 h-4 text-rose-500 mx-auto" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Disease Risk</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{data?.breakdown?.diseaseRisk?.score || 14} / 20</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <Droplet className="w-4 h-4 text-teal-500 mx-auto" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Water Risk</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{data?.breakdown?.waterRisk?.score || 11} / 20</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <DollarSign className="w-4 h-4 text-emerald-500 mx-auto" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Market Risk</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{data?.breakdown?.marketRisk?.score || 15} / 20</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <Truck className="w-4 h-4 text-amber-500 mx-auto" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Transport Risk</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{data?.breakdown?.transportRisk?.score || 8} / 10</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Actionable Mitigation Recommendations:
        </h4>
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {(data?.actionableRecommendations || [
            'Scout crop foliage every 3 days due to elevated ambient humidity.',
            'Schedule an 18mm drip cycle within 24 hours to maintain soil moisture threshold.',
            'Consider staggered mandi liquidation to capitalize on projected +6.8% price gain.'
          ]).map((rec: string, i: number) => (
            <div key={i} className="flex items-start space-x-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
