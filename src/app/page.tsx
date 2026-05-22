"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, getToken, logout } from '@/lib/auth';
import { verifySession, getLLMModels, LLMModel } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import SettingsModal from '@/components/SettingsModal';

interface Attachment {
  id: string | number;
  original_file_name: string;
  file_path: string;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  attachments?: Attachment[];
}

interface ChatSession {
  id: number;
  title: string;
  workspace: string;
  created_at: string;
}

export default function Home() {
  const [activeWorkspace, setActiveWorkspace] = useState("HR");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const router = useRouter();

  useEffect(() => {
    getLLMModels()
      .then(res => {
        if (res && Array.isArray(res.models)) {
          setAvailableModels(res.models);
        }
      })
      .catch(err => console.error("Error loading LLM models:", err));
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const user = getUser();
    const token = getToken();
    
    if (user && token) {
      setUserId(Number(user.id));
      
      const checkSession = () => {
        verifySession(Number(user.id), token).catch((err) => {
          console.error("Session verification failed:", err);
          if (err.message) {
            alert(err.message);
          }
          logout();
          router.push('/login');
        });
      };

      // Verify session token is still valid (single device login)
      checkSession();
      
      // Poll every 30 seconds to catch server-side disabling across different browsers
      const intervalId = setInterval(checkSession, 30000);
      
      // Listen to cross-tab user status updates for instant kick out in same browser
      let bc: BroadcastChannel | null = null;
      if (typeof window !== 'undefined') {
        bc = new BroadcastChannel('user_status_updates');
        bc.onmessage = (event) => {
          if (event.data?.userId === Number(user.id) && event.data?.status === 'disabled') {
            checkSession();
          }
        };
      }
      
      return () => {
        clearInterval(intervalId);
        if (bc) bc.close();
      };
    }
  }, [router]);

  const loadSessions = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [userId]);

  useEffect(() => {
    if (activeSessionId) {
      fetch(`http://localhost:8000/api/chat/sessions/${activeSessionId}/messages`)
        .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then(data => {
          setMessages(data.map((m: any) => ({
            id: m.id.toString(),
            role: m.role,
            text: m.content,
            attachments: m.attachments || []
          })));
        })
        .catch(err => {
          console.error("Error fetching messages:", err);
        });
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRenameSession = async (id: number, newTitle: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
      }
    } catch (e) {
      console.error("Error renaming session", e);
    }
  };

  const handleDeleteSession = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/chat/sessions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(null);
        }
      }
    } catch (e) {
      console.error("Error deleting session", e);
    }
  };

  const handleSendMessage = async (text: string, files: File[] = [], model: string = 'gpt') => {
    if (!userId) return;

    try {
      let currentSessionId = activeSessionId;

      if (!currentSessionId) {
        const res = await fetch(`http://localhost:8000/api/chat/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, title: "New Chat", workspace: activeWorkspace })
        });
        if (!res.ok) throw new Error("Failed to create session");
        const data = await res.json();
        currentSessionId = data.id;
        setActiveSessionId(currentSessionId);
      }

      const tempUserId = Date.now().toString();
      // Optimistically add message with local file objects mapped to the Attachment interface format
      const tempAttachments = files.map((f, i) => ({
        id: `temp-${i}`,
        original_file_name: f.name,
        file_path: ''
      }));
      setMessages(prev => [...prev, { id: tempUserId, role: "user", text, attachments: tempAttachments }]);
      setIsLoading(true);

      // Build FormData for the new /chat/send endpoint
      const formData = new FormData();
      formData.append("session_id", String(currentSessionId));
      formData.append("message", text);
      formData.append("model", model);
      for (const file of files) {
        formData.append("files", file);
      }

      const userMsgRes = await fetch(`http://localhost:8000/api/chat/send`, {
        method: 'POST',
        body: formData,
      });
      if (!userMsgRes.ok) {
        const errData = await userMsgRes.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to send message");
      }

      // Read the streaming response
      const reader = userMsgRes.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("No reader available on the response stream.");
      }

      // Add a placeholder bot message immediately to start displaying incoming tokens
      const tempBotMsgId = `temp-bot-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: tempBotMsgId,
        role: "bot",
        text: ""
      }]);
      setIsLoading(false);

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || !cleanLine.startsWith("data: ")) continue;

          try {
            const rawJson = cleanLine.slice(6);
            const parsed = JSON.parse(rawJson);

            if (parsed.event === "init") {
              // Update user message details and attachments in state
              setMessages(prev => prev.map(m =>
                m.id === tempUserId
                  ? {
                      id: parsed.message.id.toString(),
                      role: "user",
                      text: parsed.message.content,
                      attachments: parsed.attachments || []
                    }
                  : m
              ));
            } else if (parsed.event === "token") {
              // Append incoming token to the active bot message
              setMessages(prev => prev.map(m =>
                m.id === tempBotMsgId
                  ? {
                      ...m,
                      text: m.text + parsed.text
                    }
                  : m
              ));
            } else if (parsed.event === "done") {
              // Replace placeholder bot message with the finalized persisted bot message
              setMessages(prev => prev.map(m =>
                m.id === tempBotMsgId
                  ? {
                      id: parsed.bot_message.id.toString(),
                      role: "bot",
                      text: parsed.bot_message.content
                    }
                  : m
              ));
            } else if (parsed.event === "error") {
              // Append error message to bot response
              setMessages(prev => prev.map(m =>
                m.id === tempBotMsgId
                  ? {
                      ...m,
                      text: m.text + `\n[Error: ${parsed.error}]`
                    }
                  : m
              ));
            }
          } catch (e) {
            console.error("Error parsing event stream chunk:", e);
          }
        }
      }

      if (!activeSessionId) loadSessions();
      setIsLoading(false);
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeWorkspace={activeWorkspace} 
        setActiveWorkspace={setActiveWorkspace}
        isOpen={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar 
          activeWorkspace={activeWorkspace} 
          setActiveWorkspace={setActiveWorkspace}
          toggleSidebar={toggleSidebar}
          openSettings={() => setSettingsOpen(true)}
        />
        
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage}
            activeWorkspace={activeWorkspace}
            models={availableModels}
          />
        </main>
      </div>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userId={userId}
      />
    </div>
  );
}
