import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, X, Plus, Calendar, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

interface DigitalFarmDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalFarmDiaryModal: React.FC<DigitalFarmDiaryModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [cropName, setCropName] = useState('Pusa Basmati 1121 Rice');
  const [activityType, setActivityType] = useState('Fertilizer');
  const [details, setDetails] = useState('');
  const [quantityOrArea, setQuantityOrArea] = useState('5 Bags');
  const [costAmount, setCostAmount] = useState('2850');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchEntries();
  }, [isOpen, token]);

  const fetchEntries = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/diary/entries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/diary/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName,
          activityType,
          details,
          quantityOrArea,
          costAmount: parseFloat(costAmount)
        })
      });

      if (res.ok) {
        setDetails('');
        setCostAmount('0');
        fetchEntries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Digital Farm Diary</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log sowing, fertilization, irrigation, labour & expense records automatically synced with Profit Simulator
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Entry Form */}
        <form onSubmit={handleCreate} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Log New Activity / Expense Entry</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Crop Name</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Activity Type</label>
              <select
                value={activityType}
                onChange={e => setActivityType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Sowing">Sowing / Planting</option>
                <option value="Fertilizer">Fertilizer Application</option>
                <option value="Pesticide">Pesticide Spray</option>
                <option value="Irrigation">Irrigation Cycle</option>
                <option value="Labour">Labour Work</option>
                <option value="Harvest">Harvesting</option>
                <option value="Expense">Other Expense</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cost / Expenditure (₹)</label>
              <input
                type="number"
                value={costAmount}
                onChange={e => setCostAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity / Area / Details</label>
              <input
                type="text"
                value={quantityOrArea}
                placeholder="e.g. 5 Bags / 18mm Drip"
                onChange={e => setQuantityOrArea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Activity Notes</label>
              <input
                type="text"
                value={details}
                placeholder="e.g. Applied Neem-Coated Urea 45kg bag"
                onChange={e => setDetails(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Recording Log Entry...' : 'Save Diary Entry'}</span>
          </button>
        </form>

        {/* Entries History */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Recent Farm Diary Logs</h3>
          {loading ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading digital diary records...</div>
          ) : entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map(e => (
                <div key={e.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold">
                        {e.activityType}
                      </span>
                      <span>{e.cropName}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{e.details || e.quantityOrArea || 'Activity completed'}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(e.activityDate).toLocaleDateString()}</span>
                  </div>
                  {e.costAmount > 0 && (
                    <div className="text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{e.costAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">No diary entries logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
