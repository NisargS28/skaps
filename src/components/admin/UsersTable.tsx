"use client";

import { useState, useEffect } from 'react';
import { Edit2, Ban, Eye, KeyRound, Search, Zap, RefreshCw, CheckCircle, X, Download } from 'lucide-react';
import { getAdminUsers, AdminUser, updateUserStatus, updateAdminUser, resetAdminUserPassword } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { exportToCsv } from '@/lib/exportCsv';

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', department: '', role: '' });
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    getAdminUsers({ search, department, role, status })
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUserId(String(user.id));
    }
    fetchUsers();
  }, [search, department, role, status]);

  const toggleStatus = async (user: AdminUser) => {
    if (currentUserId && String(user.id) === currentUserId) {
      alert("You cannot disable your own admin account.");
      return;
    }
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await updateUserStatus(user.id, newStatus);
      fetchUsers();
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('user_status_updates');
        bc.postMessage({ userId: user.id, status: newStatus });
        bc.close();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditUser(user);
    setFormData({ name: user.name, email: user.email, department: user.department, role: user.role });
    setError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    setError('');
    try {
      await updateAdminUser(editUser.id, formData);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (!newPassword.trim()) {
      setError('Password cannot be empty');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await resetAdminUserPassword(resetUser.id, newPassword);
      setResetUser(null);
      setNewPassword('');
      alert('Password reset successful');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden relative">
      <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {loading ? 'Loading users...' : `Total ${users.length} users`}
        </span>
        <button
          onClick={() => exportToCsv(`users_${new Date().toISOString().split('T')[0]}.csv`, users)}
          disabled={loading || users.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
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
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No users found.</td></tr>
            ) : users.map((u) => (
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
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                  {u.last_login_at ? new Date(u.last_login_at.endsWith('Z') ? u.last_login_at : u.last_login_at + 'Z').toLocaleString() : 'Never'}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-gray-900 dark:text-white text-xs">{fmt(u.total_tokens)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">P:{fmt(u.prompt_tokens)} · C:{fmt(u.completion_tokens)}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setViewUser(u)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleStatus(u)} 
                      disabled={currentUserId === String(u.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        currentUserId === String(u.id)
                          ? 'opacity-30 cursor-not-allowed text-gray-500'
                          : u.status === 'active' 
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`} 
                      title={currentUserId === String(u.id) ? "Cannot disable yourself" : (u.status === 'active' ? "Disable" : "Enable")}
                    >
                      {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => { setResetUser(u); setNewPassword(''); setError(''); }}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors" 
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{viewUser.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">{viewUser.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Department</span>
                  <span className="font-medium text-gray-900 dark:text-white">{viewUser.department}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Role</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{viewUser.role}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize inline-block ${statusStyles[viewUser.status] || ''}`}>
                  {viewUser.status}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Prompt Tokens</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{viewUser.prompt_tokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Completion Tokens</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{viewUser.completion_tokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Tokens</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{viewUser.total_tokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setViewUser(null)} className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select
                      value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Exim">Exim</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h2>
              <button onClick={() => setResetUser(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter a new password for <span className="font-semibold text-gray-900 dark:text-white">{resetUser.name}</span>.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setResetUser(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
