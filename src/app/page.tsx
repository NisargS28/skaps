"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserId(JSON.parse(storedUser).id);
    } else {
      router.push('/login');
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
            text: m.content
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

  const handleSendMessage = async (text: string) => {
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
      setMessages(prev => [...prev, { id: tempUserId, role: "user", text }]);
      setIsLoading(true);

      const userMsgRes = await fetch(`http://localhost:8000/api/chat/sessions/${currentSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: "user", content: text })
      });
      if (!userMsgRes.ok) throw new Error("Failed to send message");

      if (!activeSessionId) loadSessions();

      setTimeout(async () => {
        try {
          const botText = `Response of ${text}`;
          
          const botRes = await fetch(`http://localhost:8000/api/chat/sessions/${currentSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: "bot", content: botText })
          });
          if (!botRes.ok) throw new Error("Failed to save bot response");
          const botData = await botRes.json();

          setMessages(prev => [...prev, { id: botData.id.toString(), role: "bot", text: botText }]);
        } catch (botErr) {
          console.error("Error in bot response:", botErr);
        } finally {
          setIsLoading(false);
          loadSessions(); 
        }
      }, 1500);
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
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar 
          activeWorkspace={activeWorkspace} 
          setActiveWorkspace={setActiveWorkspace}
          toggleSidebar={toggleSidebar}
        />
        
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage}
            activeWorkspace={activeWorkspace}
          />
        </main>
      </div>
    </div>
  );
}
