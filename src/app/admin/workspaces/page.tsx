"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Users, FileText, MessageSquare, Eye, Edit2, Ban } from 'lucide-react';

const mockWorkspaces = [
  { id: 1, name: 'HR', description: 'Human Resources policies and employee support', status: 'active', userCount: 45, docCount: 120, sessionCount: 1240, updatedAt: '2024-05-20' },
  { id: 2, name: 'Finance', description: 'Finance, invoices, reimbursements and accounting support', status: 'active', userCount: 12, docCount: 84, sessionCount: 860, updatedAt: '2024-05-19' },
  { id: 3, name: 'Exim', description: 'Export and import documentation and compliance support', status: 'active', userCount: 28, docCount: 342, sessionCount: 540, updatedAt: '2024-05-18' },
  { id: 4, name: 'IT', description: 'IT support, systems, access and infrastructure support', status: 'active', userCount: 156, docCount: 45, sessionCount: 1800, updatedAt: '2024-05-20' },
];

const colorMap: Record<string, string> = { HR: 'bg-blue-500', Finance: 'bg-green-500', Exim: 'bg-amber-500', IT: 'bg-purple-500' };

export default function WorkspacesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage knowledge domains and their associated documents.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {mockWorkspaces.map((ws) => (
            <div key={ws.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className={`h-1.5 ${colorMap[ws.name] || 'bg-gray-400'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ws.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ws.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 capitalize">
                    {ws.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">Users</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{ws.userCount}</p>
                  </div>
                  <div className="text-center border-x border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-xs">Docs</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{ws.docCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs">Sessions</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{ws.sessionCount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400">Updated {ws.updatedAt}</p>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Disable"><Ban className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
