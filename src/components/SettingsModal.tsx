"use client";

import { useEffect, useState } from "react";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Palette,
  MessageSquare,
  FileUp,
  ShieldCheck,
  ChevronRight,
  Check,
  Trash2,
  Download,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Image,
  AlignLeft,
  User as UserIcon
} from "lucide-react";
import { useTheme } from "next-themes";

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";
type TabId = "appearance" | "chat" | "fileupload" | "personalization" | "privacy";

interface Settings {
  theme: Theme;
  font_size: FontSize;
  default_workspace: string;
  show_source_refs: boolean;
  auto_scroll: boolean;
  show_suggested_questions: boolean;
  show_uploaded_files: boolean;
  custom_instructions_enabled: boolean;
  custom_instructions_text: string;
  saved_memories_enabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  font_size: "medium",
  default_workspace: "HR",
  show_source_refs: true,
  auto_scroll: true,
  show_suggested_questions: true,
  show_uploaded_files: true,
  custom_instructions_enabled: false,
  custom_instructions_text: "",
  saved_memories_enabled: false,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}

// --- Generic UI Components ---

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-6 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("appearance");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const { setTheme } = useTheme();

  // Load from API
  useEffect(() => {
    if (isOpen && userId) {
      fetch(`http://localhost:8000/api/settings/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.detail) {
            setSettings(data);
            setTheme(data.theme);
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, userId, setTheme]);

  // Save to API
  const updateSettings = (patch: Partial<Settings>) => {
    const newSettings = { ...settings, ...patch };
    setSettings(newSettings);
    
    if (patch.theme) {
      setTheme(patch.theme);
    }
    
    if (userId) {
      fetch(`http://localhost:8000/api/settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      })
      .then(res => {
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      })
      .catch(err => console.error(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium transition-opacity duration-300 flex items-center gap-1 ${saved ? 'text-green-600 dark:text-green-400 opacity-100' : 'opacity-0'}`}>
              <Check className="w-4 h-4" /> Saved
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 p-4 shrink-0 overflow-x-auto md:overflow-y-auto flex md:block gap-2">
            {[
              { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
              { id: "chat", label: "Chat Preferences", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "fileupload", label: "File Upload", icon: <FileUp className="w-4 h-4" /> },
              { id: "personalization", label: "Personalization", icon: <UserIcon className="w-4 h-4" /> },
              { id: "privacy", label: "Privacy & Data", icon: <ShieldCheck className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all whitespace-nowrap md:mb-1 ${
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-gray-950">
            <div className="max-w-2xl mx-auto">
              
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <SectionCard>
                    <CardHeader icon={<Palette className="w-5 h-5" />} title="Theme" subtitle="Choose your preferred color scheme" />
                    <div className="p-6 grid grid-cols-3 gap-3">
                      {[
                        { id: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
                        { id: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
                        { id: "system", label: "System", icon: <Monitor className="w-5 h-5" /> }
                      ].map(({ id, label, icon }) => {
                        const active = settings.theme === id;
                        return (
                          <button
                            key={id}
                            onClick={() => updateSettings({ theme: id as Theme })}
                            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                              active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500"
                            }`}
                          >
                            {icon}
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </SectionCard>
                  
                  <SectionCard>
                    <CardHeader icon={<AlignLeft className="w-5 h-5" />} title="Font Size" subtitle="Adjust the text size across the app" />
                    <div className="p-6 grid grid-cols-3 gap-3">
                      {[
                        { id: "small", label: "Small", preview: "text-sm" },
                        { id: "medium", label: "Medium", preview: "text-base" },
                        { id: "large", label: "Large", preview: "text-xl" }
                      ].map(({ id, label, preview }) => (
                        <button
                          key={id}
                          onClick={() => updateSettings({ font_size: id as FontSize })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            settings.font_size === id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 text-gray-500"
                          }`}
                        >
                          <span className={`font-bold ${preview}`}>Aa</span>
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === "chat" && (
                <SectionCard>
                  <CardHeader icon={<MessageSquare className="w-5 h-5" />} title="Chat Preferences" subtitle="Customize your chat experience" />
                  <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/60">
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Default Workspace</label>
                    <select
                      value={settings.default_workspace}
                      onChange={(e) => updateSettings({ default_workspace: e.target.value })}
                      className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {["HR", "Finance", "Exim", "IT"].map((ws) => (
                        <option key={ws} value={ws}>{ws}</option>
                      ))}
                    </select>
                  </div>
                  <ToggleRow label="Show source references" checked={settings.show_source_refs} onChange={v => updateSettings({ show_source_refs: v })} />
                  <ToggleRow label="Auto-scroll responses" checked={settings.auto_scroll} onChange={v => updateSettings({ auto_scroll: v })} />
                  <ToggleRow label="Show suggested questions" checked={settings.show_suggested_questions} onChange={v => updateSettings({ show_suggested_questions: v })} />
                </SectionCard>
              )}

              {activeTab === "fileupload" && (
                <SectionCard>
                  <CardHeader icon={<FileUp className="w-5 h-5" />} title="File Upload" subtitle="Manage file upload settings and restrictions" />
                  <ToggleRow label="Show uploaded files in chat" checked={settings.show_uploaded_files} onChange={v => updateSettings({ show_uploaded_files: v })} />
                </SectionCard>
              )}

              {activeTab === "personalization" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Personalization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Control how SKAPS AI tailors responses using your preferences. <a href="#" className="text-blue-500 hover:underline">Learn more.</a></p>
                  </div>
                  
                  <div className="space-y-4">
                    <SectionCard className="p-5">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base">Custom instructions</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add details about your preferences so the AI can respond your way.</p>
                        </div>
                        <Toggle checked={settings.custom_instructions_enabled} onChange={v => updateSettings({ custom_instructions_enabled: v })} />
                      </div>
                      <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit instructions</button>
                    </SectionCard>

                    <SectionCard className="p-5">
                      <div className="mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base">Work profile</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The AI will use your work profile for more relevant answers.</p>
                      </div>
                      <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View work data</button>
                    </SectionCard>

                    <SectionCard className="p-5">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base">Saved memories</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Allow AI to remember details to provide better responses.</p>
                        </div>
                        <Toggle checked={settings.saved_memories_enabled} onChange={v => updateSettings({ saved_memories_enabled: v })} />
                      </div>
                      <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage saved memories</button>
                    </SectionCard>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <SectionCard>
                  <CardHeader icon={<ShieldCheck className="w-5 h-5" />} title="Privacy & Data" subtitle="Control your data and chat history" />
                  <div className="px-6 py-5 space-y-3 border-b border-gray-50 dark:border-gray-800/60">
                    <button
                      onClick={() => {
                        if (userId && confirm("Are you sure you want to clear your chat history?")) {
                          fetch(`http://localhost:8000/api/chat/history/${userId}`, { method: "DELETE" })
                            .then(res => {
                              if (res.ok) alert("Chat history cleared!");
                            })
                            .catch(err => console.error(err));
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-sm font-medium transition-all"
                    >
                      <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear Chat History</span>
                    </button>

                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings }, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "skaps_data_export.json";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-sm font-medium transition-all"
                    >
                      <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Export My Data</span>
                    </button>
                  </div>
                </SectionCard>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
