import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Calculator, X, TrendingUp, DollarSign, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProfitSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfitSimulatorModal: React.FC<ProfitSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { t, translateDynamic } = useLanguage();

  const [crop, setCrop] = useState('Basmati Rice');
  const [areaAcres, setAreaAcres] = useState('5.0');
  const [seedCost, setSeedCost] = useState('4500');
  const [fertilizerCost, setFertilizerCost] = useState('9000');
  const [pesticideCost, setPesticideCost] = useState('4500');
  const [labourCost, setLabourCost] = useState('12000');
  const [irrigationCost, setIrrigationCost] = useState('3500');
  const [otherExpenses, setOtherExpenses] = useState('2500');
  const [expectedYieldPerAcre, setExpectedYieldPerAcre] = useState('24.0');
  const [expectedSellingPrice, setExpectedSellingPrice] = useState('4200.0');
  const [transportCost, setTransportCost] = useState('5000');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/profit-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          areaAcres: parseFloat(areaAcres),
          seedCost: parseFloat(seedCost),
          fertilizerCost: parseFloat(fertilizerCost),
          pesticideCost: parseFloat(pesticideCost),
          labourCost: parseFloat(labourCost),
          irrigationCost: parseFloat(irrigationCost),
          otherExpenses: parseFloat(otherExpenses),
          expectedYieldPerAcre: parseFloat(expectedYieldPerAcre),
          expectedSellingPrice: parseFloat(expectedSellingPrice),
          transportCost: parseFloat(transportCost)
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Farm Profit Simulator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate total investments, expected yields, break-even price, and net margins
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Crop Name</label>
              <input
                type="text"
                required
                value={crop}
                onChange={e => setCrop(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Land Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                required
                value={areaAcres}
                onChange={e => setAreaAcres(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Expected Yield (Qtl/Acre)</label>
              <input
                type="number"
                step="0.5"
                required
                value={expectedYieldPerAcre}
                onChange={e => setExpectedYieldPerAcre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Seed Cost (₹)</label>
              <input
                type="number"
                required
                value={seedCost}
                onChange={e => setSeedCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Fertilizer Cost (₹)</label>
              <input
                type="number"
                required
                value={fertilizerCost}
                onChange={e => setFertilizerCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Pesticide Cost (₹)</label>
              <input
                type="number"
                required
                value={pesticideCost}
                onChange={e => setPesticideCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Labour Cost (₹)</label>
              <input
                type="number"
                required
                value={labourCost}
                onChange={e => setLabourCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Irrigation Cost (₹)</label>
              <input
                type="number"
                required
                value={irrigationCost}
                onChange={e => setIrrigationCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Transportation Cost (₹)</label>
              <input
                type="number"
                required
                value={transportCost}
                onChange={e => setTransportCost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Other Expenses (₹)</label>
              <input
                type="number"
                required
                value={otherExpenses}
                onChange={e => setOtherExpenses(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Expected Selling Price (₹ / Qtl)</label>
              <input
                type="number"
                required
                value={expectedSellingPrice}
                onChange={e => setExpectedSellingPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{loading ? 'Calculating Farm Profit Telemetry...' : 'Run Profit Simulation Engine'}</span>
          </button>
        </form>

        {result && (
          <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Simulation Analysis Results ({translateDynamic(result.crop)})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Total Investment</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">₹{result.totalInvestment.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-semibold">Expected Revenue</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">₹{result.expectedRevenue.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-md">
                <span className="text-xs opacity-90 block font-semibold">Estimated Net Profit</span>
                <span className="text-xl font-black">₹{result.estimatedProfit.toLocaleString()}</span>
                <span className="text-[11px] block mt-0.5 font-bold">({result.profitMarginPercent}% Margin)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block">Expected Production:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{result.expectedProductionQuintals} Quintals</strong>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block">Break-even Price:</span>
                <strong className="text-slate-900 dark:text-white text-sm">₹{result.breakEvenSellingPrice} / Qtl</strong>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block">Profit per Acre:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">₹{result.profitPerAcre.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block">Transport Expense:</span>
                <strong className="text-slate-900 dark:text-white text-sm">₹{result.costBreakdown.transportationCost.toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
