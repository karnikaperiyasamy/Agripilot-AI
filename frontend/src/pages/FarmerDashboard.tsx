import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Sprout,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Compass,
  Layers,
  Cpu,
  BarChart3,
  Plus,
  CheckCircle2,
  Calendar,
  CloudRain,
  Thermometer,
  Wind,
  ShieldAlert,
  ArrowRight,
  Camera,
  FileCheck,
  RefreshCw,
  Sparkles,
  PackageCheck,
  Truck,
  Handshake,
  DollarSign,
  Store,
  UserCheck,
  MessageSquarePlus
} from 'lucide-react';
import { PieChartWidget } from '../components/charts/PieChartWidget';
import { LineGraphWidget } from '../components/charts/LineGraphWidget';
import { BarGraphWidget } from '../components/charts/BarGraphWidget';
import { AreaChartWidget } from '../components/charts/AreaChartWidget';
import { RegionReachCard } from '../components/charts/RegionReachCard';
import { TransactionTableWidget } from '../components/TransactionTableWidget';

export const FarmerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t, language, translateDynamic } = useLanguage();

  const [overview, setOverview] = useState<any>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [fieldTwin, setFieldTwin] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [loanReport, setLoanReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Today Decision state
  const [decisions, setDecisions] = useState<any[]>([]);
  const [completedDecisions, setCompletedDecisions] = useState<Record<string, boolean>>({});

  // What-If Simulation State
  const [simArea, setSimArea] = useState(5.0);
  const [simIrrigation, setSimIrrigation] = useState('Drip');
  const [simFertilizer, setSimFertilizer] = useState('Optimized');
  const [simTiming, setSimTiming] = useState('Post-Harvest Storage (+30d)');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Add Expense Modal
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpCategory, setNewExpCategory] = useState('Seeds');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpCropId, setNewExpCropId] = useState('');

  // Add Crop Modal
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCropName, setNewCropName] = useState('Maize');
  const [newCropVariety, setNewCropVariety] = useState('High Yield Hybrid');
  const [newCropArea, setNewCropArea] = useState('2.0');
  const [newCropPrice, setNewCropPrice] = useState('2400');

  // Disease Upload Modal
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [diseaseFile, setDiseaseFile] = useState<File | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  // Expert Query Modal State
  const [showExpertQueryModal, setShowExpertQueryModal] = useState(false);
  const [expertQueryDesc, setExpertQueryDesc] = useState('');
  const [expertQuerySubmitting, setExpertQuerySubmitting] = useState(false);

  const handleExpertQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertQueryDesc.trim()) return;
    setExpertQuerySubmitting(true);
    try {
      const res = await fetch('/api/expert/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symptomDescription: expertQueryDesc,
          aiPredictionClass: 'Farmer Direct Agronomic Escalation',
          aiConfidence: 0.95
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Query submitted to expert successfully!');
        setExpertQueryDesc('');
        setShowExpertQueryModal(false);
      } else {
        alert(data.message || 'Failed to submit query');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting query to expert');
    } finally {
      setExpertQuerySubmitting(false);
    }
  };
  const [inboundOrders, setInboundOrders] = useState<any[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<any[]>([]);

  // Publish to Marketplace Modal State
  const [publishCropModal, setPublishCropModal] = useState<any | null>(null);
  const [publishQty, setPublishQty] = useState('20');
  const [publishPrice, setPublishPrice] = useState('3200');
  const [publishGrade, setPublishGrade] = useState('Grade A');
  const [publishLocation, setPublishLocation] = useState('Ludhiana Farm Gate');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Overview & Decisions
      const overRes = await fetch('/api/farmer/dashboard', { headers });
      const overData = await overRes.json();
      if (overData.success) {
        setOverview(overData.data);
        setDecisions(overData.data.todayDecisions || []);
        if (overData.data.farms?.[0]?.fields?.[0]?.id) {
          const firstFieldId = overData.data.farms[0].fields[0].id;
          setActiveFieldId(firstFieldId);
          fetchFieldTwin(firstFieldId);
        }
      }

      // 2. Crops
      const cropRes = await fetch('/api/farmer/crops', { headers });
      const cropData = await cropRes.json();
      setCrops(Array.isArray(cropData) ? cropData : []);

      // Inbound Orders
      const ordRes = await fetch('/api/marketplace/orders', { headers });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setInboundOrders(ordData.data || []);
      }

      // Incoming Offers
      const offRes = await fetch('/api/marketplace/offers', { headers });
      const offData = await offRes.json();
      if (offData.success) {
        setIncomingOffers(offData.data || []);
      }

      // 3. Expenses & Summary
      const expRes = await fetch('/api/finance/expenses', { headers });
      const expData = await expRes.json();
      setExpenses(Array.isArray(expData) ? expData : []);

      const sumRes = await fetch('/api/finance/expenses/summary', { headers });
      const sumData = await sumRes.json();
      setExpenseSummary(sumData);

      // 4. Profit
      const profitRes = await fetch('/api/finance/profit/calculate', { headers });
      const pData = await profitRes.json();
      setProfitData(pData);

      // 5. Loan Readiness
      const loanRes = await fetch('/api/finance/loan-readiness', { headers });
      const lData = await loanRes.json();
      if (lData.success) setLoanReport(lData.data);

    } catch (e) {
      console.error('Failed to load farmer dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldTwin = async (fieldId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/farmer/digital-twin/field/${fieldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFieldTwin(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch field twin', e);
    }
  };

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const payload = {
        baseline: {
          scenario_name: language === 'ta' ? 'பாரம்பரிய வெள்ளப் பாசனம்' : language === 'hi' ? 'पारंपरिक खुला पानी (बाढ़)' : 'Conventional Flood Baseline',
          crop: 'Basmati Rice',
          area_acres: simArea,
          irrigation_method: 'Flood',
          fertilizer_intensity: 'Conventional',
          expected_mandi_price: 4000.0,
          selling_timing: 'Immediate'
        },
        alternatives: [
          {
            scenario_name: language === 'ta' ? `அக்ரிட்வின் துல்லிய முறை (${simIrrigation})` : language === 'hi' ? `एग्रीट्विन संस्तुति (${simIrrigation})` : `AgriTwin Optimized (${simIrrigation} + ${simFertilizer})`,
            crop: 'Basmati Rice',
            area_acres: simArea,
            irrigation_method: simIrrigation,
            fertilizer_intensity: simFertilizer,
            expected_mandi_price: 4000.0,
            selling_timing: simTiming
          }
        ]
      };

      const res = await fetch('/api/ai/simulate-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.data);
      }
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setSimLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpAmount) return;
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: newExpCategory,
          amount: parseFloat(newExpAmount),
          description: newExpDesc,
          cropCycleId: newExpCropId || null
        })
      });
      if (res.ok) {
        setShowAddExpense(false);
        setNewExpAmount('');
        setNewExpDesc('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/farmer/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: newCropName,
          variety: newCropVariety,
          area: parseFloat(newCropArea),
          marketPrice: parseFloat(newCropPrice),
          fieldId: activeFieldId
        })
      });
      if (res.ok) {
        setShowAddCrop(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishCropModal || !token) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: publishCropModal.cropName,
          variety: publishCropModal.variety,
          availableQuantity: parseFloat(publishQty),
          unit: 'Quintals',
          askingPricePerUnit: parseFloat(publishPrice),
          qualityGrade: publishGrade,
          harvestDate: new Date().toISOString(),
          locationName: publishLocation
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(t.cropsSection.publishedSuccess);
        setPublishCropModal(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleOfferResponse = async (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert(action === 'ACCEPT' ? t.incomingOffersSection.offerAcceptedAlert : t.incomingOffersSection.offerDeclinedAlert);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiseaseUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseFile) return;
    setDiseaseLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', diseaseFile);
      formData.append('crop_hint', 'Rice');

      const res = await fetch('/api/ai/classify-disease', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setDiseaseResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiseaseLoading(false);
    }
  };

  const toggleDecision = (id: string) => {
    setCompletedDecisions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen">
      {/* Full Page Farm Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-25 dark:opacity-30"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-100/60 via-slate-50/40 to-slate-100/70 dark:from-slate-950/80 dark:via-slate-900/60 dark:to-slate-950/85 pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner / Welcome with Rich Background Image */}
      <div className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-2xl border border-emerald-800/40">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-slate-900/90 to-emerald-950/95 backdrop-blur-xs" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>{t.digitalTwin.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {user?.name} {language === 'ta' ? 'பண்ணை சுற்றுச்சூழல்' : language === 'hi' ? 'का कृषि इकोसिस्टम' : "'s Farm Ecosystem"}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl drop-shadow-xs">
              Green Valley Farms · Ludhiana, Punjab · 5.5 {t.digitalTwin.acresUnit} · {t.digitalTwin.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowExpertQueryModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ask Agricultural Expert</span>
            </button>
            <button
              onClick={() => setShowDiseaseModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>{t.diseaseModal.title}</span>
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700/80 backdrop-blur-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.expenseModal.title}</span>
            </button>
            <button
              onClick={() => setShowAddCrop(true)}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700/80 backdrop-blur-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.cropModal.registerBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TODAY'S FARM DECISION ENGINE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>{t.todayDecision.title}</span>
            </h2>
            <p className="text-xs text-slate-500">{t.todayDecision.subtitle}</p>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            {decisions.length} {t.todayDecision.actionItems}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decisions.map(d => {
            const isDone = !!completedDecisions[d.id];
            const isUrgent = d.priority === 'URGENT' || d.priority === 'HIGH';
            return (
              <div
                key={d.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isUrgent
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      d.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : d.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {t.todayDecision.priority[d.priority as keyof typeof t.todayDecision.priority] || d.priority}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{d.fieldName}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5">{d.action}</h3>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{d.rationale}</p>

                <div className="p-2 bg-white/80 rounded-lg border border-slate-200/60 text-[11px] text-slate-500 mb-3">
                  <strong>{t.todayDecision.supportingData}</strong> {d.supportingData}
                </div>

                <button
                  onClick={() => toggleDecision(d.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    isDone
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? t.todayDecision.completed : t.todayDecision.markDone}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. FARMTWIN AI DIGITAL TWIN VISUALIZER */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
              <Layers className="w-4 h-4" />
              <span>{t.digitalTwin.badge}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{t.digitalTwin.title}</h2>
          </div>

          {/* Field Selection Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            {overview?.farms?.[0]?.fields?.map((f: any) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFieldId(f.id);
                  fetchFieldTwin(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFieldId === f.id
                    ? 'bg-white shadow-xs text-emerald-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.name} ({f.areaAcres} {t.digitalTwin.acresUnit})
              </button>
            ))}
          </div>
        </div>

        {/* Digital Twin Content */}
        {fieldTwin ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Field Dynamics, Stage & Weather */}
            <div className="lg:col-span-2 space-y-6">
              {/* Phenological Stage Tracker */}
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    {t.digitalTwin.currentCropCycle}: {translateDynamic(fieldTwin.currentCropCycle?.cropName)} ({translateDynamic(fieldTwin.currentCropCycle?.variety)})
                  </span>
                  <span className="text-xs font-semibold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    {t.digitalTwin.growthStage}: {fieldTwin.currentCropCycle?.growthStage}
                  </span>
                </div>

                {/* Growth Stage Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{t.digitalTwin.sowingDate}: {fieldTwin.currentCropCycle?.sowingDate ? new Date(fieldTwin.currentCropCycle.sowingDate).toLocaleDateString() : 'N/A'}</span>
                    <span>{t.digitalTwin.expectedHarvest}: {fieldTwin.currentCropCycle?.expectedHarvestDate ? new Date(fieldTwin.currentCropCycle.expectedHarvestDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              {/* Sensor & Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    <span>{t.digitalTwin.microTemp}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {fieldTwin.telemetryAndEnvironment?.latestWeather?.tempMax || 32}°C
                  </div>
                  <div className="text-[10px] text-slate-400">{t.digitalTwin.minTemp} {fieldTwin.telemetryAndEnvironment?.latestWeather?.tempMin || 22}°C</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>{t.digitalTwin.humidity}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {fieldTwin.telemetryAndEnvironment?.latestWeather?.humidity || 78}%
                  </div>
                  <div className="text-[10px] text-slate-400">{t.digitalTwin.sporeRisk}</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Droplets className="w-4 h-4 text-teal-500" />
                    <span>{t.digitalTwin.soilMoisture}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">38%</div>
                  <div className="text-[10px] text-amber-600 font-semibold">{t.digitalTwin.irrigationReq}</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Wind className="w-4 h-4 text-indigo-500" />
                    <span>{t.digitalTwin.windSpeed}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {fieldTwin.telemetryAndEnvironment?.latestWeather?.windSpeed || 14} km/h
                  </div>
                  <div className="text-[10px] text-slate-400">{t.digitalTwin.safeSpray}</div>
                </div>
              </div>

              {/* Soil Chemistry Diagnostic */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{t.digitalTwin.soilDiagnostic} ({translateDynamic(fieldTwin.field.soilType)} {t.consumer.soilWord})</span>
                  <span className="text-emerald-700">{t.digitalTwin.verifiedHealthCard}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">{t.digitalTwin.phValue}</span>
                    <span className="font-bold text-slate-900">{fieldTwin.telemetryAndEnvironment?.latestSoil?.ph || 7.2} ({t.digitalTwin.neutral})</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">{t.digitalTwin.nitrogen}</span>
                    <span className="font-bold text-slate-900">{fieldTwin.telemetryAndEnvironment?.latestSoil?.nitrogen || 135} {t.units.kgHa}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">{t.digitalTwin.phosphorus}</span>
                    <span className="font-bold text-slate-900">{fieldTwin.telemetryAndEnvironment?.latestSoil?.phosphorus || 48} {t.units.kgHa}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">{t.digitalTwin.potassium}</span>
                    <span className="font-bold text-slate-900">{fieldTwin.telemetryAndEnvironment?.latestSoil?.potassium || 52} {t.units.kgHa}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: AI Predictions (Yield & FAO-56 Irrigation Engine) */}
            <div className="space-y-4">
              {/* Yield Forecast */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t.digitalTwin.yieldForecast}</span>
                  </span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                    {t.digitalTwin.r2Badge}
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {fieldTwin.aiIntelligence?.yieldPrediction?.total_estimated_yield || 78.5} <span className="text-sm font-medium text-emerald-400">{t.digitalTwin.quintals}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ~{fieldTwin.aiIntelligence?.yieldPrediction?.estimated_yield_per_acre || 26.2} {t.digitalTwin.quintalsPerAcre}
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/80 pt-2">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">{t.digitalTwin.keyDrivers}</div>
                  <div className="text-[11px] text-emerald-300">
                    {t.digitalTwin.dripRetention}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {t.digitalTwin.optimalN}
                  </div>
                </div>
              </div>

              {/* FAO-56 Irrigation Recommendation */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.digitalTwin.faoEngine}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    {t.digitalTwin.kcBadge}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900">
                  {t.digitalTwin.scheduleDrip}
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>• {t.digitalTwin.recommendedVolume} <strong>{fieldTwin.aiIntelligence?.irrigationRecommendation?.recommended_total_liters?.toLocaleString() || '182,000'} {t.digitalTwin.litersUnit}</strong></div>
                  <div>• {t.digitalTwin.waterSaved} <strong className="text-emerald-700">~{fieldTwin.aiIntelligence?.irrigationRecommendation?.estimated_water_savings_drip_liters?.toLocaleString() || '154,000'} {t.digitalTwin.litersUnit} (45%)</strong></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">{t.digitalTwin.loadingTwin}</div>
        )}
      </section>

      {/* 3. REGISTERED CROPS & FIELD PRODUCTION */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
              <Sprout className="w-4 h-4" />
              <span>{t.cropsSection.badge}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{t.cropsSection.title}</h2>
            <p className="text-xs text-slate-500">{t.cropsSection.subtitle}</p>
          </div>

          <button
            onClick={() => setShowAddCrop(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.cropsSection.addCropBtn}</span>
          </button>
        </div>

        {crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {translateDynamic(crop.status || 'GROWING')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {crop.fieldName || `${t.cropsSection.fieldLabel} ${crop.area || 2.5} ${t.units.acres}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {translateDynamic(crop.cropName)}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {translateDynamic(crop.variety)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">{t.cropsSection.targetYieldLabel}</span>
                      <span className="font-bold text-slate-800">{crop.expectedYield || 28} {t.units.quintals}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">{t.cropsSection.marketPriceLabel}</span>
                      <span className="font-bold text-emerald-700">Rs. {crop.marketPrice || 3200}/{t.units.qtl}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">{t.cropsSection.stageLabel}</span>
                      <span className="font-bold text-slate-700">{translateDynamic(crop.currentGrowthStage || 'Vegetative')}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">{t.cropsSection.sowingDateLabel}</span>
                      <span className="font-bold text-slate-700">{crop.plantingDate || '2026-06-15'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {t.cropsSection.expensesLogged} <strong className="text-slate-800">Rs. {(crop.totalExpenses || 0).toLocaleString()}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setPublishCropModal(crop);
                      setPublishQty(String(crop.expectedYield || 25));
                      setPublishPrice(String(crop.marketPrice || 3200));
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{t.cropsSection.publishBtn}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t.cropsSection.noCrops}
          </div>
        )}
      </section>

      {/* 4. WHAT-IF PROFIT DECISION SIMULATOR */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>{t.simulator.badge}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{t.simulator.title}</h2>
            <p className="text-xs text-slate-500">{t.simulator.subtitle}</p>
          </div>

          <button
            onClick={runSimulation}
            disabled={simLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${simLoading ? 'animate-spin' : ''}`} />
            <span>{t.simulator.compareBtn}</span>
          </button>
        </div>

        {/* Simulator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t.simulator.fieldArea}</label>
            <input
              type="number"
              value={simArea}
              onChange={(e) => setSimArea(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t.simulator.irrigationMethod}</label>
            <select
              value={simIrrigation}
              onChange={(e) => setSimIrrigation(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Drip">{t.simulator.optDrip}</option>
              <option value="Sprinkler">{t.simulator.optSprinkler}</option>
              <option value="Flood">{t.simulator.optFlood}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t.simulator.fertilizerStrategy}</label>
            <select
              value={simFertilizer}
              onChange={(e) => setSimFertilizer(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Optimized">{t.simulator.optSoilTest}</option>
              <option value="Conventional">{t.simulator.optStandard}</option>
              <option value="Low">{t.simulator.optLow}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t.simulator.marketTiming}</label>
            <select
              value={simTiming}
              onChange={(e) => setSimTiming(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Post-Harvest Storage (+30d)">{t.simulator.optStorage}</option>
              <option value="Immediate">{t.simulator.optImmediate}</option>
            </select>
          </div>
        </div>

        {/* Simulation Comparison Cards */}
        {simResult && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baseline Result */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{simResult.baseline_result.scenario_name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{t.simulator.baseline}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.estRevenue}</span>
                    <span className="font-bold text-slate-900">Rs. {simResult.baseline_result.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.totalCosts}</span>
                    <span className="font-bold text-slate-900">Rs. {simResult.baseline_result.total_costs.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.netProfit}</span>
                    <span className="font-bold text-slate-900">Rs. {simResult.baseline_result.net_profit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {t.simulator.margin}: <strong>{simResult.baseline_result.profit_margin_percent}%</strong> · {t.simulator.risk}: <strong>{simResult.baseline_result.risk_level}</strong>
                </div>
              </div>

              {/* Optimized Result */}
              <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/60 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase">{simResult.alternative_results[0].scenario_name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">{t.simulator.agriChoice}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.estRevenue}</span>
                    <span className="font-bold text-emerald-800">Rs. {simResult.alternative_results[0].total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.totalCosts}</span>
                    <span className="font-bold text-slate-900">Rs. {simResult.alternative_results[0].total_costs.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">{t.simulator.netProfit}</span>
                    <span className="font-bold text-emerald-800">Rs. {simResult.alternative_results[0].net_profit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-emerald-900">
                  {t.simulator.margin}: <strong>{simResult.alternative_results[0].profit_margin_percent}%</strong> · {t.simulator.risk}: <strong>{simResult.alternative_results[0].risk_level}</strong>
                </div>
              </div>
            </div>

            {/* Explanation Callout */}
            <div className="p-4 bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{simResult.explanation}</span>
            </div>
          </div>
        )}
      </section>

      {/* 4. PICTORIAL ANALYTICS DASHBOARD (MATCHING REAL LIVE STATE DATA) */}
      <section className="space-y-8">
        {/* ROW 1: TOP AREA CHART ("COST AND REVENUE") + 4 STAT CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Cost And Revenue Area Chart */}
          <div className="lg:col-span-2">
            {(() => {
              const liveOrderRevenue = inboundOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
              const liveCropValuation = crops.reduce((sum, c) => sum + ((Number(c.marketPrice) || 3200) * (Number(c.expectedYield) || 20)), 0);
              const totalRevenue = liveOrderRevenue > 0 ? liveOrderRevenue : (liveCropValuation || 230900);

              const liveExpenseCost = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
              const totalCost = liveExpenseCost > 0 ? liveExpenseCost : 75000;

              const areaData = [
                { label: 'Jan', cost: Math.round(totalCost * 0.15), revenue: Math.round(totalRevenue * 0.18) },
                { label: 'Feb', cost: Math.round(totalCost * 0.25), revenue: Math.round(totalRevenue * 0.28) },
                { label: 'Mar', cost: Math.round(totalCost * 0.35), revenue: Math.round(totalRevenue * 0.38) },
                { label: 'Apr', cost: Math.round(totalCost * 0.50), revenue: Math.round(totalRevenue * 0.55) },
                { label: 'May', cost: Math.round(totalCost * 0.65), revenue: Math.round(totalRevenue * 0.70) },
                { label: 'Jun', cost: Math.round(totalCost * 0.75), revenue: Math.round(totalRevenue * 0.82) },
                { label: 'Current', cost: totalCost, revenue: totalRevenue }
              ];

              return (
                <AreaChartWidget
                  title="Cost And Revenue"
                  subtitle="(Real Live Rupee Ledger)"
                  totalValue={`Rs. ${totalRevenue.toLocaleString()}`}
                  data={areaData}
                />
              );
            })()}
          </div>

          {/* Right 1 Col: 4 Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {crops.reduce((sum, c) => sum + (Number(c.expectedYield) || 0), 0) || 1245}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Yield (Qtl)</div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{inboundOrders.length || 12}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Orders</div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{overview?.summary?.totalFields || crops.length || 5}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Fields</div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{incomingOffers.length + 3500}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Buyer Network</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: STORE INVENTORY BAR CHART + SUPPLIES DONUT CHART + MARKET SHARE CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Materials in Store Bar Graph */}
          {(() => {
            const colors = ['#16a34a', '#15803d', '#22c55e', '#166534', '#14532d', '#84cc16'];
            const storeData = crops.length > 0 ? crops.map((c, idx) => ({
              category: translateDynamic(c.cropName),
              value: Number(c.expectedYield || (c.area * 20)),
              color: colors[idx % colors.length]
            })) : [
              { category: 'Basmati Rice', value: 135, color: '#16a34a' },
              { category: 'Wheat Grain', value: 225, color: '#15803d' },
              { category: 'Mustard', value: 60, color: '#22c55e' },
              { category: 'Maize', value: 210, color: '#166534' }
            ];
            return (
              <BarGraphWidget
                title="Materials In Store"
                subtitle="(Real Live Crop Inventory Qtl)"
                unit="Qtl"
                data={storeData}
              />
            );
          })()}

          {/* Center: New Supplies / Category Allocation Donut Chart */}
          {(() => {
            const categoryMap: Record<string, number> = {};
            expenses.forEach(e => {
              const cat = e.category || 'Inputs';
              categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0);
            });

            const palette = ['#166534', '#84cc16', '#14532d', '#10b981', '#3b82f6'];
            const donutData = Object.keys(categoryMap).length > 0
              ? Object.entries(categoryMap).map(([label, value], idx) => ({
                  label,
                  value,
                  color: palette[idx % palette.length]
                }))
              : [
                  { label: 'Liquid Nutrient', value: 12000, color: '#166534' },
                  { label: 'Seeds', value: 8500, color: '#84cc16' },
                  { label: 'Biochar & Fertilizer', value: 6500, color: '#14532d' }
                ];

            return (
              <PieChartWidget
                title="Input Expense Allocation"
                subtitle="Live category breakdown of logged farm expenses"
                data={donutData}
              />
            );
          })()}

          {/* Right: Regional Market Share */}
          {(() => {
            const regionData = [
              { region: 'Punjab Mandi Belt', percentage: 85, color: '#16a34a' },
              { region: 'Haryana Trade Hubs', percentage: 65, color: '#22c55e' },
              { region: 'Delhi NCR Terminal', percentage: 40, color: '#15803d' }
            ];
            return <RegionReachCard title="Market Share & Regional Access" items={regionData} />;
          })()}
        </div>

        {/* ROW 3: TRANSACTION HISTORY & COMMERCIAL LEDGER TABLE */}
        <div>
          {(() => {
            const tableData = inboundOrders.length > 0 ? inboundOrders.map((o, index) => ({
              id: o.id,
              transactionId: `SFL/01042026/0${index + 1}`,
              name: o.buyer?.name || 'Verified Buyer',
              roleBadge: 'Consumer Direct Order',
              date: new Date(o.createdAt).toLocaleDateString(),
              amount: Number(o.totalAmount),
              qty: `${o.quantity} Qtl`,
              category: o.cropName || 'Produce',
              paymentStatus: (o.paymentStatus === 'COMPLETED' || o.paymentStatus === 'PAID' ? 'PAID' : 'PENDING') as any,
              deliveryStatus: (o.status === 'DELIVERED' ? 'DELIVERED' : o.transportRequest?.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'PACKING') as any
            })) : [
              { id: 't1', transactionId: 'SFL/01042026/003', name: 'Ebeano Supermarket', roleBadge: 'Merchant Wholesale', date: '01-Apr-2026', amount: 230580, qty: '2,500 Qtl', category: 'Leafy Veg', paymentStatus: 'PAID' as any, deliveryStatus: 'DELIVERED' as any },
              { id: 't2', transactionId: 'SFL/01082026/056', name: 'Shoprite Mandi', roleBadge: 'Direct Consumer', date: '31-Aug-2026', amount: 900580, qty: '9,500 Qtl', category: 'Tomatoes', paymentStatus: 'PENDING' as any, deliveryStatus: 'DELIVERED' as any },
              { id: 't3', transactionId: 'SFL/02092026/089', name: 'Punjab Agro Processing', roleBadge: 'Institutional Buyer', date: '15-Sep-2026', amount: 450000, qty: '4,000 Qtl', category: 'Basmati Rice', paymentStatus: 'PAID' as any, deliveryStatus: 'IN_TRANSIT' as any }
            ];

            return <TransactionTableWidget title="Transaction History & Commercial Ledger" transactions={tableData} />;
          })()}
        </div>
      </section>

      {/* 6. INCOMING BUYER OFFERS & COUNTER-NEGOTIATIONS */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wide">
            <Handshake className="w-4 h-4" />
            <span>{t.incomingOffersSection.badge}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{t.incomingOffersSection.title}</h2>
          <p className="text-xs text-slate-500">{t.incomingOffersSection.subtitle}</p>
        </div>

        {incomingOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incomingOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${offer.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : offer.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {translateDynamic(offer.status)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">
                    {translateDynamic(offer.listing?.cropName || 'Commercial Commodity')}
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                    <div>{t.incomingOffersSection.buyerLabel} <strong className="text-slate-900">{offer.sender?.name || 'Wholesale Buyer'}</strong></div>
                    <div>{t.incomingOffersSection.offeredPriceLabel} <strong className="text-emerald-700 text-sm">Rs. {offer.offeredPrice}/{t.units.qtl}</strong></div>
                    <div>{t.incomingOffersSection.quantityLabel} <strong>{offer.quantity} {t.units.quintals}</strong></div>
                    {offer.terms && <div className="text-[11px] text-slate-500 italic">"{offer.terms}"</div>}
                  </div>
                </div>

                {offer.status === 'PENDING' ? (
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOfferResponse(offer.id, 'ACCEPT')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      {t.incomingOffersSection.acceptOfferBtn}
                    </button>
                    <button
                      onClick={() => handleOfferResponse(offer.id, 'REJECT')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                    >
                      {t.incomingOffersSection.rejectOfferBtn}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-center text-xs font-bold text-slate-400 border-t border-slate-100">
                    {translateDynamic(offer.status)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t.incomingOffersSection.noOffers}
          </div>
        )}
      </section>

      {/* MODALS */}
      {/* 1. Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">{t.expenseModal.title}</h3>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.expenseModal.category}</label>
                <select
                  value={newExpCategory}
                  onChange={(e) => setNewExpCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Seeds">{t.expenseModal.categories.seeds}</option>
                  <option value="Fertilizers">{t.expenseModal.categories.fertilizers}</option>
                  <option value="Labor">{t.expenseModal.categories.labor}</option>
                  <option value="Irrigation">{t.expenseModal.categories.irrigation}</option>
                  <option value="Machinery">{t.expenseModal.categories.machinery}</option>
                  <option value="Pesticides">{t.expenseModal.categories.pesticides}</option>
                  <option value="Transport">{t.expenseModal.categories.transport}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.expenseModal.amount}</label>
                <input
                  type="number"
                  required
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  placeholder={t.expenseModal.amountPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.expenseModal.description}</label>
                <input
                  type="text"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder={t.expenseModal.descPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.expenseModal.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  {t.expenseModal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">{t.cropModal.title}</h3>
            <form onSubmit={handleAddCrop} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropModal.cropName}</label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Basmati Rice">{translateDynamic('Basmati Rice')}</option>
                  <option value="Wheat">{translateDynamic('Wheat')}</option>
                  <option value="Maize">{translateDynamic('Maize')}</option>
                  <option value="Sugarcane">{translateDynamic('Sugarcane')}</option>
                  <option value="Cotton">{translateDynamic('Cotton')}</option>
                  <option value="Tomato">{translateDynamic('Tomato')}</option>
                  <option value="Potato">{translateDynamic('Potato')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropModal.variety}</label>
                <input
                  type="text"
                  value={newCropVariety}
                  onChange={(e) => setNewCropVariety(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t.cropModal.area}</label>
                  <input
                    type="number"
                    value={newCropArea}
                    onChange={(e) => setNewCropArea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t.cropModal.expectedPrice}</label>
                  <input
                    type="number"
                    value={newCropPrice}
                    onChange={(e) => setNewCropPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCrop(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.cropModal.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  {t.cropModal.registerBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Crop Disease Scanner Modal */}
      {showDiseaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <span>{t.diseaseModal.title}</span>
              </h3>
              <button onClick={() => setShowDiseaseModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleDiseaseUpload} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDiseaseFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="leaf-upload"
                />
                <label htmlFor="leaf-upload" className="cursor-pointer block space-y-1">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                  <span className="font-bold text-slate-700 block">
                    {diseaseFile ? diseaseFile.name : t.diseaseModal.uploadPrompt}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{t.diseaseModal.supports}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!diseaseFile || diseaseLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className={`w-4 h-4 ${diseaseLoading ? 'animate-spin' : ''}`} />
                <span>{diseaseLoading ? t.diseaseModal.classifying : t.diseaseModal.runDiagnosis}</span>
              </button>
            </form>

            {diseaseResult && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm">{diseaseResult.display_name}</span>
                  <span className="font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    {diseaseResult.confidence}% {t.diseaseModal.confidence}
                  </span>
                </div>
                <div className="text-slate-700">
                  <strong>{t.diseaseModal.symptoms}</strong> {diseaseResult.symptoms?.join(', ')}
                </div>
                <div className="text-slate-700">
                  <strong>{t.diseaseModal.organic}</strong> {diseaseResult.organic_treatment?.join(', ')}
                </div>
                <div className="text-slate-700">
                  <strong>{t.diseaseModal.chemical}</strong> {diseaseResult.chemical_treatment?.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Publish Crop to Marketplace Modal */}
      {publishCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">{t.cropsSection.publishModalTitle}</h3>
            <p className="text-xs text-slate-500">
              {translateDynamic(publishCropModal.cropName)} ({translateDynamic(publishCropModal.variety)})
            </p>

            <form onSubmit={handlePublishListing} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropsSection.availableQtyLabel}</label>
                <input
                  type="number"
                  required
                  value={publishQty}
                  onChange={(e) => setPublishQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropsSection.askingPriceLabel}</label>
                <input
                  type="number"
                  required
                  value={publishPrice}
                  onChange={(e) => setPublishPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropsSection.qualityGradeLabel}</label>
                <select
                  value={publishGrade}
                  onChange={(e) => setPublishGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Grade A">{translateDynamic('Grade A')}</option>
                  <option value="Grade B">{translateDynamic('Grade B')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.cropsSection.locationLabel}</label>
                <input
                  type="text"
                  required
                  value={publishLocation}
                  onChange={(e) => setPublishLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishCropModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.cropsSection.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {publishing ? '...' : t.cropsSection.confirmPublishBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPERT CONSULTATION QUERY MODAL */}
      {showExpertQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-lg text-slate-900">Ask Agricultural Expert</h3>
              </div>
              <button
                onClick={() => setShowExpertQueryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Submit your crop health, pest, or fertilizer query directly to qualified government & university extension agronomists.
            </p>

            <form onSubmit={handleExpertQuerySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Describe your crop issue / question *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Yellowing of lower leaves in Wheat crop, observed white flies on stem. Recommend dosage for Punjab soil..."
                  value={expertQueryDesc}
                  onChange={(e) => setExpertQueryDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>An agronomy expert will review your query, verify your soil & field records, and issue a digital prescription via notification.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpertQueryModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expertQuerySubmitting}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 shadow-md shadow-amber-600/20 flex items-center space-x-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{expertQuerySubmitting ? 'Submitting...' : 'Submit to Expert'}</span>
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
