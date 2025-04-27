import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const History: React.FC = () => {
  const { chats, setCurrentChat, deleteChat, deleteAllChats } = useChat();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    navigate("/");
  };

  // Handle clear history
  const handleClearHistory = () => {
      deleteAllChats();
      setOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-base font-semibold text-white">Chat History</h1>
        <div className="flex justify-between gap-2 sm:gap-4">
          {chats.length > 0 && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>
                <div
                  className="codicon codicon-clear-all rounded-xl cursor-pointer"
                  title="History Clear"
                  onClick={() => setOpen(true)}
                />
              </PopoverTrigger>
              <PopoverContent>
                <div className="text-xs text-gray-400">
                  <p>Are you sure you want to delete all chat history?</p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={
                        handleClearHistory
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <div
            className="codicon codicon-add rounded-xl cursor-pointer"
            title="New Chat"
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="codicon codicon-history text-4xl mb-2"></div>
          <p className="text-center">No chat history found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="mb-2 bg-[#2d2d2d] rounded-md overflow-hidden"
            >
              <div
                className="flex justify-between p-3 hover:bg-[#3a3a3a] cursor-pointer"
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white truncate">
                    {chat.title || "Untitled Chat"}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span className="ml-2">{formatDate(chat.updatedAt)}</span>
                    <span className="mx-2">•</span>
                    <span>{chat.messages.length} messages</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="text-gray-400 hover:text-red-400 ml-2"
                  title="Delete chat"
                >
                  <div className="codicon codicon-trash"></div>
                </button>
              </div>

              {chat.messages.length > 0 && (
                <div className="px-3 pb-3 text-xs text-gray-300 overflow-hidden max-h-16">
                  <div className="line-clamp-2">
                    <strong>Last message:</strong>{" "}
                    {chat.messages[
                      chat.messages.length - 1
                    ].user_prompt.substring(0, 100)}
                    {chat.messages[chat.messages.length - 1].user_prompt
                      .length > 100
                      ? "..."
                      : ""}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
