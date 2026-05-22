"use client";
import { useEffect, useState } from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/lib/api';

const getModelColor = (model: string): string => {
  const m = model.toLowerCase();
  if (m.includes('gpt') || m.includes('openai')) return 'bg-emerald-500';
  if (m.includes('gemini') || m.includes('google')) return 'bg-blue-500';
  if (m.includes('qwen')) return 'bg-purple-500';
  if (m.includes('llama') || m.includes('meta')) return 'bg-indigo-500';
  if (m.includes('mistral') || m.includes('ministral')) return 'bg-rose-500';
  if (m.includes('claude') || m.includes('anthropic')) return 'bg-orange-500';
  if (m.includes('deepseek')) return 'bg-cyan-500';
  
  const premiumColors = [
    'bg-indigo-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-emerald-500'
  ];
  let hash = 0;
  for (let i = 0; i < model.length; i++) {
    hash = model.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % premiumColors.length;
  return premiumColors[index];
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

export default function ModelUsageStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const modelUsage = stats?.model_usage || [];
  const max = modelUsage.length > 0 ? Math.max(...modelUsage.map(m => m.count), 1) : 1;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Model Usage</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-auto">
        {loading ? (
          <div className="p-5 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : modelUsage.length === 0 ? (
          <div className="p-5 text-center text-sm text-gray-500">No model usage data available.</div>
        ) : modelUsage.map((m, i) => (
          <div key={i} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {getModelLabel(m.model)}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{m.count} msgs</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${getModelColor(m.model)}`}
                style={{ width: `${Math.max((m.count / max) * 100, 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
