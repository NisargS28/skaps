import { Plus, MessageSquare, Briefcase, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  isOpen: boolean;
  sessions?: any[];
  activeSessionId?: number | null;
  onSelectSession?: (id: number | null) => void;
}

export default function Sidebar({ activeWorkspace, setActiveWorkspace, isOpen, sessions = [], activeSessionId, onSelectSession }: SidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-50 dark:bg-gray-950 border-r dark:border-gray-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full`}>
      <div className="p-4 border-b dark:border-gray-800 flex flex-col gap-4">
        <div className="flex items-center justify-center py-2">
          <Image 
            src="/SkapsLogo_300px.png" 
            alt="SKAPS Logo" 
            width={300} 
            height={300} 
            className="w-auto h-24 object-contain"
            priority
          />
        </div>
        <button 
          onClick={() => onSelectSession?.(null)}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspaces</h3>
          <div className="space-y-1">
            {workspaces.map(ws => (
              <button
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${activeWorkspace === ws ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4" />
                  {ws}
                </div>
                {activeWorkspace === ws && <ChevronRight className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div> */}
        
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Chats</h3>
          <div className="space-y-1">
            {sessions.map((session) => (
              <button 
                key={session.id} 
                onClick={() => onSelectSession?.(session.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors truncate ${activeSessionId === session.id ? 'bg-gray-200 dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900'}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{session.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
