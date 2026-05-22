"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import RecentActivity from '@/components/admin/RecentActivity';
import TopTokenUsers from '@/components/admin/TopTokenUsers';
import { getDashboardStats, DashboardStats } from '@/lib/api';
import {
  Users, UserCheck, MessageSquare, BookOpen, Briefcase,
  FileWarning, AlertTriangle, Clock, Zap, HardDrive,
  CheckCircle, Wifi, Database, Cpu, RefreshCw
} from 'lucide-react';

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

const WORKSPACE_COLORS: Record<string, string> = {
  HR: 'bg-blue-500',
  Finance: 'bg-green-500',
  Exim: 'bg-amber-500',
  IT: 'bg-purple-500',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const maxTokens = stats ? Math.max(...stats.dept_usage.map(d => d.tokens), 1) : 1;
  const avgRespSec = stats ? (stats.avg_response_ms / 1000).toFixed(1) + 's' : '—';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchStats} className="flex items-center gap-1 text-xs underline"><RefreshCw className="w-3 h-3" /> Retry</button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard icon={Users} title="Total Users" value={stats ? fmt(stats.total_users) : '—'} color="bg-blue-500" loading={loading} />
          <StatCard icon={UserCheck} title="Active Today" value={stats ? fmt(stats.active_today) : '—'} color="bg-cyan-500" loading={loading} />
          <StatCard icon={MessageSquare} title="Chat Sessions" value={stats ? fmt(stats.total_sessions) : '—'} color="bg-indigo-500" loading={loading} />
          <StatCard icon={BookOpen} title="KB Documents" value={stats ? fmt(stats.kb_documents) : '—'} color="bg-emerald-500" loading={loading} />
          <StatCard icon={Briefcase} title="Active Workspaces" value={stats ? fmt(stats.active_workspaces) : '—'} color="bg-purple-500" loading={loading} />
          <StatCard icon={FileWarning} title="Pending Docs" value={stats ? fmt(stats.pending_docs) : '—'} color="bg-orange-500" loading={loading} />
          <StatCard icon={AlertTriangle} title="Failed Queries" value={stats ? fmt(stats.failed_queries) : '—'} color="bg-red-500" loading={loading} />
          <StatCard icon={Clock} title="Avg Response" value={stats ? avgRespSec : '—'} color="bg-teal-500" loading={loading} />
          <StatCard icon={Zap} title="Total Tokens" value={stats ? fmt(stats.total_tokens) : '—'} color="bg-amber-500" loading={loading} />
          <StatCard icon={HardDrive} title="Storage Used" value="—" color="bg-slate-500" loading={loading} />
        </div>

        {/* Middle Row: Activity + Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">System Health</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: 'API Server', icon: Wifi, status: loading ? 'Checking…' : error ? 'Error' : 'Healthy', ok: !error },
                { label: 'Database', icon: Database, status: loading ? 'Checking…' : error ? 'Unreachable' : 'Connected', ok: !error },
                { label: 'LLM Service', icon: Cpu, status: loading ? 'Checking…' : stats?.llm_healthy ? 'Connected' : 'Unreachable', ok: !!stats?.llm_healthy },
                { label: 'Vector Store', icon: Database, status: 'Not configured', ok: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <s.icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                    <p className={`text-xs font-medium ${s.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ● {s.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TopTokenUsers />
        </div>

        {/* Bottom Row: Dept Usage + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Usage */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Department Usage</h3>
            </div>
            <div className="p-5 space-y-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                ))
              ) : stats && stats.dept_usage.length > 0 ? (
                stats.dept_usage.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{d.workspace}</span>
                      <span className="text-gray-500 text-xs">{fmt(d.tokens)} tokens · {fmt(d.sessions)} sessions</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${WORKSPACE_COLORS[d.workspace] || 'bg-gray-400'} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${(d.tokens / maxTokens) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No usage data yet.</p>
              )}
            </div>
          </div>

          <RecentActivity />
        </div>
      </div>
    </AdminLayout>
  );
}
