"use client";
import { useEffect, useState } from 'react';
import { getAuditLogs, AuditLogEntry } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Unknown time';
  const tsWithZ = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  const seconds = Math.floor((new Date().getTime() - new Date(tsWithZ).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

const TYPE_COLORS: Record<string, string> = {
  DOCUMENT_UPLOADED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  SYSTEM_SETTING_UPDATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  WORKSPACE_CREATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DOCUMENT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs({ limit: 5 }).then(setActivities).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1 overflow-auto">
        {loading ? (
           <div className="p-5 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : activities.length === 0 ? (
           <div className="p-5 text-center text-sm text-gray-500">No recent activity.</div>
        ) : activities.map((a) => (
          <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                <span className="font-medium">{a.user}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {a.entity_type} {a.entity_id ? `#${a.entity_id}` : ''} · {timeAgo(a.timestamp)}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${TYPE_COLORS[a.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {a.action.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
