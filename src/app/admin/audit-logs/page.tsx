"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

const mockLogs = [
  { id: 1, user: 'Bob Jones', action: 'USER_LOGIN', entityType: 'User', entityId: 2, ip: '192.168.1.10', timestamp: '2024-05-20 10:15:00', details: { browser: 'Chrome 125', os: 'Windows 11' } },
  { id: 2, user: 'Alice Smith', action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 15, ip: '192.168.1.22', timestamp: '2024-05-20 09:42:00', details: { file: 'Employee_Handbook_2024.pdf', workspace: 'HR', size: '2.4 MB' } },
  { id: 3, user: 'Bob Jones', action: 'SYSTEM_SETTING_UPDATED', entityType: 'SystemSetting', entityId: 3, ip: '192.168.1.10', timestamp: '2024-05-20 09:30:00', details: { key: 'max_upload_size_mb', old: '5', new: '10' } },
  { id: 4, user: 'System', action: 'FAILED_LOGIN', entityType: 'User', entityId: 0, ip: '10.0.0.55', timestamp: '2024-05-19 23:12:00', details: { email: 'unknown@example.com', reason: 'Invalid credentials' } },
  { id: 5, user: 'Bob Jones', action: 'USER_CREATED', entityType: 'User', entityId: 7, ip: '192.168.1.10', timestamp: '2024-05-19 15:00:00', details: { name: 'Frank Miller', role: 'employee', department: 'IT' } },
  { id: 6, user: 'Bob Jones', action: 'USER_ROLE_UPDATED', entityType: 'User', entityId: 5, ip: '192.168.1.10', timestamp: '2024-05-19 14:45:00', details: { user: 'Eve Wilson', oldRole: 'employee', newRole: 'manager' } },
  { id: 7, user: 'Bob Jones', action: 'WORKSPACE_CREATED', entityType: 'Workspace', entityId: 5, ip: '192.168.1.10', timestamp: '2024-05-18 11:20:00', details: { name: 'Legal', description: 'Legal team documents' } },
  { id: 8, user: 'Alice Smith', action: 'DOCUMENT_DELETED', entityType: 'Document', entityId: 3, ip: '192.168.1.22', timestamp: '2024-05-18 10:05:00', details: { file: 'Outdated_Policy.pdf', workspace: 'HR' } },
];

const actionColors: Record<string, string> = {
  USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  USER_CREATED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  USER_ROLE_UPDATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DOCUMENT_UPLOADED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DOCUMENT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  WORKSPACE_CREATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SYSTEM_SETTING_UPDATED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  FAILED_LOGIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const allActions = ['USER_LOGIN', 'USER_CREATED', 'USER_ROLE_UPDATED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'WORKSPACE_CREATED', 'SYSTEM_SETTING_UPDATED', 'FAILED_LOGIN'];
const allEntities = ['User', 'Document', 'Workspace', 'SystemSetting'];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const selectClass = "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const filtered = mockLogs.filter(l => {
    if (search && !l.user.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter && l.action !== actionFilter) return false;
    if (entityFilter && l.entityType !== entityFilter) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className={selectClass}>
            <option value="">All Actions</option>
            {allActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className={selectClass}>
            <option value="">All Entities</option>
            {allEntities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 w-8"></th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Entity Type</th>
                  <th className="px-5 py-3 font-semibold">Entity ID</th>
                  <th className="px-5 py-3 font-semibold">IP Address</th>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <td className="px-5 py-3 text-gray-400">
                        {expandedId === log.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{log.user}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${actionColors[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{log.entityType}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{log.entityId}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{log.ip}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{log.timestamp}</td>
                    </tr>
                    {expandedId === log.id && (
                      <tr key={`${log.id}-details`}>
                        <td colSpan={7} className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30">
                          <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
