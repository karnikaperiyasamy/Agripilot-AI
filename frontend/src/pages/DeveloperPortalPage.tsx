import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, Key, Webhook, ShieldCheck, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

export const DeveloperPortalPage: React.FC = () => {
  const { token } = useAuth();

  // API Key Form State
  const [orgNameKey, setOrgNameKey] = useState('Apex Agri Processing Ltd');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  // Webhook Form State
  const [orgNameWh, setOrgNameWh] = useState('Apex Agri Processing Ltd');
  const [targetUrl, setTargetUrl] = useState('https://api.apexfoods.com/webhooks/agripilot');
  const [whSecret, setWhSecret] = useState<string | null>(null);
  const [whLoading, setWhLoading] = useState(false);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyLoading(true);
    try {
      const res = await fetch('/api/v1/partner/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName: orgNameKey })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.apiKey);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSubscribeWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhLoading(true);
    try {
      const res = await fetch('/api/v1/webhooks/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgNameWh,
          targetUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setWhSecret(data.subscription.secretKey);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWhLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl text-white p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Partner API & Developer Integration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">AgriPilot Partner API v1</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Integrate live crop listing streams, mandi price forecasts, order webhooks, and QR batch traceability into your ERP system.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Generate Partner API Key */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">Generate Partner API Key</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue scoped API credentials for server-to-server REST integration (`x-partner-key`). Rate limit: 120 req/min.
          </p>

          <form onSubmit={handleGenerateKey} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={orgNameKey}
                onChange={e => setOrgNameKey(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={keyLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {keyLoading ? 'Generating API Key...' : 'Generate Scoped Partner API Key'}
            </button>
          </form>

          {generatedKey && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Your Scoped Partner API Key:</span>
              <code className="block p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] break-all select-all">
                {generatedKey}
              </code>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                🔒 Copy this key immediately. It is salted with SHA-256 and will not be displayed again.
              </span>
            </div>
          )}
        </section>

        {/* 2. Webhook Event Subscriptions */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">Subscribe Webhook Endpoints</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receive real-time signed HTTP POST webhooks for `ORDER_CREATED`, `SHIPMENT_DELIVERED`, and `DISEASE_ESCALATED`.
          </p>

          <form onSubmit={handleSubscribeWebhook} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={orgNameWh}
                onChange={e => setOrgNameWh(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Webhook HTTPS Endpoint URL</label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={whLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {whLoading ? 'Subscribing...' : 'Register Webhook Endpoint'}
            </button>
          </form>

          {whSecret && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-indigo-800 dark:text-indigo-300 block">HMAC Signature Secret Key:</span>
              <code className="block p-2.5 bg-slate-900 text-indigo-400 rounded-xl font-mono text-[11px] break-all select-all">
                {whSecret}
              </code>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block">
                🔒 Verify `x-agripilot-signature` header on incoming webhook events using HMAC SHA-256.
              </span>
            </div>
          )}
        </section>
      </div>

      {/* OpenAPI Endpoint Documentation Reference */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">OpenAPI v1 Endpoints Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-emerald-600 block">GET /api/v1/partner/listings</span>
            <span className="text-slate-500">Query active crop listings and harvest availability</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-emerald-600 block">GET /api/traceability/batch/:batchCode</span>
            <span className="text-slate-500">Public farm-to-fork batch traceability details</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-indigo-600 block">POST /api/v1/webhooks/subscriptions</span>
            <span className="text-slate-500">Register webhook listeners for order events</span>
          </div>
        </div>
      </section>
    </div>
  );
};
