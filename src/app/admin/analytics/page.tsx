"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { MessageCircle, CheckCircle, AlertTriangle, Clock, Zap, DollarSign, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getAnalytics, getWorkspaces, AnalyticsData, Workspace } from '@/lib/api';

const WORKSPACE_COLORS: Record<string, string> = {
  HR: 'bg-blue-500',
  Finance: 'bg-green-500',
  Exim: 'bg-amber-500',
  IT: 'bg-purple-500',
};

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

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

function fmtMs(ms: number): string {
  if (!ms) return '—';
  return (ms / 1000).toFixed(1) + 's';
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [wsFilter, setWsFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectClass =
    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAnalytics(dateRange, wsFilter || undefined, modelFilter || undefined);
      setAnalytics(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, wsFilter, modelFilter]);

  useEffect(() => {
    getWorkspaces().then(setWorkspaces).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxTokens = analytics
    ? Math.max(...analytics.workspace_usage.map((d) => d.tokens), 1)
    : 1;

  const maxModel = analytics && analytics.model_usage.length > 0
    ? Math.max(...analytics.model_usage.map(m => m.count), 1)
    : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={selectClass}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.name}>
                {ws.name}
              </option>
            ))}
          </select>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Models</option>
            <option value="gpt">Auto (GPT)</option>
            <option value="gemini">Quick response (Gemini)</option>
            <option value="qwen">Think deeper (Qwen)</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchData} className="text-xs underline">Retry</button>
          </div>
        )}

        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={MessageCircle}
            title="Total Queries"
            value={analytics ? fmt(analytics.total_messages) : '—'}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle}
            title="Successful"
            value={analytics ? fmt(analytics.successful) : '—'}
            color="bg-green-500"
            loading={loading}
          />
          <StatCard
            icon={AlertTriangle}
            title="Failed"
            value={analytics ? fmt(analytics.failed) : '—'}
            color="bg-red-500"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            title="Avg Response"
            value={analytics ? fmtMs(analytics.avg_response_ms) : '—'}
            color="bg-teal-500"
            loading={loading}
          />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            title="Prompt Tokens"
            value={analytics ? fmt(analytics.prompt_tokens) : '—'}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            icon={Zap}
            title="Completion Tokens"
            value={analytics ? fmt(analytics.completion_tokens) : '—'}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            icon={Zap}
            title="Total Tokens"
            value={analytics ? fmt(analytics.total_tokens) : '—'}
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={DollarSign}
            title="Estimated Cost"
            value="$0.00"
            color="bg-slate-500"
            loading={loading}
          />
        </div>

        {/* Workspace Usage */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Usage by Workspace
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
              ))
            ) : analytics && analytics.workspace_usage.length > 0 ? (
              analytics.workspace_usage.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {d.workspace}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {fmt(d.tokens)} tokens · {fmt(d.sessions)} sessions · {fmt(d.messages)} messages
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${WORKSPACE_COLORS[d.workspace] || 'bg-gray-400'} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${(d.tokens / maxTokens) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No workspace usage data yet.
              </p>
            )}
          </div>
        </div>

        {/* Model Usage */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Usage by Model
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
              ))
            ) : analytics && analytics.model_usage.length > 0 ? (
              analytics.model_usage.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {MODEL_LABELS[m.model] || m.model}
                    </span>
                    <span className="text-gray-500 text-xs font-bold">
                      {m.count} messages
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${MODEL_COLORS[m.model] || 'bg-gray-400'} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max((m.count / maxModel) * 100, 0)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No model usage data yet.
              </p>
            )}
          </div>
        </div>

        {/* Token by User Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Token Usage by User
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold text-right">Prompt</th>
                  <th className="px-5 py-3 font-semibold text-right">Completion</th>
                  <th className="px-5 py-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : analytics && analytics.top_users.length > 0 ? (
                  analytics.top_users.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{u.department}</td>
                      <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                        {fmt(u.prompt_tokens)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                        {fmt(u.completion_tokens)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {fmt(u.total_tokens)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                      No token usage data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Response Time Trend placeholder */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8 text-center">
          <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Response Time Trend chart will be displayed here when a chart library is integrated.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
