"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSessions, AdminSession } from '@/lib/api';
import { Monitor, LogIn, LogOut, Clock, MapPin, RefreshCw, User } from 'lucide-react';

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function parseUA(ua: string | null): string {
  if (!ua) return 'Unknown';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS Device';
  if (/Android/.test(ua)) return 'Android Device';
  if (/Windows/.test(ua)) {
    if (/Chrome/.test(ua)) return 'Chrome / Windows';
    if (/Firefox/.test(ua)) return 'Firefox / Windows';
    if (/Edg/.test(ua)) return 'Edge / Windows';
    return 'Windows';
  }
  if (/Mac/.test(ua)) {
    if (/Chrome/.test(ua)) return 'Chrome / macOS';
    if (/Safari/.test(ua)) return 'Safari / macOS';
    return 'macOS';
  }
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

const reasonLabels: Record<string, string> = {
  user: 'Signed out',
  displaced: 'Replaced by new login',
  expired: 'Session expired',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'ended'>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSessions({
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setSessions(data);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const filtered = sessions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.user_name.toLowerCase().includes(q) ||
      s.user_email.toLowerCase().includes(q) ||
      (s.ip_address || '').includes(q)
    );
  });

  const activeCount = sessions.filter(s => s.is_active).length;
  const endedCount = sessions.filter(s => !s.is_active).length;

  const selectClass =
    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              User Sessions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time login & logout tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Refreshed at {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Currently Online</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{endedCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ended Sessions</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Sessions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, IP…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={selectClass}>
            <option value="">All Status</option>
            <option value="active">🟢 Online</option>
            <option value="ended">⚪ Ended</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={selectClass}
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={selectClass}
            title="To date"
          />
          {(statusFilter || dateFrom || dateTo || search) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="flex items-center gap-1"><LogIn className="w-3.5 h-3.5" /> Login Time</span>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Logout Time</span>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration</span>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> IP Address</span>
                  </th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && sessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading sessions…
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      No sessions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Ended
                          </span>
                        )}
                      </td>

                      {/* User */}
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{s.user_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{s.user_email}</p>
                        <p className="text-xs text-blue-500 capitalize">{s.user_department} · {s.user_role}</p>
                      </td>

                      {/* Login time */}
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                        {formatDateTime(s.login_at)}
                      </td>

                      {/* Logout time */}
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                        {s.is_active ? (
                          <span className="text-green-500 font-medium">Active now</span>
                        ) : (
                          formatDateTime(s.logout_at)
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 font-mono text-xs whitespace-nowrap">
                        {formatDuration(s.duration_seconds)}
                        {s.is_active && <span className="text-green-500 ml-1 text-[10px]">(live)</span>}
                      </td>

                      {/* IP */}
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 font-mono text-xs whitespace-nowrap">
                        {s.ip_address || '—'}
                      </td>

                      {/* Device */}
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {parseUA(s.user_agent)}
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-3.5 text-xs">
                        {s.logout_reason ? (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            s.logout_reason === 'displaced'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {reasonLabels[s.logout_reason] || s.logout_reason}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
