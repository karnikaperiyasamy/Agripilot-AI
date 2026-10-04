import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Interactive eligibility checker
  const [landSize, setLandSize] = useState('5.0');
  const [eligibilityResults, setEligibilityResults] = useState<any[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        setSchemes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await fetch('/api/schemes/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landSizeAcres: parseFloat(landSize) })
      });
      const data = await res.json();
      if (data.success) {
        setEligibilityResults(data.eligibleSchemes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const categories = [
    { key: 'All', label: t.schemes.categories.all },
    { key: 'Financial Support', label: t.schemes.categories.financial },
    { key: 'Soil Management', label: t.schemes.categories.soil },
    { key: 'Insurance', label: t.schemes.categories.insurance },
    { key: 'Irrigation', label: t.schemes.categories.irrigation },
    { key: 'Equipment', label: t.schemes.categories.equipment },
    { key: 'Development', label: t.schemes.categories.development }
  ];

  const filteredSchemes = schemes.filter(s => {
    const matchesCat = filterCategory === 'All' || s.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch = s.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>{t.schemes.bannerTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t.schemes.title}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            {t.schemes.bannerSub}
          </p>
        </div>
      </div>

      {/* Interactive Eligibility Checker */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>{t.schemes.calcTitle}</span>
          </h2>
          <p className="text-xs text-slate-500">{t.schemes.calcSub}</p>
        </div>

        <form onSubmit={handleCheckEligibility} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-700">{t.schemes.landholdingLabel}</label>
            <input
              type="number"
              step="0.5"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-28"
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            {checking ? t.schemes.checkingBtn : t.schemes.checkBtn}
          </button>
        </form>

        {eligibilityResults && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in">
            <span className="font-extrabold text-emerald-950 text-xs uppercase block">
              {t.schemes.eligibleFor} {eligibilityResults.length} {t.schemes.programsCount}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {eligibilityResults.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200/80">
                  <div className="font-bold text-slate-900">{item.scheme.schemeName}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{item.matchReason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Schemes Directory */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFilterCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterCategory === cat.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.schemes.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Scheme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map(s => (
            <div key={s.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md">
                    {s.category}
                  </span>
                  <a
                    href={s.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1"
                  >
                    <span>{t.schemes.officialPortal}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{s.schemeName}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-200/80">
                  <div>
                    <strong className="text-slate-700">{t.schemes.eligibilityLabel}</strong> <span className="text-slate-600">{s.eligibility}</span>
                  </div>
                  <div>
                    <strong className="text-slate-700">{t.schemes.benefitsLabel}</strong> <span className="text-emerald-700 font-semibold">{s.benefits}</span>
                  </div>
                </div>
              </div>

              <a
                href={s.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center block transition-colors shadow-xs"
              >
                {t.schemes.applyOfficial}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
