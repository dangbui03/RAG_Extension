import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChatMessage } from "@/share/types";

interface UserPromptProps {
  chat: ChatMessage;
}

const UserPrompt: React.FC<UserPromptProps> = ({ chat }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-blue-600">
        U
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-sm text-gray-300">You</h3>
          <span className="text-xs text-gray-500">
            {format(new Date(chat.timestamp), "h:mm a")}
          </span>
        </div>
        <div
          className={`markdown-content text-bodyLarge pt-1 ${
            isExpanded ? "" : "line-clamp-4"
          }`}
        >
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
            {chat.user_prompt}
          </p>
        </div>
        {chat.user_prompt.split("\n").length > 4 && (
          <div className="h-8 flex items-center mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="text-blue-500 hover:text-blue-400 hover:bg-transparent p-0 h-auto"
              title={isExpanded ? "Show less" : "Show more"}
            >
              {isExpanded ? (
                <>
                  <a className="codicon codicon-chevron-up h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <a className="codicon codicon-chevron-down h-4 w-4 mr-1" />
                  Show more
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPrompt;
