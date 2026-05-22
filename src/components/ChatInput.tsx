import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X } from 'lucide-react';
import { LLMModel } from '@/lib/api';

const ACCEPTED_TYPES = ".pdf,.docx,.txt,.xlsx,.png,.jpg,.jpeg";

interface ChatInputProps {
  onSendMessage: (text: string, files: File[], model: string) => void;
  isLoading: boolean;
  models?: LLMModel[];
}

export default function ChatInput({ onSendMessage, isLoading, models }: ChatInputProps) {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getModelLabel = (model: string): string => {
    const m = model.toLowerCase();
    if (m === 'gpt') return 'Auto (GPT)';
    if (m === 'gemini') return 'Quick response (Gemini)';
    if (m === 'qwen') return 'Think deeper (Qwen)';

    if (model.includes('/')) {
      const [provider, name] = model.split('/');
      const formattedName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      return `${formattedName} (${formattedProvider})`;
    }

    return model
      .split(/[-_/]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (models && models.length > 0) {
      const activeModels = models.filter(m => m.available && m.enabled !== false);
      const firstAvailable = activeModels[0]?.id;
      // If we don't have a selected model yet, or the current selected model is not in the list of active ones, set it
      if (firstAvailable && (!selectedModel || !activeModels.some(m => m.id === selectedModel))) {
        setSelectedModel(firstAvailable);
      }
    }
  }, [models, selectedModel]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim(), selectedFiles, selectedModel);
      setText('');
      setSelectedFiles([]);
      // Reset file input so re-selecting the same file works
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset so re-selecting the same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative w-full">
      {/* Selected files chips */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 max-w-[200px]"
            >
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate" title={file.name}>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shrink-0"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}


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
          multiple
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
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
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading || !models || models.filter(m => m.available && m.enabled !== false).length === 0}
          className="mb-1 text-xs font-medium text-gray-500 bg-transparent border-0 hover:bg-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 dark:text-gray-400 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {models && models.filter(m => m.available && m.enabled !== false).length > 0 ? (
            models
              .filter(m => m.available && m.enabled !== false)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {getModelLabel(m.id)}
                </option>
              ))
          ) : (
            <option value="">No models available</option>
          )}
        </select>
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
