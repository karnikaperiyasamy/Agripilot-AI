import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Sprout,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Droplets,
  Layers,
  CheckCircle2,
  Compass,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const { t, translateDynamic } = useLanguage();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'FARMER' | 'MERCHANT' | 'TRANSPORTER' | 'EXPERT' | 'CONSUMER' | 'ADMIN', path: string) => {
    await switchDemoRole(role);
    navigate(path);
  };

  return (
    <div className="relative min-h-screen space-y-20 pb-20">
      {/* Main Home Page Background Image Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 dark:opacity-35 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/hero-farmer.jpg')`
        }}
      />

      {/* Hero Section with Exact User-Uploaded Smart Agriculture Background Image */}
      <section className="relative z-10 overflow-hidden text-white py-24 sm:py-36 px-4 sm:px-6 lg:px-8 min-h-[680px] flex items-center justify-center">
        {/* User Uploaded Smart Farmer Image Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-100 transition-transform duration-1000"
          style={{
            backgroundImage: `url('/hero-farmer.jpg')`
          }}
        />
        {/* High-Legibility Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-emerald-950/30 to-slate-950/80" />

        {/* Floating IoT Smart Telemetry Icons overlay matching reference photo */}
        <div className="absolute top-12 right-12 hidden lg:flex flex-col items-center space-y-3 z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl animate-bounce">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50 flex items-center justify-center text-emerald-200 shadow-lg">
            <Droplets className="w-5 h-5 text-teal-300" />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/30 backdrop-blur-md border border-blue-400/50 flex items-center justify-center text-blue-200 shadow-lg">
            <Cpu className="w-5 h-5 text-blue-300" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-xs sm:text-sm font-extrabold tracking-wide backdrop-blur-md shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{t.landing.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            {t.landing.heroTitle1} <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{t.landing.heroTitle2}</span> {t.landing.heroTitle3}
          </h1>

          <p className="text-lg sm:text-2xl text-emerald-50 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
            {t.subheading}. {t.landing.heroSub}
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => handleQuickDemo('FARMER', '/farmer')}
              className="px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base sm:text-lg shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105 flex items-center space-x-2 border border-emerald-300"
            >
              <span>{t.landing.exploreFarmer}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleQuickDemo('MERCHANT', '/merchant')}
              className="px-7 py-4 rounded-2xl bg-slate-950/85 hover:bg-slate-900 text-white font-bold text-base sm:text-lg border-2 border-emerald-400/60 backdrop-blur-md transition-all hover:scale-105 flex items-center space-x-2 shadow-xl"
            >
              <span>{t.landing.buyerPortal}</span>
              <Compass className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* 1-Click Role Access Ribbon */}
          <div className="pt-10 border-t border-white/20 max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-emerald-200 font-extrabold mb-3 drop-shadow-md">
              {t.landing.directSwitchLabel}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { role: 'FARMER', label: t.nav.demoFarmer, path: '/farmer', color: 'hover:border-emerald-400 hover:bg-emerald-900/80' },
                { role: 'MERCHANT', label: t.nav.demoMerchant, path: '/merchant', color: 'hover:border-blue-400 hover:bg-blue-900/80' },
                { role: 'TRANSPORTER', label: t.nav.demoTransporter, path: '/transporter', color: 'hover:border-amber-400 hover:bg-amber-900/80' },
                { role: 'EXPERT', label: t.nav.demoExpert, path: '/expert', color: 'hover:border-purple-400 hover:bg-purple-900/80' },
                { role: 'CONSUMER', label: t.nav.demoConsumer, path: '/consumer', color: 'hover:border-teal-400 hover:bg-teal-900/80' },
                { role: 'ADMIN', label: t.nav.demoAdmin, path: '/admin', color: 'hover:border-red-400 hover:bg-red-900/80' }
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => handleQuickDemo(item.role as any, item.path)}
                  className={`px-3 py-2 rounded-xl bg-slate-950/80 border border-white/20 backdrop-blur-md text-xs font-bold text-white hover:text-emerald-300 transition-all truncate shadow-md ${item.color}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Question & Digital Twin Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 space-y-8 transition-colors duration-300">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {t.landing.coreBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.landing.coreQuestion}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              {t.landing.coreSub}
            </p>
          </div>

          {/* Workflow Sequence */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-6 text-center text-xs">
            {[
              { step: '1', title: t.landing.steps.s1Title, desc: t.landing.steps.s1Desc, icon: Layers },
              { step: '2', title: t.landing.steps.s2Title, desc: t.landing.steps.s2Desc, icon: Cpu },
              { step: '3', title: t.landing.steps.s3Title, desc: t.landing.steps.s3Desc, icon: Compass },
              { step: '4', title: t.landing.steps.s4Title, desc: t.landing.steps.s4Desc, icon: Droplets },
              { step: '5', title: t.landing.steps.s5Title, desc: t.landing.steps.s5Desc, icon: TrendingUp },
              { step: '6', title: t.landing.steps.s6Title, desc: t.landing.steps.s6Desc, icon: Truck },
              { step: '7', title: t.landing.steps.s7Title, desc: t.landing.steps.s7Desc, icon: ShieldCheck },
              { step: '8', title: t.landing.steps.s8Title, desc: t.landing.steps.s8Desc, icon: BarChart3 }
            ].map(item => (
              <div key={item.step} className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl space-y-1.5 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Major Problem Domains Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.landing.problemTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            {t.landing.problemSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Domain A */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.landing.domainA.title}</h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainA.item1Bold}</strong> {t.landing.domainA.item1Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainA.item2Bold}</strong> {t.landing.domainA.item2Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainA.item3Bold}</strong> {t.landing.domainA.item3Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainA.item4Bold}</strong> {t.landing.domainA.item4Text}</span>
              </li>
            </ul>
          </div>

          {/* Domain B */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.landing.domainB.title}</h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainB.item1Bold}</strong> {t.landing.domainB.item1Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainB.item2Bold}</strong> {t.landing.domainB.item2Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainB.item3Bold}</strong> {t.landing.domainB.item3Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainB.item4Bold}</strong> {t.landing.domainB.item4Text}</span>
              </li>
            </ul>
          </div>

          {/* Domain C */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.landing.domainC.title}</h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainC.item1Bold}</strong> {t.landing.domainC.item1Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainC.item2Bold}</strong> {t.landing.domainC.item2Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainC.item3Bold}</strong> {t.landing.domainC.item3Text}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t.landing.domainC.item4Bold}</strong> {t.landing.domainC.item4Text}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Verified Government Schemes CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <FileText className="w-4 h-4" />
              <span>{t.landing.schemesCtaBadge}</span>
            </div>
            <h3 className="text-2xl font-bold">{t.landing.schemesCtaTitle}</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              {t.landing.schemesCtaSub}
            </p>
          </div>
          <Link
            to="/schemes"
            className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-emerald-50 transition-colors shrink-0 shadow-md"
          >
            {t.landing.checkSchemesBtn}
          </Link>
        </div>
      </section>
    </div>
  );
};
