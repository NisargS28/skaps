"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import RecentActivity from '@/components/admin/RecentActivity';
import TopTokenUsers from '@/components/admin/TopTokenUsers';
import {
  Users, UserCheck, MessageSquare, BookOpen, Briefcase,
  FileWarning, AlertTriangle, Clock, Zap, HardDrive,
  CheckCircle, Wifi, Database, Cpu
} from 'lucide-react';

const deptUsage = [
  { dept: 'HR', sessions: 1240, tokens: 342000, color: 'bg-blue-500' },
  { dept: 'Finance', sessions: 860, tokens: 218000, color: 'bg-green-500' },
  { dept: 'Exim', sessions: 540, tokens: 156000, color: 'bg-amber-500' },
  { dept: 'IT', sessions: 1800, tokens: 412000, color: 'bg-purple-500' },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export default function AdminDashboardPage() {
  const maxTokens = Math.max(...deptUsage.map(d => d.tokens));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard icon={Users} title="Total Users" value="1,248" trend="+5.2%" trendUp color="bg-blue-500" />
          <StatCard icon={UserCheck} title="Active Today" value="342" trend="+12%" trendUp color="bg-cyan-500" />
          <StatCard icon={MessageSquare} title="Chat Sessions" value="45.2k" trend="+8.1%" trendUp color="bg-indigo-500" />
          <StatCard icon={BookOpen} title="KB Documents" value="842" trend="+3" trendUp color="bg-emerald-500" />
          <StatCard icon={Briefcase} title="Active Workspaces" value="4" color="bg-purple-500" />
          <StatCard icon={FileWarning} title="Pending Docs" value="12" trend="-4" trendUp={false} color="bg-orange-500" />
          <StatCard icon={AlertTriangle} title="Failed Queries" value="23" trend="-18%" trendUp={false} color="bg-red-500" />
          <StatCard icon={Clock} title="Avg Response" value="1.2s" trend="-0.3s" trendUp color="bg-teal-500" />
          <StatCard icon={Zap} title="Total Tokens" value="1.13M" trend="+14%" trendUp color="bg-amber-500" />
          <StatCard icon={HardDrive} title="Storage Used" value="4.2 GB" trend="+120MB" trendUp={false} color="bg-slate-500" />
        </div>

        {/* Middle Row: Activity + Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
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
              {deptUsage.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{d.dept}</span>
                    <span className="text-gray-500 text-xs">{fmt(d.tokens)} tokens · {fmt(d.sessions)} sessions</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className={`${d.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${(d.tokens / maxTokens) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">System Health</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: 'API Server', icon: Wifi, status: 'Healthy', ok: true },
                { label: 'Database', icon: Database, status: 'Connected', ok: true },
                { label: 'LLM Service', icon: Cpu, status: 'Running', ok: true },
                { label: 'Vector Store', icon: Database, status: 'Connected', ok: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <s.icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                    <p className={`text-xs font-medium ${s.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {s.ok ? '● ' : '● '}{s.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
