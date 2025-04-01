import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { ChatMessage } from "@/types";

interface ChatMessagesProps {
  chat: ChatMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

const AIResponse: React.FC<ChatMessagesProps> = ({ chat, children }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-gray-700">
        A
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-sm text-gray-300">Assistant</h3>
          <span className="text-xs text-gray-500">
            {format(new Date(chat.timestamp), "h:mm a")}
          </span>
        </div>

        {children}
        
        <div className="markdown-content">
          <Markdown remarkPlugins={[remarkGfm]}>{chat.ai_answer}</Markdown>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
