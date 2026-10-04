import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Shield,
  Cpu,
  Users,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t, translateDynamic } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Stats
      const statRes = await fetch('/api/admin/stats', { headers });
      const statData = await statRes.json();
      if (statData.success) setStats(statData.data);

      // 2. Users
      const userRes = await fetch('/api/admin/users', { headers });
      const uData = await userRes.json();
      if (uData.success) setUserList(uData.data || []);

      // 3. Audit Logs
      const logRes = await fetch('/api/admin/audit-logs', { headers });
      const lData = await logRes.json();
      if (lData.success) setAuditLogs(lData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        alert(t.admin.roleUpdatedAlert);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReport = () => {
    if (!userList.length) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'User ID,Full Name,Email Address,Role,Status,Registered Date\n';

    userList.forEach(u => {
      csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","Active","${new Date(u.createdAt || Date.now()).toLocaleDateString()}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriPilot_Platform_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>{t.admin.bannerTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t.admin.title}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            {t.admin.bannerSub}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{t.admin.mlActive}</span>
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.admin.registeredAccounts}</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.users.total}</div>
            <div className="text-[11px] text-slate-500">{t.admin.registeredSub}</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.admin.digitalTwinFields}</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">{stats.agronomicReach.fieldsUnderDigitalTwin}</div>
            <div className="text-[11px] text-slate-500">{stats.agronomicReach.farmsRegistered} {t.admin.estatesSub}</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.admin.tradedVolume}</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.commerce.tradedVolumeQuintals} {t.units.qtl}</div>
            <div className="text-[11px] text-slate-500">{stats.commerce.totalOrders} {t.admin.tradedSub}</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.admin.grossValue}</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">Rs. {stats.commerce.grossMerchandiseValue.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{t.admin.directPayout}</div>
          </div>
        </section>
      )}

      {/* AI MODEL REGISTRY & OBSERVABILITY */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            <Cpu className="w-4 h-4" />
            <span>{t.admin.registryTag}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{t.admin.registryTitle}</h2>
          <p className="text-xs text-slate-500">{t.admin.registrySub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{t.admin.yieldPredictor}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{t.admin.activeBadge}</span>
            </div>
            <div className="text-slate-500 text-[11px]">{t.admin.modelLabel} <strong>Random Forest Regressor</strong></div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5">
              <div>{t.admin.r2Score} <strong className="text-emerald-700">0.9893</strong></div>
              <div>{t.admin.rmseLabel} <strong>11.62 {t.units.qtl}/{t.units.acres}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{t.admin.pestRisk}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{t.admin.activeBadge}</span>
            </div>
            <div className="text-slate-500 text-[11px]">{t.admin.modelLabel} <strong>Gradient Boosting Classifier</strong></div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5">
              <div>{t.admin.accuracyLabel} <strong className="text-emerald-700">78.83%</strong></div>
              <div>{t.admin.weightedF1} <strong>0.7883</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{t.admin.priceForecast}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{t.admin.activeBadge}</span>
            </div>
            <div className="text-slate-500 text-[11px]">{t.admin.modelLabel} <strong>Time-Series Regressor</strong></div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5">
              <div>{t.admin.r2Score} <strong className="text-emerald-700">0.9986</strong></div>
              <div>{t.admin.rmseLabel} <strong>Rs. 74.62 / {t.units.qtl}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{t.admin.diseaseVision}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{t.admin.activeBadge}</span>
            </div>
            <div className="text-slate-500 text-[11px]">{t.admin.modelLabel} <strong>PyTorch Deep CNN</strong></div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5">
              <div>{t.admin.classesLabel} <strong>14 Diseases</strong></div>
              <div>{t.admin.convergenceLabel} <strong className="text-emerald-700">100.0%</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* USER MANAGEMENT */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900">{t.admin.userAccessTitle}</h2>
          <p className="text-xs text-slate-500">{t.admin.userAccessSub}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5">{t.admin.tableName}</th>
                <th className="py-2.5">{t.admin.tableEmail}</th>
                <th className="py-2.5">{t.admin.tableRole}</th>
                <th className="py-2.5">{t.admin.tableStatus}</th>
                <th className="py-2.5">{t.admin.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 text-slate-600">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold rounded text-[11px] text-slate-700">
                      {translateDynamic(u.role)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-700 font-semibold">{t.admin.activeStatus}</span>
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs"
                    >
                      <option value="FARMER">FARMER</option>
                      <option value="MERCHANT">MERCHANT</option>
                      <option value="TRANSPORTER">TRANSPORTER</option>
                      <option value="EXPERT">EXPERT</option>
                      <option value="CONSUMER">CONSUMER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
