import { User, Bot, Paperclip, BookOpen, FileText } from 'lucide-react';

interface Attachment {
  id: string | number;
  original_file_name: string;
  file_path: string;
}

interface RAGSource {
  fileName: string;
  documentId: number;
  chunkIndex: number;
  score: number;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  attachments?: Attachment[];
  sources?: RAGSource[];
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isUser ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
          {message.text && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-2 ${!message.text ? '' : 'pt-2 border-t'} ${isUser ? 'border-blue-400/30' : 'border-gray-300 dark:border-gray-700'}`}>
              {message.attachments.map((att, idx) => (
                <a 
                  key={idx} 
                  href={`http://localhost:8000/${att.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity cursor-pointer ${isUser ? 'bg-blue-500/20 text-blue-50' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'}`}
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[150px]" title={att.original_file_name}>{att.original_file_name}</span>
                </a>
              ))}
            </div>
          )}
          
          {/* RAG Sources Citations */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-gray-300 dark:border-gray-700">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Grounded Sources:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {message.sources.map((source, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                  >
                    <div className="flex items-start gap-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate" title={source.fileName}>
                        {source.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                      <span>Chunk #{source.chunkIndex}</span>
                      <span className="font-semibold px-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        Match: {Math.round(source.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
