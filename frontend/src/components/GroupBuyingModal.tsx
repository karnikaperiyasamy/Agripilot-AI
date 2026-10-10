import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Users, X, ShoppingCart, Tag, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface GroupBuyingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupBuyingModal: React.FC<GroupBuyingModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const { translateDynamic } = useLanguage();

  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [quantity, setQuantity] = useState('5');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (isOpen) fetchPools();
  }, [isOpen]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/group-buying/pools');
      const data = await res.json();
      if (data.success) {
        setPools(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool || !token) return;
    setJoining(true);
    try {
      const res = await fetch('/api/group-buying/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          poolId: selectedPool.id,
          quantity: parseFloat(quantity)
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Successfully joined group purchase!');
        setSelectedPool(null);
        fetchPools();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Farmer Group Purchase Pools</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join collective input buying pools for seeds, fertilizers & equipment to unlock wholesale bulk discounts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading active group buying pools...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pools.map(pool => {
              const progressPercent = Math.min(100, Math.round((pool.currentQuantity / pool.targetQuantity) * 100));
              const discountPercent = Math.round(((pool.basePricePerUnit - pool.discountPricePerUnit) / pool.basePricePerUnit) * 100);

              return (
                <div key={pool.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-4 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-extrabold">
                        {pool.category}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-black">
                        SAVE {discountPercent}%
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{pool.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pool.itemDetails}</p>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Retail Price:</span>
                        <span className="line-through text-slate-400">₹{pool.basePricePerUnit} / {pool.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Group Bulk Price:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{pool.discountPricePerUnit} / {pool.unit}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Pooled Progress</span>
                        <span className="font-bold text-slate-900 dark:text-white">{pool.currentQuantity} / {pool.targetQuantity} {pool.unit}s</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPool(pool)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Join Group Purchase</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Join Order Modal */}
        {selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Join Group Order: {selectedPool.title}</h3>
              <form onSubmit={handleJoin} className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                  <div>Bulk Price: <strong className="text-emerald-600 dark:text-emerald-400">₹{selectedPool.discountPricePerUnit} / {selectedPool.unit}</strong></div>
                  <div>Standard Price: <span className="line-through text-slate-400">₹{selectedPool.basePricePerUnit}</span></div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Order Quantity ({selectedPool.unit}s)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-300 font-extrabold flex justify-between">
                  <span>Total Calculated Cost:</span>
                  <span>₹{(parseFloat(quantity || '0') * selectedPool.discountPricePerUnit).toLocaleString()}</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPool(null)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joining}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500"
                  >
                    {joining ? 'Confirming...' : 'Confirm Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
