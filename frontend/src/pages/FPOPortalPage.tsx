import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Users, Building2, Package, ShoppingCart, Layers, Plus, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const FPOPortalPage: React.FC = () => {
  const { token } = useAuth();
  const { translateDynamic } = useLanguage();
  const [fpos, setFpos] = useState<any[]>([]);
  const [activeFpo, setActiveFpo] = useState<any>(null);
  const [aggregation, setAggregation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fpoName, setFpoName] = useState('Erode Organic Turmeric Farmers Producer Co. Ltd');
  const [regNum, setRegNum] = useState(`U01110TN2026PTC${Math.floor(10000 + Math.random() * 90000)}`);
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Erode');
  const [primaryCrop, setPrimaryCrop] = useState('Organic Turmeric & Sugarcane');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFpos();
  }, [token]);

  const fetchFpos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fpo/organizations');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setFpos(data.data);
        setActiveFpo(data.data[0]);
        fetchAggregation(data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregation = async (fpoId: string) => {
    try {
      const res = await fetch(`/api/fpo/organizations/${fpoId}/aggregation`);
      const data = await res.json();
      if (data.success) {
        setAggregation(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFPO = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/fpo/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: fpoName,
          registrationNumber: regNum,
          state,
          district,
          totalMembers: 120,
          primaryCrop
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchFpos();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl text-white p-6 sm:p-8 shadow-2xl border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>FPO & Cooperative Tenant Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">Farmer Producer Organizations</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Aggregate member produce, coordinate group procurement, share heavy machinery assets, and negotiate direct wholesale contracts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New FPO</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading FPO organizations and inventory telemetry...</div>
      ) : (
        <div className="space-y-8">
          {/* FPO Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fpos.map(fpo => (
              <div
                key={fpo.id}
                onClick={() => {
                  setActiveFpo(fpo);
                  fetchAggregation(fpo.id);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  activeFpo?.id === fpo.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {fpo.state} • {fpo.district}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{fpo.totalMembers} Members</span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{fpo.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reg: {fpo.registrationNumber}</p>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  Focus Crop: {fpo.primaryCrop}
                </div>
              </div>
            ))}
          </div>

          {/* Active FPO Aggregation View */}
          {aggregation && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{aggregation.fpoName} - Aggregated Produce Inventory</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Combined member harvest volumes ready for B2B buyer procurement contracts</p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full">
                  {aggregation.memberCount} Verified Farmers Aggregated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(aggregation.aggregatedInventory || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">{item.cropName}</span>
                      <span className="text-xs font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                        {item.qualityGrade}
                      </span>
                    </div>

                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {item.totalQuantityQuintals.toLocaleString()} Quintals
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
                      Ready for Procurement: <strong>{item.readyDate}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create FPO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Register New FPO Organization</h3>
            <form onSubmit={handleCreateFPO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={fpoName}
                  onChange={e => setFpoName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">CIN / Registration Number</label>
                <input
                  type="text"
                  required
                  value={regNum}
                  onChange={e => setRegNum(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Produce Crops</label>
                <input
                  type="text"
                  value={primaryCrop}
                  onChange={e => setPrimaryCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500"
                >
                  {creating ? 'Registering...' : 'Register FPO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
