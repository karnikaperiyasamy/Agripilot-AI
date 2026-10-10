import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Factory, TrendingUp, ShieldCheck, MapPin, AlertCircle, FileSpreadsheet, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

export const EnterprisePortalPage: React.FC = () => {
  const { token } = useAuth();
  const { translateDynamic } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [buyerOrg, setBuyerOrg] = useState('Apex Foods & Processing Ltd');
  const [cropName, setCropName] = useState('Pusa Basmati 1121 Rice');
  const [quantity, setQuantity] = useState('5000');
  const [budgetPrice, setBudgetPrice] = useState('4350');
  const [location, setLocation] = useState('Central Grain Terminal, Tamil Nadu');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEnterpriseData();
  }, [token]);

  const fetchEnterpriseData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/forecasts');
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

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/enterprise/intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          buyerOrganization: buyerOrg,
          cropName,
          requiredQuantityQuintals: parseFloat(quantity),
          maxBudgetPerQuintal: parseFloat(budgetPrice),
          deliveryLocation: location
        })
      });
      const resData = await res.json();
      if (res.ok) {
        alert(`Procurement Intent Published! Intent ID: ${resData.data.intentId}`);
        setShowIntentModal(false);
        fetchEnterpriseData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Factory className="w-4 h-4" />
            <span>Enterprise B2B Supply Chain Intelligence Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">Food Processors & Bulk Procurement</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Harvest availability heatmaps, supplier reliability scores, quality rejection analytics, and bulk contract bidding.
          </p>
        </div>

        <button
          onClick={() => setShowIntentModal(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Bulk Procurement Intent</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading B2B supply chain forecasts and quality telemetry...</div>
      ) : (
        <div className="space-y-8">
          {/* Supply Heatmap Cards */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Regional Crop Supply Forecast Heatmap</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated upcoming harvest availability across regional agricultural zones</p>
              </div>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-3 py-1 rounded-full">
                Regional Forecast Updated Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data?.supplyHeatmap || []).map((item: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                    {item.region}
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{item.cropName}</h3>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {item.estimatedHarvestQuintals.toLocaleString()} Qtl
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                    <div>Peak Inflow: <strong className="text-slate-800 dark:text-slate-200">{item.peakAvailability}</strong></div>
                    <div>Avg Price: <strong className="text-emerald-600 dark:text-emerald-400">₹{item.avgMandiPrice} / Qtl</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Supplier Reliability & Quality Rejection Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Supplier Reliability Index (FPOs & Wholesalers)</span>
              </h3>
              <div className="space-y-3 text-xs">
                {(data?.supplierReliability || []).map((sup: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white text-sm block">{sup.supplierName}</strong>
                      <span className="text-slate-500">{sup.fulfilledOrders} Contracts Fulfilled</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{sup.reliabilityScore}% Score</span>
                      <span className="text-[11px] text-slate-400 block">{sup.qualityPassRate}% QC Pass</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>Quality Inspection & Rejection Telemetry</span>
              </h3>
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-3 text-xs">
                <div className="flex justify-between items-center text-rose-900 dark:text-rose-200 font-extrabold">
                  <span>Rejection Rate:</span>
                  <span className="text-lg text-rose-600 font-black">{data?.qualityRejectionStats?.rejectionRatePercent}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>Inspected: <strong>{(data?.qualityRejectionStats?.totalInspectedQuintals || 12500).toLocaleString()} Qtl</strong></div>
                  <div>Accepted: <strong>{(data?.qualityRejectionStats?.acceptedQuintals || 12150).toLocaleString()} Qtl</strong></div>
                </div>
                <div className="text-[11px] text-rose-800 dark:text-rose-300 border-t border-rose-200 dark:border-rose-800/60 pt-2">
                  Common rejection triggers: {data?.qualityRejectionStats?.commonRejectionReasons?.join(' • ')}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Procurement Intent Modal */}
      {showIntentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Publish Enterprise Bulk Procurement Intent</h3>
            <form onSubmit={handleCreateIntent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Buyer Organization</label>
                <input
                  type="text"
                  required
                  value={buyerOrg}
                  onChange={e => setBuyerOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Budget (₹ / Qtl)</label>
                  <input
                    type="number"
                    required
                    value={budgetPrice}
                    onChange={e => setBudgetPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Delivery Destination</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntentModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500"
                >
                  {submitting ? 'Publishing...' : 'Publish Intent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
