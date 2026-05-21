"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState, useCallback, Fragment } from 'react';
import { Search, ChevronDown, ChevronRight, RefreshCw, Download } from 'lucide-react';
import { getAuditLogs, AuditLogEntry } from '@/lib/api';
import { exportToCsv } from '@/lib/exportCsv';

const actionColors: Record<string, string> = {
  USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  USER_CREATED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  USER_STATUS_UPDATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  USER_ROLE_UPDATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DOCUMENT_UPLOADED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DOCUMENT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  WORKSPACE_CREATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  WORKSPACE_UPDATED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SYSTEM_SETTING_UPDATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SYSTEM_SETTING_CREATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  FAILED_LOGIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ALL_ACTIONS = [
  'USER_LOGIN', 'USER_CREATED', 'USER_STATUS_UPDATED', 'USER_ROLE_UPDATED',
  'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED',
  'WORKSPACE_CREATED', 'WORKSPACE_UPDATED',
  'SYSTEM_SETTING_UPDATED', 'SYSTEM_SETTING_CREATED', 'FAILED_LOGIN',
];
const ALL_ENTITIES = ['User', 'Document', 'Workspace', 'SystemSetting'];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const selectClass =
    'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditLogs({
        search: search || undefined,
        action: actionFilter || undefined,
        entity_type: entityFilter || undefined,
        limit: 200,
      });
      setLogs(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, entityFilter]);

  // Fetch on filter change with small debounce for search
  useEffect(() => {
    const timer = setTimeout(() => { fetchLogs(); }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchLogs, search, actionFilter, entityFilter]);

  function formatTimestamp(ts: string | null): string {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Entities</option>
            {ALL_ENTITIES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => exportToCsv(`audit_logs_${new Date().toISOString().split('T')[0]}.csv`, logs)}
            disabled={loading || logs.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchLogs} className="text-xs underline">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Loading…' : `${logs.length} log${logs.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 w-8" />
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Entity Type</th>
                  <th className="px-5 py-3 font-semibold">Entity ID</th>
                  <th className="px-5 py-3 font-semibold">IP Address</th>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <Fragment key={log.id}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <td className="px-5 py-3 text-gray-400">
                          {expandedId === log.id
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {log.user}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${actionColors[log.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                          {log.entity_type || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                          {log.entity_id ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                          {log.ip_address || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-details`}>
                          <td colSpan={7} className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto font-mono">
                              {log.details
                                ? JSON.stringify(log.details, null, 2)
                                : 'No additional details.'}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
