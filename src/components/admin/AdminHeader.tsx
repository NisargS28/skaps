"use client";

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/workspaces': 'Workspaces',
  '/admin/knowledge-base': 'Knowledge Base',
  '/admin/analytics': 'Analytics',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'System Settings',
};

interface AdminHeaderProps {
  user: { name: string; email: string; role: string } | null;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] || 'Admin';

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications placeholder */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Admin user badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-gray-900 dark:text-white leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
