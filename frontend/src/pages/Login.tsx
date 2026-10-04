import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/farmer');
    } else {
      setError(t.auth.invalidCredentials);
    }
  };

  const handleDemoClick = async (role: any, path: string) => {
    await switchDemoRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t.auth.loginTitle}</h2>
          <p className="text-xs text-slate-500">{t.auth.loginSub}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{t.auth.emailLabel}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@farmprofit.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">{t.auth.passwordLabel}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? t.auth.authenticating : t.auth.signInBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Login Panel */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            {t.auth.instantDemoTitle}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoClick('FARMER', '/farmer')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-left truncate"
            >
              🌱 {t.nav.demoFarmer}
            </button>
            <button
              onClick={() => handleDemoClick('MERCHANT', '/merchant')}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 text-left truncate"
            >
              💼 {t.nav.demoMerchant}
            </button>
            <button
              onClick={() => handleDemoClick('TRANSPORTER', '/transporter')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 text-left truncate"
            >
              🚚 {t.nav.demoTransporter}
            </button>
            <button
              onClick={() => handleDemoClick('EXPERT', '/expert')}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200 text-left truncate"
            >
              🔬 {t.nav.demoExpert}
            </button>
            <button
              onClick={() => handleDemoClick('CONSUMER', '/consumer')}
              className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 text-left truncate"
            >
              🛒 {t.nav.demoConsumer}
            </button>
            <button
              onClick={() => handleDemoClick('ADMIN', '/admin')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 text-left truncate"
            >
              🛡️ {t.nav.demoAdmin}
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            {t.auth.registerPrompt}
          </Link>
        </div>
      </div>
    </div>
  );
};
