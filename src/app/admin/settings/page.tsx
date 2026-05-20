"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Save } from 'lucide-react';
import { useState } from 'react';

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
  const inputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white";

  const [fileTypes, setFileTypes] = useState('pdf,docx,xlsx,txt,png,jpg,jpeg');
  const [maxSize, setMaxSize] = useState('10');
  const [retentionDays, setRetentionDays] = useState('30');
  const [chatAttachments, setChatAttachments] = useState(true);

  const [llmModel, setLlmModel] = useState('llama3');
  const [embeddingModel, setEmbeddingModel] = useState('all-MiniLM-L6-v2');
  const [sourceRefs, setSourceRefs] = useState(true);
  const [responseTimeout, setResponseTimeout] = useState('30');
  const [maxChunks, setMaxChunks] = useState('5');

  const [requireLogin, setRequireLogin] = useState(true);
  const [adminOnlyKB, setAdminOnlyKB] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [failedLoginLimit, setFailedLoginLimit] = useState('5');

  const [chatRetention, setChatRetention] = useState('90');
  const [attachRetention, setAttachRetention] = useState('30');
  const [auditRetention, setAuditRetention] = useState('365');

  const [systemPrompt, setSystemPrompt] = useState('You are SKAPS AI, a helpful company assistant. Answer questions based on the provided company knowledge base documents. Be concise, professional, and accurate.');

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* File Upload Rules */}
        <SectionCard title="File Upload Rules">
          <InputRow label="Allowed File Types" desc="Comma-separated extensions">
            <input type="text" value={fileTypes} onChange={e => setFileTypes(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Max Upload Size (MB)">
            <input type="number" value={maxSize} onChange={e => setMaxSize(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Chat Attachment Retention (Days)">
            <input type="number" value={retentionDays} onChange={e => setRetentionDays(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Enable Chat Attachments" desc="Allow users to upload files in chat">
            <div className="flex justify-end"><Toggle checked={chatAttachments} onChange={setChatAttachments} /></div>
          </InputRow>
        </SectionCard>

        {/* AI / LLM Settings */}
        <SectionCard title="AI / LLM Settings">
          <InputRow label="Default LLM Model">
            <input type="text" value={llmModel} onChange={e => setLlmModel(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Default Embedding Model">
            <input type="text" value={embeddingModel} onChange={e => setEmbeddingModel(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Enable Source References" desc="Show citations from KB in responses">
            <div className="flex justify-end"><Toggle checked={sourceRefs} onChange={setSourceRefs} /></div>
          </InputRow>
          <InputRow label="Response Timeout (seconds)">
            <input type="number" value={responseTimeout} onChange={e => setResponseTimeout(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Max Context Chunks" desc="Maximum KB chunks sent as context">
            <input type="number" value={maxChunks} onChange={e => setMaxChunks(e.target.value)} className={inputClass} />
          </InputRow>
        </SectionCard>

        {/* Security Settings */}
        <SectionCard title="Security Settings">
          <InputRow label="Require Login">
            <div className="flex justify-end"><Toggle checked={requireLogin} onChange={setRequireLogin} /></div>
          </InputRow>
          <InputRow label="Admin-only KB Upload" desc="Only admins can upload to Knowledge Base">
            <div className="flex justify-end"><Toggle checked={adminOnlyKB} onChange={setAdminOnlyKB} /></div>
          </InputRow>
          <InputRow label="Enable Audit Logging">
            <div className="flex justify-end"><Toggle checked={auditLogging} onChange={setAuditLogging} /></div>
          </InputRow>
          <InputRow label="Failed Login Limit" desc="Max failed attempts before lockout">
            <input type="number" value={failedLoginLimit} onChange={e => setFailedLoginLimit(e.target.value)} className={inputClass} />
          </InputRow>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard title="Data Retention">
          <InputRow label="Chat History Retention (Days)">
            <input type="number" value={chatRetention} onChange={e => setChatRetention(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Chat Attachment Retention (Days)">
            <input type="number" value={attachRetention} onChange={e => setAttachRetention(e.target.value)} className={inputClass} />
          </InputRow>
          <InputRow label="Audit Log Retention (Days)">
            <input type="number" value={auditRetention} onChange={e => setAuditRetention(e.target.value)} className={inputClass} />
          </InputRow>
        </SectionCard>

        {/* System Prompt */}
        <SectionCard title="System Prompt">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Default instruction sent to the LLM for every conversation.</p>
            <textarea
              rows={5}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-y"
            />
          </div>
        </SectionCard>

        {/* Save */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Save All Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
