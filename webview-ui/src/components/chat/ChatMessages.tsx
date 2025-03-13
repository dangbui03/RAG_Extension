import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChatMessage } from "@/types";

interface ChatMessagesProps {
  message: ChatMessage;
  isLast: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ message, isLast }) => {
  const isUser = message.role === "user";
  
  return (
    <div className={cn(
      "px-6 py-5 transition-all duration-300 animate-slide-in",
      isUser ? "bg-transparent" : "bg-gray-900/30",
      isLast && message.status === "sending" && "animate-pulse"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1",
            isUser ? "bg-blue-600" : "bg-gray-700"
          )}>
            {isUser ? "U" : "A"}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-sm text-gray-300">
                {isUser ? "You" : "Assistant"}
              </h3>
              <span className="text-xs text-gray-500">
                {format(new Date(message.timestamp), "h:mm a")}
              </span>
            </div>
            
            <div className="prose prose-invert max-w-none text-sm">
              {message.status === "sending" ? (
                <div className="flex space-x-1 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-200"></div>
                </div>
              ) : (
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
