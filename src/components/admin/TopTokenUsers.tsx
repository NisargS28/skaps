"use client";
import { useEffect, useState } from 'react';
import { Zap, RefreshCw, Download } from 'lucide-react';
import { getAnalytics, AnalyticsData } from '@/lib/api';
import { exportToCsv } from '@/lib/exportCsv';

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export default function TopTokenUsers() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics('30d').then(setData).finally(() => setLoading(false));
  }, []);

  const topUsers = data?.top_users || [];
  const max = topUsers.length > 0 ? topUsers[0].total_tokens : 1;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Token Users</h3>
        </div>
        <button
          onClick={() => exportToCsv(`top_users_${new Date().toISOString().split('T')[0]}.csv`, topUsers)}
          disabled={loading || topUsers.length === 0}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-auto">
        {loading ? (
          <div className="p-5 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : topUsers.length === 0 ? (
          <div className="p-5 text-center text-sm text-gray-500">No token data available.</div>
        ) : topUsers.map((u, i) => (
          <div key={i} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.department}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(u.total_tokens)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${Math.max((u.total_tokens / max) * 100, 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
