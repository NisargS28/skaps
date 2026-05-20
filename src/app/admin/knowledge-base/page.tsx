"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, FileText, Trash2, RefreshCw, Eye, Search } from 'lucide-react';
import { useState } from 'react';

const mockDocs = [
  { id: 1, name: 'Employee_Handbook_2024.pdf', workspace: 'HR', uploader: 'Alice Smith', size: '2.4 MB', processingStatus: 'completed', embeddingStatus: 'embedded', chunks: 48, date: '2024-05-15' },
  { id: 2, name: 'Q1_Financial_Report.xlsx', workspace: 'Finance', uploader: 'Bob Jones', size: '1.1 MB', processingStatus: 'completed', embeddingStatus: 'embedded', chunks: 22, date: '2024-05-18' },
  { id: 3, name: 'Export_Compliance_Guide.docx', workspace: 'Exim', uploader: 'Diana Prince', size: '3.8 MB', processingStatus: 'processing', embeddingStatus: 'pending', chunks: 0, date: '2024-05-19' },
  { id: 4, name: 'IT_Security_Policy.pdf', workspace: 'IT', uploader: 'Charlie Brown', size: '890 KB', processingStatus: 'failed', embeddingStatus: 'failed', chunks: 0, date: '2024-05-20' },
  { id: 5, name: 'Leave_Policy_2024.pdf', workspace: 'HR', uploader: 'Alice Smith', size: '1.5 MB', processingStatus: 'completed', embeddingStatus: 'embedded', chunks: 31, date: '2024-05-12' },
  { id: 6, name: 'Tax_Guidelines.txt', workspace: 'Finance', uploader: 'Bob Jones', size: '420 KB', processingStatus: 'completed', embeddingStatus: 'pending', chunks: 15, date: '2024-05-10' },
];

const procStatusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  deleted: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const embStatusStyles: Record<string, string> = {
  embedded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function KnowledgeBasePage() {
  const [workspace, setWorkspace] = useState('');

  const filtered = workspace ? mockDocs.filter(d => d.workspace === workspace) : mockDocs;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload to Knowledge Base</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Drag and drop files here, or click to browse. Supported: PDF, DOCX, XLSX, TXT</p>
          <div className="flex items-center justify-center gap-3">
            <select value={workspace} onChange={e => setWorkspace(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300">
              <option value="">All Workspaces</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Exim">Exim</option>
              <option value="IT">IT</option>
            </select>
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Select Files
            </button>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Document Repository</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Admin-uploaded company documents for RAG knowledge base</p>
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
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{doc.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{doc.workspace}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{doc.uploader}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{doc.size}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${procStatusStyles[doc.processingStatus]}`}>{doc.processingStatus}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${embStatusStyles[doc.embeddingStatus]}`}>{doc.embeddingStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 font-medium">{doc.chunks}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{doc.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md" title="View"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md" title="Reprocess"><RefreshCw className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
