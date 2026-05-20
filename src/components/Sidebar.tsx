import { Plus, MessageSquare, Briefcase, ChevronRight, MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  isOpen: boolean;
  sessions?: any[];
  activeSessionId?: number | null;
  onSelectSession?: (id: number | null) => void;
  onRenameSession?: (id: number, newTitle: string) => void;
  onDeleteSession?: (id: number) => void;
}

export default function Sidebar({ activeWorkspace, setActiveWorkspace, isOpen, sessions = [], activeSessionId, onSelectSession, onRenameSession, onDeleteSession }: SidebarProps) {
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startRename = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setDropdownOpenId(null);
  };

  const submitRename = (id: number) => {
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

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
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Chats</h3>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id} className="relative group flex items-center">
                {editingId === session.id ? (
                  <div className="flex items-center w-full bg-white dark:bg-gray-900 border border-blue-500 rounded-md px-2 py-1.5 shadow-sm">
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(session.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800 dark:text-gray-200 min-w-0"
                    />
                    <div className="flex items-center gap-1 ml-1 shrink-0">
                      <button onClick={() => submitRename(session.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-green-600">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={cancelRename} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => onSelectSession?.(session.id)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors min-w-0 ${activeSessionId === session.id ? 'bg-gray-200 dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900'}`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpenId(dropdownOpenId === session.id ? null : session.id);
                      }}
                      className={`absolute right-1 p-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {dropdownOpenId === session.id && (
                      <div ref={dropdownRef} className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg z-30 py-1 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(session.id, session.title);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this chat?")) {
                              onDeleteSession?.(session.id);
                              setDropdownOpenId(null);
                            }
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
