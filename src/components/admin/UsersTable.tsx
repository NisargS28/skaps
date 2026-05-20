"use client";

import { useState } from 'react';
import { Edit2, Ban, Eye, KeyRound, Search, Zap } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@skaps.com', department: 'HR', role: 'employee', status: 'active', lastLogin: '2024-05-20 09:15', promptTokens: 124500, completionTokens: 98200, totalTokens: 222700 },
  { id: 2, name: 'Bob Jones', email: 'bob@skaps.com', department: 'Finance', role: 'admin', status: 'active', lastLogin: '2024-05-20 08:42', promptTokens: 89300, completionTokens: 71400, totalTokens: 160700 },
  { id: 3, name: 'Charlie Brown', email: 'charlie@skaps.com', department: 'IT', role: 'employee', status: 'inactive', lastLogin: '2024-05-15 14:20', promptTokens: 67800, completionTokens: 54100, totalTokens: 121900 },
  { id: 4, name: 'Diana Prince', email: 'diana@skaps.com', department: 'Exim', role: 'employee', status: 'active', lastLogin: '2024-05-19 16:33', promptTokens: 45200, completionTokens: 36800, totalTokens: 82000 },
  { id: 5, name: 'Eve Wilson', email: 'eve@skaps.com', department: 'HR', role: 'manager', status: 'active', lastLogin: '2024-05-20 10:05', promptTokens: 38700, completionTokens: 29500, totalTokens: 68200 },
  { id: 6, name: 'Frank Miller', email: 'frank@skaps.com', department: 'IT', role: 'employee', status: 'disabled', lastLogin: '2024-04-12 11:00', promptTokens: 12300, completionTokens: 8900, totalTokens: 21200 },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  disabled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface UsersTableProps {
  search: string;
  department: string;
  role: string;
  status: string;
}

export default function UsersTable({ search, department, role, status }: UsersTableProps) {
  const filtered = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && u.department !== department) return false;
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Department</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Last Login</th>
              <th className="px-5 py-3 font-semibold">Tokens</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{u.name}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{u.department}</td>
                <td className="px-5 py-3.5 capitalize text-gray-600 dark:text-gray-300">{u.role}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[u.status] || ''}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{u.lastLogin}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-gray-900 dark:text-white text-xs">{fmt(u.totalTokens)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">P:{fmt(u.promptTokens)} · C:{fmt(u.completionTokens)}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Disable">
                      <Ban className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors" title="Reset Password">
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
