import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, X, CheckCircle2, ShieldCheck, Truck, MapPin, Award, ExternalLink } from 'lucide-react';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();

  const [cropName, setCropName] = useState('Pusa Basmati 1121 Rice');
  const [variety, setVariety] = useState('A-Grade Superlong Grain');
  const [qualityGrade, setQualityGrade] = useState('Grade A Export Quality');
  const [quantityQuintals, setQuantityQuintals] = useState('150');
  const [testingDetails, setTestingDetails] = useState('Pesticide Residue Free / Organic Certified');
  const [farmName, setFarmName] = useState('Golden Fields Organic Farm');
  const [location, setLocation] = useState('Ludhiana, Punjab');

  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/traceability/create-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName,
          variety,
          qualityGrade,
          quantityQuintals: parseFloat(quantityQuintals),
          testingDetails,
          farmName,
          location
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreatedBatch(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Farm-to-Fork QR Traceability</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate verified harvest batch codes with audit trail for wholesale buyers & consumers
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdBatch ? (
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quality Grade</label>
                <input
                  type="text"
                  value={qualityGrade}
                  onChange={e => setQualityGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  required
                  value={quantityQuintals}
                  onChange={e => setQuantityQuintals(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Testing & Lab Certification Details</label>
              <input
                type="text"
                value={testingDetails}
                onChange={e => setTestingDetails(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{submitting ? 'Generating Verified QR Batch...' : 'Generate Verified Crop Batch QR'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
            <div className="inline-block p-4 bg-white dark:bg-slate-950 rounded-2xl border-2 border-emerald-500 shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/trace/' + createdBatch.batchCode)}`}
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
              <span className="block font-black text-slate-900 dark:text-white text-base mt-2 tracking-widest">{createdBatch.batchCode}</span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Crop:</span>
                <strong className="text-slate-900 dark:text-white">{createdBatch.cropName} ({createdBatch.qualityGrade})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Producer:</span>
                <strong className="text-slate-900 dark:text-white">{createdBatch.farmerName} - {createdBatch.farmName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lab Certification:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">{createdBatch.testingDetails}</strong>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <a
                href={`/trace/${createdBatch.batchCode}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <span>View Consumer Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setCreatedBatch(null)}
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Create Another Batch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
