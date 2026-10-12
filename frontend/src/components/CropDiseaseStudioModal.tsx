import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Camera,
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  GitCompare,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Leaf,
  Activity,
  ChevronRight
} from 'lucide-react';

interface CropDiseaseStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
}

export const CropDiseaseStudioModal: React.FC<CropDiseaseStudioModalProps> = ({
  isOpen,
  onClose,
  token
}) => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  // Scanner state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState('Rice');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // History & Comparison state
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Close on escape & lock body scroll
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

  // Load history when modal opens or history tab clicked
  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/ai/diagnosis-history', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load diagnosis history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setScanError(null);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleRunDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('crop_hint', cropHint);

      const res = await fetch('/api/ai/classify-disease', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setScanResult(data.data);
      } else {
        setScanError(data.message || 'Diagnosis failed. Please verify the image file.');
      }
    } catch (err: any) {
      console.error('Diagnosis error', err);
      setScanError('Network or server error while running diagnosis inference.');
    } finally {
      setScanning(false);
    }
  };

  const toggleSelectHistory = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        // Keep the latest selected and replace the oldest
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleRunComparison = async () => {
    if (selectedIds.length !== 2) return;
    setComparing(true);
    setComparisonResult(null);

    try {
      const res = await fetch('/api/ai/diagnosis-compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id1: selectedIds[0],
          id2: selectedIds[1]
        })
      });

      const data = await res.json();
      if (data.success) {
        setComparisonResult(data.data);
      } else {
        alert(data.message || 'Failed to compare diagnoses');
      }
    } catch (err) {
      console.error('Comparison error', err);
    } finally {
      setComparing(false);
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
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Intelligent Crop Health & Disease Studio
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  PyTorch CNN 14-Class
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Foliar leaf visual pathology detection, uncertainty quantification, and temporal progression comparison
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 space-x-2 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all ${
              activeTab === 'scan'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Foliar Leaf Diagnostic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Diagnosis History & Progression Studio</span>
          </button>
        </div>

        {/* Tab 1: Live Diagnostic Scanner */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            <form onSubmit={handleRunDiagnosis} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image upload area */}
                <div className="md:col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex flex-col items-center justify-center relative min-h-[200px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="disease-leaf-input"
                  />
                  <label htmlFor="disease-leaf-input" className="cursor-pointer block w-full">
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={previewUrl}
                          alt="Foliar preview"
                          className="max-h-48 mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700 object-contain"
                        />
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {file?.name} ({(file?.size ? file.size / 1024 : 0).toFixed(1)} KB)
                        </p>
                        <p className="text-[11px] text-slate-400">Click to choose a different leaf photo</p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Camera className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          Upload Leaf Photo for PyTorch CNN Analysis
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Supports PNG, JPG, WebP. High resolution close-ups of upper/lower leaf surfaces recommended.
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Configuration / Options */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Crop Specimen Hint
                      </label>
                      <select
                        value={cropHint}
                        onChange={(e) => setCropHint(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="Rice">Paddy / Rice (Oryza sativa)</option>
                        <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                        <option value="Potato">Potato (Solanum tuberosum)</option>
                        <option value="Corn">Corn / Maize (Zea mays)</option>
                        <option value="Wheat">Wheat (Triticum aestivum)</option>
                        <option value="Cotton">Cotton (Gossypium hirsutum)</option>
                        <option value="Apple">Apple Foliage</option>
                        <option value="General">General Foliage / Auto-Detect</option>
                      </select>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Preprocessing Pipeline</span>
                      </div>
                      <p>
                        Input is normalized (ImageNet mean & std), resized to 256×256 RGB, and processed by deep convolutional layers with ReLU activations.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!file || scanning}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
                  >
                    <Sparkles className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                    <span>{scanning ? 'Running Neural Inference...' : 'Diagnose Foliar Health'}</span>
                  </button>
                </div>
              </div>
            </form>

            {scanError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3 text-red-800 dark:text-red-300 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Diagnostic Results Card */}
            {scanResult && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Primary Banner */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    scanResult.is_healthy
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        scanResult.is_healthy
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {scanResult.is_healthy ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <ShieldAlert className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base">{scanResult.display_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            scanResult.is_healthy
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {scanResult.is_healthy ? 'HEALTHY LEAF' : 'PATHOLOGY DETECTED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Crop Category: {scanResult.crop} • Model: {scanResult.model_version}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                      {scanResult.confidence}%
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">
                      Confidence Score
                    </span>
                  </div>
                </div>

                {/* Uncertainty Warning Alert */}
                {(scanResult.is_uncertain || scanResult.confidence < 70) && (
                  <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-700 rounded-xl flex items-start space-x-2.5 text-xs text-yellow-900 dark:text-yellow-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Uncertain Diagnosis Alert: </span>
                      Model classification confidence is below the high-reliability threshold (70%). Lesion patterns may be in early incubation stage or shadowed. A secondary field scan or agricultural officer confirmation is advised.
                    </div>
                  </div>
                )}

                {/* Top-3 Candidates Probability Distribution */}
                {scanResult.top_classes && scanResult.top_classes.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Top Class Probability Distribution</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Softmax Output</span>
                    </div>

                    <div className="space-y-2">
                      {scanResult.top_classes.map((cand: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-700 dark:text-slate-300">{cand.display_name}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {cand.probability_percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0
                                  ? 'bg-emerald-600 dark:bg-emerald-500'
                                  : idx === 1
                                  ? 'bg-teal-500'
                                  : 'bg-slate-400 dark:bg-slate-500'
                              }`}
                              style={{ width: `${Math.min(100, cand.probability_percent)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Protocols */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Symptoms */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Identified Symptoms</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {scanResult.symptoms && scanResult.symptoms.length > 0 ? (
                        scanResult.symptoms.map((s: string, i: number) => <li key={i}>{s}</li>)
                      ) : (
                        <li>No acute foliar symptoms visible</li>
                      )}
                    </ul>
                  </div>

                  {/* Organic Treatment */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                      Organic & Biological Control
                    </span>
                    <ul className="space-y-1 text-emerald-800 dark:text-emerald-400 list-disc list-inside">
                      {scanResult.organic_treatment && scanResult.organic_treatment.length > 0 ? (
                        scanResult.organic_treatment.map((t: string, i: number) => <li key={i}>{t}</li>)
                      ) : (
                        <li>Maintain standard bio-fertilizer regimen</li>
                      )}
                    </ul>
                  </div>

                  {/* Chemical Treatment & Prevention */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Chemical Treatment & Prevention
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {scanResult.chemical_treatment && scanResult.chemical_treatment.length > 0 ? (
                        scanResult.chemical_treatment.map((c: string, i: number) => <li key={i}>{c}</li>)
                      ) : (
                        <li>No active chemical fungicide required for healthy specimens</li>
                      )}
                    </ul>
                  </div>
                </div>

                {scanResult.image_validation_notes && (
                  <p className="text-[11px] text-slate-400 text-center italic">
                    Image Quality Metrics: {scanResult.image_validation_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History & Comparison Studio */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Select Any 2 Historical Records to Compare Progression
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Dual-sample differential analysis tracks pathogen growth, treatment effectiveness, and severity changes over time.
                </span>
              </div>
              <button
                type="button"
                disabled={selectedIds.length !== 2 || comparing}
                onClick={handleRunComparison}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 shrink-0"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{comparing ? 'Analyzing Progression...' : `Compare Progression (${selectedIds.length}/2)`}</span>
              </button>
            </div>

            {/* Comparison Results Card */}
            {comparisonResult && (
              <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300 dark:border-emerald-700 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Temporal Progression & Pathogen Differential Report
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-lg">
                    {comparisonResult.comparison.daysApart} Days Elapsed
                  </span>
                </div>

                {/* Dual Column Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sample 1 (Baseline) */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Baseline Scan (Sample 1)</span>
                    {comparisonResult.sample1.imageUrl && (
                      <img
                        src={comparisonResult.sample1.imageUrl}
                        alt="Sample 1"
                        className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      />
                    )}
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {comparisonResult.sample1.aiPredictionClass}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Confidence: {comparisonResult.sample1.aiConfidence}% • Risk: {comparisonResult.sample1.riskLevel}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Recorded: {new Date(comparisonResult.sample1.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Sample 2 (Follow-up) */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      Follow-up Scan (Sample 2)
                    </span>
                    {comparisonResult.sample2.imageUrl && (
                      <img
                        src={comparisonResult.sample2.imageUrl}
                        alt="Sample 2"
                        className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      />
                    )}
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {comparisonResult.sample2.aiPredictionClass}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Confidence: {comparisonResult.sample2.aiConfidence}% • Risk: {comparisonResult.sample2.riskLevel}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Recorded: {new Date(comparisonResult.sample2.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical Summary */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Agronomic Trajectory Analysis:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {comparisonResult.comparison.progressionSummary}
                  </p>
                  <div className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                    Risk Transition: {comparisonResult.comparison.riskProgression} • Confidence Delta: {comparisonResult.comparison.confidenceDifference > 0 ? `+${comparisonResult.comparison.confidenceDifference}%` : `${comparisonResult.comparison.confidenceDifference}%`}
                  </div>
                </div>
              </div>
            )}

            {/* History Table / Cards */}
            {historyLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                Loading diagnosis records from database...
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No past leaf diagnoses found in this farm workspace. Perform a diagnosis scan first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {historyList.map((item: any) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectHistory(item.id)}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-xs space-y-2 relative ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt="Thumbnail"
                          className="h-24 w-full object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                        />
                      )}

                      <div>
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.aiPredictionClass}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Confidence: {item.aiConfidence}%</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.riskLevel === 'Low'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
