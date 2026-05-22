"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Save, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSystemSettings, saveSystemSettings, getLLMModels, SystemSettingItem } from '@/lib/api';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function InputRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="sm:w-64 shrink-0">{children}</div>
    </div>
  );
}

export default function SystemSettingsPage() {
  const inputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white disabled:opacity-50";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [liveModels, setLiveModels] = useState<{ id: string; available: boolean }[]>([]);
  const [lmStudioOnline, setLmStudioOnline] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  // Define default values
  const [settings, setSettings] = useState<Record<string, string>>({
    file_types: 'pdf,docx,xlsx,txt,png,jpg,jpeg',
    max_upload_size_mb: '10',
    chat_attachments: 'true',
    
    llm_model: 'llama3',
    llm_models: 'google/gemma-2-9b,qwen/qwen3.5-9b',
    embedding_model: 'all-MiniLM-L6-v2',
    source_refs: 'true',
    response_timeout: '30',
    max_chunks: '5',
    
    require_login: 'true',
    admin_only_kb: 'true',
    audit_logging: 'true',
    failed_login_limit: '5',
    
    chat_retention_days: '90',
    attach_retention_days: '30',
    audit_retention_days: '365',
    
    system_prompt: 'You are SKAPS AI, a helpful company assistant. Answer questions based on the provided company knowledge base documents. Be concise, professional, and accurate.',
  });

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSystemSettings();
      if (data.length > 0) {
        const newSettings = { ...settings };
        data.forEach(item => {
          newSettings[item.key] = item.value;
        });
        setSettings(newSettings);
      }
      
      // Fetch live status from backend
      try {
        const res = await getLLMModels();
        setLiveModels(res.models);
        setLmStudioOnline(res.lm_studio_online);
      } catch (err) {
        console.error("Failed to fetch live models in settings page", err);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await saveSystemSettings(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: String(value) }));
  };

  const getModelLabel = (model: string): string => {
    const m = model.toLowerCase();
    if (m === 'gpt') return 'Auto (GPT)';
    if (m === 'gemini') return 'Quick response (Gemini)';
    if (m === 'qwen') return 'Think deeper (Qwen)';

    if (model.includes('/')) {
      const [provider, name] = model.split('/');
      const formattedName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      return `${formattedName} (${formattedProvider})`;
    }

    return model
      .split(/[-_/]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const configuredModels: { id: string; enabled: boolean }[] = (() => {
    const raw = settings.llm_models;
    if (!raw) return [];
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Fallback
      }
    }
    return raw.split(',').map(m => m.trim()).filter(Boolean).map(m => ({ id: m, enabled: true }));
  })();

  const handleAddModel = () => {
    const trimmed = newModelName.trim();
    if (!trimmed) return;
    if (configuredModels.some(m => m.id === trimmed)) {
      setError('Model is already in the list.');
      return;
    }
    const newList = [...configuredModels, { id: trimmed, enabled: true }];
    updateSetting('llm_models', JSON.stringify(newList));
    setNewModelName('');
    setError('');
  };

  const handleRemoveModel = (modelToRemove: string) => {
    const newList = configuredModels.filter(m => m.id !== modelToRemove);
    updateSetting('llm_models', JSON.stringify(newList));
    if (settings.llm_model === modelToRemove) {
      updateSetting('llm_model', newList[0]?.id || '');
    }
  };

  const handleToggleModelEnabled = (modelId: string) => {
    const newList = configuredModels.map(m => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    );
    updateSetting('llm_models', JSON.stringify(newList));
  };

  const isModelActive = (modelId: string) => {
    const found = liveModels.find(m => m.id === modelId);
    return found ? found.available : false;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg">
            Settings saved successfully!
          </div>
        )}

        {/* File Upload Rules */}
        <SectionCard title="File Upload Rules">
          <InputRow label="Allowed File Types" desc="Comma-separated extensions">
            <input type="text" value={settings.file_types} onChange={e => updateSetting('file_types', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Max Upload Size (MB)">
            <input type="number" value={settings.max_upload_size_mb} onChange={e => updateSetting('max_upload_size_mb', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Enable Chat Attachments" desc="Allow users to upload files in chat">
            <div className="flex justify-end">
              <Toggle checked={settings.chat_attachments === 'true'} onChange={v => updateSetting('chat_attachments', v)} />
            </div>
          </InputRow>
        </SectionCard>

        {/* AI / LLM Settings */}
        <SectionCard title="AI / LLM Settings">
          <InputRow label="Default LLM Model" desc="Fallback model for user sessions">
            <select
              value={settings.llm_model}
              onChange={e => updateSetting('llm_model', e.target.value)}
              className={inputClass}
            >
              {configuredModels.map(model => (
                <option key={model.id} value={model.id}>
                  {getModelLabel(model.id)}
                </option>
              ))}
              {configuredModels.length === 0 && (
                <option value="">No models configured</option>
              )}
            </select>
          </InputRow>
          <InputRow label="Default Embedding Model">
            <input type="text" value={settings.embedding_model} onChange={e => updateSetting('embedding_model', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Enable Source References" desc="Show citations from KB in responses">
            <div className="flex justify-end">
              <Toggle checked={settings.source_refs === 'true'} onChange={v => updateSetting('source_refs', v)} />
            </div>
          </InputRow>
          <InputRow label="Response Timeout (seconds)">
            <input type="number" value={settings.response_timeout} onChange={e => updateSetting('response_timeout', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Max Context Chunks" desc="Maximum KB chunks sent as context">
            <input type="number" value={settings.max_chunks} onChange={e => updateSetting('max_chunks', e.target.value)} className={inputClass} />
          </InputRow>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Allowed LLM Models
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure and enable/disable available models. Disabled models are hidden in user chat dropdowns.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await getLLMModels();
                    setLiveModels(res.models);
                    setLmStudioOnline(res.lm_studio_online);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Refresh status
              </button>
            </div>

            {/* Models Table */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-4 bg-white dark:bg-gray-900/50 shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Model ID</th>
                    <th className="px-4 py-3 font-semibold">Display Label</th>
                    <th className="px-4 py-3 font-semibold">LM Studio Connection</th>
                    <th className="px-4 py-3 font-semibold text-center">Enabled</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {configuredModels.map(model => {
                    const active = isModelActive(model.id);
                    const label = getModelLabel(model.id);
                    return (
                      <tr key={model.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={model.id}>
                          {model.id}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">
                          {label}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                            active 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-850 dark:text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {active ? 'Loaded' : 'Not Loaded'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Toggle 
                              checked={model.enabled !== false} 
                              onChange={() => handleToggleModelEnabled(model.id)} 
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveModel(model.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="Remove Model"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {configuredModels.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                        No models configured. Add one below to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. google/gemma-2-9b"
                value={newModelName}
                onChange={e => setNewModelName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddModel();
                  }
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddModel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Add Model
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Security Settings */}
        <SectionCard title="Security Settings">
          <InputRow label="Require Login">
            <div className="flex justify-end">
              <Toggle checked={settings.require_login === 'true'} onChange={v => updateSetting('require_login', v)} />
            </div>
          </InputRow>
          <InputRow label="Admin-only KB Upload" desc="Only admins can upload to Knowledge Base">
            <div className="flex justify-end">
              <Toggle checked={settings.admin_only_kb === 'true'} onChange={v => updateSetting('admin_only_kb', v)} />
            </div>
          </InputRow>
          <InputRow label="Enable Audit Logging">
            <div className="flex justify-end">
              <Toggle checked={settings.audit_logging === 'true'} onChange={v => updateSetting('audit_logging', v)} />
            </div>
          </InputRow>
          <InputRow label="Failed Login Limit" desc="Max failed attempts before lockout">
            <input type="number" value={settings.failed_login_limit} onChange={e => updateSetting('failed_login_limit', e.target.value)} className={inputClass} />
          </InputRow>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard title="Data Retention">
          <InputRow label="Chat History Retention (Days)">
            <input type="number" value={settings.chat_retention_days} onChange={e => updateSetting('chat_retention_days', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Chat Attachment Retention (Days)">
            <input type="number" value={settings.attach_retention_days} onChange={e => updateSetting('attach_retention_days', e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Audit Log Retention (Days)">
            <input type="number" value={settings.audit_retention_days} onChange={e => updateSetting('audit_retention_days', e.target.value)} className={inputClass} />
          </InputRow>
        </SectionCard>

        {/* System Prompt */}
        <SectionCard title="System Prompt">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Default instruction sent to the LLM for every conversation.</p>
            <textarea
              rows={5}
              value={settings.system_prompt}
              onChange={e => updateSetting('system_prompt', e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-y"
            />
          </div>
        </SectionCard>

        {/* Save */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
