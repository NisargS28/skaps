"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { MessageCircle, CheckCircle, AlertTriangle, Clock, Zap, DollarSign, Search } from 'lucide-react';
import { useState } from 'react';

const topQuestions = [
  { q: "What is the remote work policy?", count: 145 },
  { q: "How to submit an expense report?", count: 112 },
  { q: "Where is the EXIM compliance checklist?", count: 89 },
  { q: "How to reset VPN password?", count: 76 },
  { q: "What are public holidays this year?", count: 65 },
];

const noAnswerQueries = [
  { q: "What is the company's stance on AI usage?", count: 12 },
  { q: "How to request a standing desk?", count: 8 },
  { q: "Office parking policy for visitors?", count: 6 },
];

const deptUsage = [
  { dept: 'IT', sessions: 1800, messages: 5400, tokens: 412000, color: 'bg-purple-500' },
  { dept: 'HR', sessions: 1240, messages: 3720, tokens: 342000, color: 'bg-blue-500' },
  { dept: 'Finance', sessions: 860, messages: 2580, tokens: 218000, color: 'bg-green-500' },
  { dept: 'Exim', sessions: 540, messages: 1620, tokens: 156000, color: 'bg-amber-500' },
];

const tokenByUser = [
  { name: 'Alice Smith', dept: 'HR', prompt: 124500, completion: 98200, total: 222700 },
  { name: 'Bob Jones', dept: 'Finance', prompt: 89300, completion: 71400, total: 160700 },
  { name: 'Charlie Brown', dept: 'IT', prompt: 67800, completion: 54100, total: 121900 },
  { name: 'Diana Prince', dept: 'Exim', prompt: 45200, completion: 36800, total: 82000 },
  { name: 'Eve Wilson', dept: 'HR', prompt: 38700, completion: 29500, total: 68200 },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [wsFilter, setWsFilter] = useState('');
  const maxTokens = Math.max(...deptUsage.map(d => d.tokens));
  const selectClass = "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className={selectClass}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <select value={wsFilter} onChange={e => setWsFilter(e.target.value)} className={selectClass}>
            <option value="">All Workspaces</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Exim">Exim</option>
            <option value="IT">IT</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MessageCircle} title="Total Queries" value="12,450" trend="+14%" trendUp color="bg-blue-500" />
          <StatCard icon={CheckCircle} title="Successful" value="12,082" trend="+12%" trendUp color="bg-green-500" />
          <StatCard icon={AlertTriangle} title="Failed" value="368" trend="-18%" trendUp={false} color="bg-red-500" />
          <StatCard icon={Clock} title="Avg Response" value="1.2s" trend="-0.3s" trendUp color="bg-teal-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Zap} title="Prompt Tokens" value="365.5k" color="bg-blue-500" />
          <StatCard icon={Zap} title="Completion Tokens" value="289.9k" color="bg-indigo-500" />
          <StatCard icon={Zap} title="Total Tokens" value="655.5k" trend="+14%" trendUp color="bg-amber-500" />
          <StatCard icon={DollarSign} title="Estimated Cost" value="$0.00" color="bg-slate-500" />
        </div>

        {/* Middle: Top Questions + No-answer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Asked Questions</h3>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {topQuestions.map((q, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{q.q}</p>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{q.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No-Answer Queries</h3>
              <p className="text-xs text-gray-400 mt-0.5">Questions the bot couldn't answer</p>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {noAnswerQueries.map((q, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{q.q}</p>
                  <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">{q.count}×</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Department Usage */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage by Workspace</h3>
          </div>
          <div className="p-5 space-y-5">
            {deptUsage.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{d.dept}</span>
                  <span className="text-gray-500 text-xs">{fmt(d.tokens)} tokens · {fmt(d.sessions)} sessions · {fmt(d.messages)} messages</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className={`${d.color} h-2.5 rounded-full`} style={{ width: `${(d.tokens / maxTokens) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token by User Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Token Usage by User</h3>
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
                {tokenByUser.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.dept}</td>
                    <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">{fmt(u.prompt)}</td>
                    <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">{fmt(u.completion)}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">{fmt(u.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Response Time Trend placeholder */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8 text-center">
          <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Response Time Trend chart will be displayed here when a chart library is integrated.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
