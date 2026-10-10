import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { Sprout, Mic, Globe, LogOut, UserCircle, Activity, ChevronDown, Bell, CheckCheck, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('agritwin_token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 10000);
    return () => clearInterval(timer);
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem('agritwin_token');
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Notifications</span>
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                    !n.isRead ? 'bg-emerald-50/40 font-medium' : ''
                  }`}
                >
                  <div className="font-bold text-slate-800 flex items-center justify-between mb-0.5">
                    <span>{n.title}</span>
                    <span className="text-[9px] text-slate-400 font-normal flex items-center space-x-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface NavbarProps {
  onOpenVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice }) => {
  const { user, logout, switchDemoRole, isAuthenticated } = useAuth();
  const { language, setLanguage, t, translateDynamic } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (user) {
      fetch('/api/auth/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agritwin_token')}`
        },
        body: JSON.stringify({ languagePref: lang })
      }).catch(console.error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'FARMER': return '/farmer';
      case 'MERCHANT': return '/merchant';
      case 'TRANSPORTER': return '/transporter';
      case 'EXPERT': return '/expert';
      case 'CONSUMER': return '/consumer';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  AgriPilot <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase hidden sm:block">
                  {t.brand}
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-6">
              <Link to="/schemes" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                {t.nav.schemes}
              </Link>
              <Link to="/fpo" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                FPO Portal
              </Link>
              <Link to="/enterprise" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                Enterprise B2B
              </Link>
              <Link to="/developer" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                Partner API
              </Link>
              {isAuthenticated && (
                <Link to={getDashboardLink()} className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-colors flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-800">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.nav.dashboard}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Action Tools: Voice AI, Role Switcher, Language, Auth */}
          <div className="flex items-center space-x-3">
            {/* Multilingual Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              title={t.voice.title}
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">{t.nav.voiceAi}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1 mr-1" />
              {(['en', 'ta', 'hi'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    language === lang ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-700 dark:text-emerald-400 font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                </button>
              ))}
            </div>

            {/* Dark Mode / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-xs flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-700" />
              )}
            </button>

            {/* Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                title={t.nav.roleSwitchPrompt}
              >
                <UserCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden lg:inline">{user ? translateDynamic(user.role) : t.nav.roles}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                    {t.nav.roleSwitchPrompt}
                  </div>
                  {[
                    { role: 'FARMER', label: t.nav.demoFarmer, path: '/farmer' },
                    { role: 'MERCHANT', label: t.nav.demoMerchant, path: '/merchant' },
                    { role: 'TRANSPORTER', label: t.nav.demoTransporter, path: '/transporter' },
                    { role: 'EXPERT', label: t.nav.demoExpert, path: '/expert' },
                    { role: 'CONSUMER', label: t.nav.demoConsumer, path: '/consumer' },
                    { role: 'ADMIN', label: t.nav.demoAdmin, path: '/admin' }
                  ].map(item => (
                    <button
                      key={item.role}
                      onClick={async () => {
                        setRoleMenuOpen(false);
                        await switchDemoRole(item.role as any);
                        navigate(item.path);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between ${
                        user?.role === item.role ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {user?.role === item.role && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            {isAuthenticated && (
              <NotificationDropdown />
            )}

            {/* Authentication Buttons */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
