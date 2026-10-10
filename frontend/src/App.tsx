import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { TransporterDashboard } from './pages/TransporterDashboard';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SchemesPage } from './pages/SchemesPage';
import { TraceabilityPublicPage } from './pages/TraceabilityPublicPage';
import { FPOPortalPage } from './pages/FPOPortalPage';
import { EnterprisePortalPage } from './pages/EnterprisePortalPage';
import { DeveloperPortalPage } from './pages/DeveloperPortalPage';

import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      <OfflineIndicator />
      <Navbar onOpenVoice={() => setVoiceOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/trace/:batchCode" element={<TraceabilityPublicPage />} />
          <Route path="/fpo" element={<FPOPortalPage />} />
          <Route path="/enterprise" element={<EnterprisePortalPage />} />
          <Route path="/developer" element={<DeveloperPortalPage />} />

          {/* Role Dashboards */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['MERCHANT']}>
                <MerchantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter"
            element={
              <ProtectedRoute allowedRoles={['TRANSPORTER']}>
                <TransporterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert"
            element={
              <ProtectedRoute allowedRoles={['EXPERT']}>
                <ExpertDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer"
            element={
              <ProtectedRoute allowedRoles={['CONSUMER']}>
                <ConsumerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {t.footer.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t.footer.desc}
          </p>
          <div className="flex justify-center space-x-4 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
            <span>{t.footer.serviceAi}</span>
            <span>•</span>
            <span>{t.footer.serviceBackend}</span>
            <span>•</span>
            <span>{t.footer.serviceFrontend}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
