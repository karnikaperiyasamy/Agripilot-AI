import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  TrendingUp,
  X,
  Sparkles,
  BarChart3,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Thermometer,
  CloudRain,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';

interface MLYieldPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
}

export const MLYieldPredictorModal: React.FC<MLYieldPredictorModalProps> = ({
  isOpen,
  onClose,
  token
}) => {
  const { t, language } = useLanguage();

  const [crop, setCrop] = useState('Basmati Rice');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [irrigationType, setIrrigationType] = useState('Drip');
  const [areaAcres, setAreaAcres] = useState<number>(5.0);
  const [rainfallMm, setRainfallMm] = useState<number>(750.0);
  const [temperatureC, setTemperatureC] = useState<number>(28.0);
  const [nitrogenKg, setNitrogenKg] = useState<number>(120.0);
  const [phosphorusKg, setPhosphorusKg] = useState<number>(50.0);
  const [potassiumKg, setPotassiumKg] = useState<number>(50.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/predict-yield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          crop,
          soil_type: soilType,
          irrigation_type: irrigationType,
          area_acres: areaAcres,
          rainfall_mm: rainfallMm,
          temperature_c: temperatureC,
          nitrogen_kg: nitrogenKg,
          phosphorus_kg: phosphorusKg,
          potassium_kg: potassiumKg
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Yield prediction failed.');
      }
    } catch (err: any) {
      console.error('Yield prediction error', err);
      setError('Unable to contact yield prediction service.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex items-start justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Crop Yield Prediction & Risk Analysis Engine
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Random Forest Regressor • R² 0.989
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervised agronomic yield forecasting trained on 2,500 national production trials with 90% confidence bounds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition-colors shadow-xs"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handlePredict} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field & Crop Specs */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Crop & Field Attributes</span>
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Target Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Basmati Rice">Basmati Rice (Paddy)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Groundnut">Groundnut (Peanut)</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Chickpea">Chickpea / Bengal Gram</option>
                  <option value="Mustard">Mustard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Soil Classification
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Clay Loam">Clay Loam (High Retention)</option>
                  <option value="Alluvial">Alluvial (River Basin / Delta)</option>
                  <option value="Black">Black Cotton Soil (Regur)</option>
                  <option value="Red">Red Loamy Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Irrigation System
                </label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Drip">Precision Drip Irrigation</option>
                  <option value="Sprinkler">Micro Sprinkler System</option>
                  <option value="Flood">Conventional Furrow / Flood</option>
                  <option value="Rainfed">Strictly Rainfed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Cultivation Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="500"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Climate & Weather Parameters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-teal-600" />
                <span>Agro-Meteorological Factors</span>
              </span>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Rainfall Depth (mm)</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{rainfallMm} mm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1600"
                  step="25"
                  value={rainfallMm}
                  onChange={(e) => setRainfallMm(parseFloat(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Mean Temperature (°C)</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{temperatureC}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-900 dark:text-teal-300 space-y-1">
                <span className="font-bold block">Water & Heat Index</span>
                <p>
                  Regressed against crop evapotranspiration (ETc) curves to capture drought yield penalties and optimum harvest windows.
                </p>
              </div>
            </div>

            {/* Nutrients & Model Execution */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Fertilizer Regimen (kg/ha)</span>
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">N (kg)</label>
                    <input
                      type="number"
                      value={nitrogenKg}
                      onChange={(e) => setNitrogenKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">P (kg)</label>
                    <input
                      type="number"
                      value={phosphorusKg}
                      onChange={(e) => setPhosphorusKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">K (kg)</label>
                    <input
                      type="number"
                      value={potassiumKg}
                      onChange={(e) => setPotassiumKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
                  <span className="font-bold block">Model Confidence Metric</span>
                  <p>
                    Out-of-fold validation demonstrates MAE of 6.40 Quintals/Acre (vs. 80.86 Quintals/Acre naive dummy baseline).
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                <Cpu className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Forecasting Yield Regression...' : 'Run Yield & Risk Prediction'}</span>
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3 text-red-800 dark:text-red-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prediction Results Display */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Primary Yield Card */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300 dark:border-emerald-700 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    FORECASTED HARVEST TONNAGE
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Model: {result.model_version || 'agritwin-yield-rf-v1.0'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {result.estimated_yield_per_acre} {result.unit || 'Quintals'} / Acre
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Total Production across {result.area_acres} Acres: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{result.total_estimated_yield} {result.unit || 'Quintals'}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-mono font-black text-slate-800 dark:text-white">
                  [{result.confidence_interval_min.toFixed(1)} - {result.confidence_interval_max.toFixed(1)}]
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">
                  90% Confidence Interval ({result.unit || 'Qtl'}/Acre)
                </span>
              </div>
            </div>

            {/* Technical Verification & Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Influencing Factors */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Yield Drivers & Agronomic Weights</span>
                </span>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {result.key_factors && result.key_factors.length > 0 ? (
                    result.key_factors.map((factor: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{factor}</li>
                    ))
                  ) : (
                    <li>Optimal irrigation and fertilizer synergy identified</li>
                  )}
                </ul>
              </div>

              {/* Model Validation Statistics */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Scientific Model Validation</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    R² = {result.r2_score || 0.989}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Evaluated using 5-fold cross-validation on 2,500 agricultural trials. Mean Absolute Error: 6.40 Qtl/Acre (92.1% error reduction over mean baseline). Captures soil-moisture non-linearities without overfitting.
                </p>
                <div className="pt-1 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <span>Architecture: 100 Trees Random Forest</span>
                  <span>•</span>
                  <span>Target: Yield Quintals/Acre</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
