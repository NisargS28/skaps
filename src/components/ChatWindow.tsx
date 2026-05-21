import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Bot } from 'lucide-react';

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

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, files: File[], model: string) => void;
  activeWorkspace: string;
}

const suggestions = [
  "Leave policy",
  "Salary structure",
  "Export rules",
  "IT support ticket"
];

export default function ChatWindow({ messages, isLoading, onSendMessage, activeWorkspace }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                How can I help you with <span className="text-blue-600 dark:text-blue-400">{activeWorkspace}</span> today?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(suggestion, [], 'gpt')}
                    className="p-4 border dark:border-gray-800 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                  >
                    <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{suggestion}</p>
                    <p className="text-xs text-gray-500 mt-1">Ask about this topic</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex w-full justify-start mb-6">
                  <div className="flex max-w-[80%] gap-3 flex-row">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t dark:border-gray-800">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
