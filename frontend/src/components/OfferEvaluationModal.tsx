import React, { useState } from 'react';
import { Sparkles, X, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OfferEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: any;
}

export const OfferEvaluationModal: React.FC<OfferEvaluationModalProps> = ({ isOpen, onClose, offer }) => {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  if (!isOpen || !offer) return null;

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/evaluate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredPrice: offer.offeredPrice || offer.askingPricePerUnit,
          cropName: offer.cropName || 'Basmati Rice',
          quantityQuintals: offer.quantity || 100,
          qualityGrade: offer.qualityGrade || 'Grade A'
        })
      });

      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Offer Evaluation Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <div>Crop: <strong className="text-slate-900 dark:text-white">{offer.cropName || 'Basmati Rice'}</strong></div>
          <div>Buyer Offered Price: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">₹{offer.offeredPrice || offer.askingPricePerUnit} / Qtl</strong></div>
          <div>Quantity: <strong className="text-slate-900 dark:text-white">{offer.quantity || 100} Quintals</strong></div>
        </div>

        {!evaluation ? (
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{loading ? 'Evaluating Mandi Benchmarks & Costs...' : 'Ask AI: "Is this offer reasonable?"'}</span>
          </button>
        ) : (
          <div className="space-y-4 pt-1 animate-in fade-in duration-300 text-xs">
            <div className={`p-4 rounded-2xl border ${
              evaluation.isReasonable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
            } space-y-2`}>
              <div className="flex items-center justify-between font-black text-sm">
                <span>{evaluation.recommendation}</span>
                <span>{evaluation.priceVariancePercent > 0 ? `+${evaluation.priceVariancePercent}%` : `${evaluation.priceVariancePercent}%`}</span>
              </div>
              <p>{evaluation.rationale}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500 block">Regional Mandi Benchmark</span>
                <strong className="text-slate-900 dark:text-white">₹{evaluation.benchmarkMarketPrice} / Qtl</strong>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500 block">Buyer Offered Price</span>
                <strong className="text-emerald-600 dark:text-emerald-400">₹{evaluation.offeredPrice} / Qtl</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
