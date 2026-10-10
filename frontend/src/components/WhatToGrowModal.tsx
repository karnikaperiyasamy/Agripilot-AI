import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Sparkles, X, Compass, CheckCircle2, AlertTriangle, Droplets, ArrowRight } from 'lucide-react';

interface WhatToGrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatToGrowModal: React.FC<WhatToGrowModalProps> = ({ isOpen, onClose }) => {
  const { t, translateDynamic } = useLanguage();

  const [location, setLocation] = useState('Ludhiana, Punjab');
  const [soilType, setSoilType] = useState('Alluvial');
  const [season, setSeason] = useState('Kharif');
  const [waterAvailability, setWaterAvailability] = useState('High (Drip/Borewell)');
  const [farmSizeAcres, setFarmSizeAcres] = useState('5.0');
  const [budgetRs, setBudgetRs] = useState('50000');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/what-to-grow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          soilType,
          season,
          waterAvailability,
          farmSizeAcres: parseFloat(farmSizeAcres),
          budgetRs: parseFloat(budgetRs)
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI "What Should I Grow?" System</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-crop agronomic suitability recommendations tailored to your soil, water, season, and budget
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRecommend} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Farmer Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={e => setSoilType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="Alluvial">Alluvial Soil</option>
              <option value="Loamy">Loamy Soil</option>
              <option value="Black Cotton">Black Cotton Soil</option>
              <option value="Red / Laterite">Red / Laterite Soil</option>
              <option value="Clayey">Clayey Soil</option>
            </select>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Sowing Season</label>
            <select
              value={season}
              onChange={e => setSeason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="Kharif">Kharif (Monsoon / Summer)</option>
              <option value="Rabi">Rabi (Winter / Spring)</option>
              <option value="Zaid">Zaid (Summer Short)</option>
              <option value="Year-round">Year-round Horticulture</option>
            </select>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Water Availability</label>
            <input
              type="text"
              value={waterAvailability}
              onChange={e => setWaterAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Farm Size (Acres)</label>
            <input
              type="number"
              value={farmSizeAcres}
              onChange={e => setFarmSizeAcres(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Input Budget (₹)</label>
            <input
              type="number"
              value={budgetRs}
              onChange={e => setBudgetRs(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{loading ? 'Evaluating Crop Suitability Models...' : 'Analyze & Recommend Crops'}</span>
            </button>
          </div>
        </form>

        {recommendations.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Top Recommended Crops ({recommendations.length} Candidates Evaluated)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-white text-base">{translateDynamic(rec.cropName)}</h4>
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-lg border border-emerald-300 dark:border-emerald-800">
                        {rec.suitabilityScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{rec.explanation}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>Water Req: <strong className="text-slate-900 dark:text-white">{rec.waterRequirement}</strong></div>
                      <div>Season: <strong className="text-slate-900 dark:text-white">{rec.suitableSeason}</strong></div>
                      <div>Est Cost: <strong className="text-slate-900 dark:text-white">{rec.estimatedCultivationCostPerAcre}</strong></div>
                      <div>Est Yield: <strong className="text-slate-900 dark:text-white">{rec.expectedYieldRange}</strong></div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      Est. Profitability: <strong className="font-extrabold text-emerald-700 dark:text-emerald-400">{rec.expectedProfitabilityPerAcre}</strong>
                    </div>

                    <div className="text-[11px] text-rose-700 dark:text-rose-400 flex items-start space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Risk: {rec.majorRisks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
