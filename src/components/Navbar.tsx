"use client";

import { User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser, logout } from '@/lib/auth';

interface NavbarProps {
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;
  toggleSidebar: () => void;
}

const workspaces = ["HR", "Finance", "Exim", "IT"];

export default function Navbar({ activeWorkspace, setActiveWorkspace, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const authUser = getUser();
    if (authUser) {
      setUser({ name: authUser.name, email: authUser.email });
    }
  }, []);

  return (
    <nav className="h-14 border-b bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SKAPS AI</div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200">
            {activeWorkspace}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {workspaces.map(ws => (
              <button 
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 first:rounded-t-md last:rounded-b-md ${activeWorkspace === ws ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {ws}
              </button>
            ))}
          </div>
        </div>
        <ThemeToggle />
        
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 transition-all">
            <User className="w-4 h-4" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-20 origin-top-right">
            <div className="px-4 py-2 border-b dark:border-gray-800 mb-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Not signed in'}</p>
            </div>
            
            <button 
              onClick={() => router.push('/profile')}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-4 h-4 text-gray-500" />
              My Profile
            </button>
            <button className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-4 h-4 text-gray-500" />
              Settings
            </button>
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
            
            <button 
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}
