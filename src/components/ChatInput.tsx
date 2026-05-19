import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-end w-full border dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all p-2 gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 mb-0.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              console.log("File selected:", e.target.files[0].name);
            }
          }} 
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask SKAPS AI anything..."
          className="flex-1 max-h-[200px] bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none outline-none py-2 px-1 focus:ring-0 text-[15px]"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className={`p-2 mb-0.5 rounded-full flex items-center justify-center transition-all shrink-0 ${
            text.trim() && !isLoading 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" /> AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
