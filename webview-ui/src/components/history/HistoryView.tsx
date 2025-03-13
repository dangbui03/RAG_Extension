import React from 'react';
import { useChat } from '@/context/ChatContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { format } from "date-fns";

const HistoryView: React.FC = () => {
  const { chats, currentChat, setCurrentChat, deleteChat } = useChat();

  return (
    <div className="p-4">
      <ScrollArea className="flex-1 px-1">
          {/* {sidebarOpen && ( */}
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm group flex items-center justify-between",
                    currentChat?.id === chat.id 
                      ? "bg-sidebar-accent text-sidebar-foreground" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => setCurrentChat(chat.id)}
                >
                  <div className="truncate flex-1">
                    {chat.title || "New Chat"}
                    <div className="text-xs text-gray-500 truncate">
                      {format(new Date(chat.updatedAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="codicon codicon-trash opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white h-6 w-6"
                  >
                  </Button>
                </button>
              ))}
            </div>
          {/*)} */}
        </ScrollArea>
    </div>
  );
};

export default HistoryView;
