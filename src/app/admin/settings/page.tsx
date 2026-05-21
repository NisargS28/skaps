"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Save, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSystemSettings, saveSystemSettings, SystemSettingItem } from '@/lib/api';

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

  // Define default values
  const [settings, setSettings] = useState<Record<string, string>>({
    file_types: 'pdf,docx,xlsx,txt,png,jpg,jpeg',
    max_upload_size_mb: '10',
    chat_attachments: 'true',
    
    llm_model: 'llama3',
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
          <InputRow label="Default LLM Model">
            <input type="text" value={settings.llm_model} onChange={e => updateSetting('llm_model', e.target.value)} className={inputClass} />
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
