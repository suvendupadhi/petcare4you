import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import { systemConfigService } from '../services/petCareService';

export default function SuperAdminConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await systemConfigService.getConfigurations();
      setConfigs(data);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      setSaving(true);
      await systemConfigService.updateConfiguration(key, value);
      setMessage({ type: 'success', text: 'Configuration updated successfully' });
      await loadConfigs();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading Configuration...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Configuration ⚙️</h1>
          <p className="text-slate-500">Manage global settings and feature toggles.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Global Settings</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {configs.map((config) => (
              <div key={config.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-xs">{config.key.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-slate-500">{config.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  {config.key === 'hide_tips_management' ? (
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      value={config.value}
                      onChange={(e) => handleUpdate(config.key, e.target.value)}
                      disabled={saving}
                    >
                      <option value="true">Hidden</option>
                      <option value="false">Visible</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      value={config.value}
                      onChange={(e) => handleUpdate(config.key, e.target.value)}
                      disabled={saving}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
