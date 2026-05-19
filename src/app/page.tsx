"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

export default function Home() {
  const [activeWorkspace, setActiveWorkspace] = useState("HR");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: `This is a simulated response for: "${text}"`,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
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
