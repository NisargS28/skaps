"use client";
import { useEffect, useState } from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/lib/api';

const MODEL_COLORS: Record<string, string> = {
  gpt: 'bg-green-500',
  gemini: 'bg-blue-500',
  qwen: 'bg-purple-500',
};

const MODEL_LABELS: Record<string, string> = {
  gpt: 'Auto (GPT)',
  gemini: 'Quick response (Gemini)',
  qwen: 'Think deeper (Qwen)',
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
                {MODEL_LABELS[m.model] || m.model}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{m.count} msgs</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${MODEL_COLORS[m.model] || 'bg-gray-400'}`}
                style={{ width: `${Math.max((m.count / max) * 100, 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
