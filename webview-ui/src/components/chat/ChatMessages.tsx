// import Markdown from "react-markdown";
// import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
// import { format } from "date-fns";
import { ChatMessage } from "@/types";
import UserPrompt from "@/components/chat/UserPrompt";
import AIResponse from "@/components/chat/AIResponse";

interface ChatMessagesProps {
  message: ChatMessage;
  isLast: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ message, isLast }) => {
  return (
    <div className="mb-6">
      {/* User Message */}
      <div className="p-1 transition-all duration-300 animate-slide-in">
        <div className="max-w-4xl mx-auto">
          {/* <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-blue-600">
              U
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm text-gray-300">You</h3>
                <span className="text-xs text-gray-500">
                  {format(new Date(message.timestamp), "h:mm a")}
                </span>
              </div>
              
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{message.user_prompt}</ReactMarkdown>
              </div>
            </div>
          </div> */}
          <UserPrompt
            chat={message}
          />
        </div>
      </div>

      {/* AI Message */}
      {(message.status === "sending" || message.ai_answer) && (
        <div
          className={cn(
            "p-1 transition-all duration-300 animate-slide-in bg-gray-900/30",
            isLast && message.status === "sending" && "animate-pulse"
          )}
        >
          <div className="max-w-4xl mx-auto">
            {/* <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-gray-700">
                A
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-sm text-gray-300">
                    Assistant
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), "h:mm a")}
                  </span>
                </div>
                <div className="markdown-body">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.ai_answer}
                  </Markdown>
                </div>
              </div>
            </div> */}
            <AIResponse
              chat={message}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
