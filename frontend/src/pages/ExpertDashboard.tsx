import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  ShieldAlert,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ExpertDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t, translateDynamic } = useLanguage();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Prescription modal
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');

  useEffect(() => {
    fetchCases();
  }, [token]);

  const fetchCases = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/expert/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCases(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !diagnosis || !prescription) return;
    try {
      const res = await fetch(`/api/expert/cases/${selectedCase.id}/prescribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ diagnosisNotes: diagnosis, prescription })
      });
      if (res.ok) {
        alert(t.expert.prescribedAlert);
        setSelectedCase(null);
        setDiagnosis('');
        setPrescription('');
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.expert.bannerTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
            {t.expert.bannerSub}
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-xs">
          <span>{t.expert.activeQueue} <strong>{cases.length} {t.expert.farmerCases}</strong></span>
        </div>
      </div>

      {/* Case Review Queue */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900">{t.expert.casesTitle}</h2>
          <p className="text-xs text-slate-500">{t.expert.casesSub}</p>
        </div>

        <div className="space-y-4">
          {cases.length === 0 ? (
            <div className="text-slate-400 text-xs py-8 text-center">{t.expert.noCases}</div>
          ) : (
            cases.map(c => (
              <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {translateDynamic(c.cropCycle?.crop?.name || 'Cereal Crop')} {t.expert.foliarCase}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      c.expertReviewStatus === 'REVIEWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {translateDynamic(c.expertReviewStatus)}
                    </span>
                  </div>

                  <p className="text-slate-600 italic">"{c.symptomDescription || 'Yellowing lesions on leaf margins with water-soaked edges.'}"</p>

                  <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                    <span>{t.expert.farmerLabel} <strong>{c.observer?.name}</strong></span>
                    <span>{t.expert.aiPredicted} <strong className="text-indigo-700">{c.aiPredictionClass || 'Rice Bacterial Blight'}</strong></span>
                    <span>{t.expert.confidenceLabel} <strong>{c.aiConfidence || 88.5}%</strong></span>
                  </div>

                  {c.expertCases?.length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                      <div><strong>{t.expert.prescriptionGiven}</strong> {c.expertCases[0].prescription}</div>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCase(c);
                      setDiagnosis(`Verified: ${c.aiPredictionClass || 'Bacterial Leaf Blight'}`);
                      setPrescription('Apply Copper Oxychloride 50% WP @ 2.5g/L + Streptomycin @ 100g/acre. Cease excess nitrogen.');
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    {t.expert.provideBtn}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* PRESCRIPTION MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">{t.expert.modalTitle}</h3>
            <form onSubmit={handlePrescribe} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.expert.diagLabel}</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.expert.treatmentLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.expert.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800"
                >
                  {t.expert.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
