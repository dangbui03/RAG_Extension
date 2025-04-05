import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import UserPrompt from "@/components/chat/UserPrompt";
import AIResponse from "@/components/chat/AIResponse";

interface ChatMessagesProps {
  message: ChatMessage;
  isLast: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ message, isLast }) => {
  return (
    <div className="mb-6 w-full max-w-xl">
      {/* User Message */}
      <div className="p-1 transition-all duration-300 animate-slide-in">
        <div className="max-w-4xl mx-auto">
          <UserPrompt
            chat={message}
          />
        </div>
      </div>

      {/* AI Message */}
      {(message.status === "sending" || message.ai_answer) && (
        <div
          className={cn(
            "p-1 transition-all duration-300 animate-slide-in", //bg-gray-900/30
            isLast && message.status === "sending" && "animate-pulse"
          )}
        >
          <div className="max-w-4xl mx-auto">
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
