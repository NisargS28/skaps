"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, FileText, MessageSquare, Eye, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, Workspace } from '@/lib/api';

const colorMap: Record<string, string> = { HR: 'bg-blue-500', Finance: 'bg-green-500', Exim: 'bg-amber-500', IT: 'bg-purple-500' };

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkspaces = () => {
    setLoading(true);
    getWorkspaces()
      .then(setWorkspaces)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', status: 'active' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (ws: Workspace) => {
    setEditingId(ws.id);
    setFormData({ name: ws.name, description: ws.description || '', status: ws.status });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Workspace name is required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await updateWorkspace(editingId, formData);
      } else {
        await createWorkspace(formData);
      }
      setModalOpen(false);
      fetchWorkspaces();
      window.dispatchEvent(new Event('workspacesUpdated'));
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('workspace_updates');
        bc.postMessage('updated');
        bc.close();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ws: Workspace) => {
    if (confirm(`Are you sure you want to delete workspace "${ws.name}"? This action cannot be undone.`)) {
      try {
        await deleteWorkspace(ws.id);
        fetchWorkspaces();
        window.dispatchEvent(new Event('workspacesUpdated'));
        if (typeof window !== 'undefined') {
          const bc = new BroadcastChannel('workspace_updates');
          bc.postMessage('updated');
          bc.close();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete workspace');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage knowledge domains and their associated documents.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Workspace
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center p-12 text-gray-500">No workspaces found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
            {workspaces.map((ws) => (
              <div key={ws.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className={`h-1.5 ${colorMap[ws.name] || 'bg-gray-400'}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ws.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ws.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ws.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {ws.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-center border-r border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-xs">Docs</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{ws.doc_count}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs">Sessions</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{ws.session_count}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400">Updated {ws.updated_at ? new Date(ws.updated_at).toLocaleDateString() : 'Never'}</p>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button 
                        onClick={() => openEditModal(ws)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                        title="Edit"
                      ><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(ws)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" 
                        title="Delete"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Workspace' : 'Add Workspace'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="e.g. Sales, Marketing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none h-24"
                    placeholder="Brief description of this workspace's purpose..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
