"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, FileText, Trash2, RefreshCw, Eye, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getDocuments, uploadDocument, deleteDocument, getWorkspaces, KBDocument, Workspace } from '@/lib/api';

const procStatusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  deleted: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const embStatusStyles: Record<string, string> = {
  embedded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KBDocument[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsFilter, setWsFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadWs, setUploadWs] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(() => {
    setLoading(true);
    getDocuments(wsFilter || undefined)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [wsFilter]);

  useEffect(() => {
    getWorkspaces().then(setWorkspaces);
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!uploadWs) {
      setUploadError('Please select a workspace before uploading.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file, uploadWs);
      }
      fetchDocs();
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      setDeleteConfirmId(null);
      fetchDocs();
    } catch (e: any) {
      alert(e.message || 'Failed to delete document');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Upload Card */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
          className={`bg-white dark:bg-gray-900 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700'}`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${uploading ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            {uploading
              ? <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
              : <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {uploading ? 'Uploading…' : 'Upload to Knowledge Base'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag & drop files here, or click to browse. Supported: PDF, DOCX, XLSX, TXT
          </p>

          {uploadError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4" /> {uploadError}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <select
              value={uploadWs}
              onChange={e => setUploadWs(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
            >
              <option value="">Select Workspace *</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.name}>{ws.name}</option>
              ))}
            </select>
            <button
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.xlsx,.txt"
              onChange={e => handleFileUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Workspace Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Filter by workspace:</label>
          <select
            value={wsFilter}
            onChange={e => setWsFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
          >
            <option value="">All Workspaces</option>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.name}>{ws.name}</option>
            ))}
          </select>
          <button onClick={fetchDocs} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Document Repository</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? 'Loading…' : `${docs.length} document${docs.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document</th>
                  <th className="px-5 py-3 font-semibold">Workspace</th>
                  <th className="px-5 py-3 font-semibold">Uploaded By</th>
                  <th className="px-5 py-3 font-semibold">Size</th>
                  <th className="px-5 py-3 font-semibold">Processing</th>
                  <th className="px-5 py-3 font-semibold">Embedding</th>
                  <th className="px-5 py-3 font-semibold">Chunks</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td></tr>
                ) : docs.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-gray-400">No documents found.</td></tr>
                ) : docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {doc.workspace || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{doc.uploaded_by || 'System'}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{formatBytes(doc.file_size)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${procStatusStyles[doc.processing_status] || ''}`}>
                        {doc.processing_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${embStatusStyles[doc.embedding_status] || ''}`}>
                        {doc.embedding_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 font-medium">{doc.chunk_count ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirmId === doc.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600 dark:text-red-400 mr-1">Confirm?</span>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                            >Yes</button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                            >No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(doc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
