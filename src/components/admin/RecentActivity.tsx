export default function RecentActivity() {
  const activities = [
    { id: 1, user: 'Alice Smith', action: 'Uploaded document', entity: 'Employee_Handbook_2024.pdf', time: '10 minutes ago', type: 'DOCUMENT_UPLOADED' },
    { id: 2, user: 'Bob Jones', action: 'Updated system setting', entity: 'max_upload_size_mb', time: '1 hour ago', type: 'SYSTEM_SETTING_UPDATED' },
    { id: 3, user: 'Charlie Brown', action: 'User login', entity: 'charlie@example.com', time: '2 hours ago', type: 'USER_LOGIN' },
    { id: 4, user: 'Diana Prince', action: 'Created workspace', entity: 'Legal', time: '4 hours ago', type: 'WORKSPACE_CREATED' },
    { id: 5, user: 'Eve Wilson', action: 'Deleted document', entity: 'Old_Policy.pdf', time: '1 day ago', type: 'DOCUMENT_DELETED' },
  ];

  const typeColors: Record<string, string> = {
    DOCUMENT_UPLOADED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    SYSTEM_SETTING_UPDATED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    WORKSPACE_CREATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    DOCUMENT_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {activities.map((a) => (
          <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                <span className="font-medium">{a.user}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">{a.action}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{a.entity} · {a.time}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${typeColors[a.type] || 'bg-gray-100 text-gray-600'}`}>
              {a.type.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
