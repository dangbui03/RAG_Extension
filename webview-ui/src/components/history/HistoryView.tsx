// import React, { useRef, useEffect } from 'react';
// import { useChat } from '@/context/ChatContext';
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Button } from "@/components/ui/button";
// import { cn } from '@/lib/utils';
// import { format } from "date-fns";

// const NoChatScreen: React.FC = () => {
//   return (
//     <div className='mt-3 text-white text-xl font-light'>
//       <p className='text-sm'>It empty here</p>
//     </div>
//   )
// };
// const HistoryView: React.FC = () => {
//   const { chats, currentChat, setCurrentChat, deleteChat } = useChat();
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [currentChat?.messages]);

//   if (!chats) {
//     return <NoChatScreen />;
//   }

//   return (
//     <ScrollArea className="h-full scrollbar-thin flex-1 px-1">
//       <div className="space-y-1">
//         {chats.map((chat) => (
//           <button
//             key={chat.id}
//             className={cn(
//               "w-full text-left px-3 py-2 rounded text-sm group flex items-center justify-between",
//               currentChat?.id === chat.id 
//                 ? "bg-sidebar-accent text-sidebar-foreground" 
//                 : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
//             )}
//             onClick={() => setCurrentChat(chat.id)}
//           >
//             <div className="truncate flex-1">
//               {chat.title || "New Chat"}
//               <div className="text-xs text-gray-500 truncate">
//                 {format(new Date(chat.updatedAt), "MMM d, h:mm a")}
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 deleteChat(chat.id);
//               }}
//               className="codicon codicon-trash opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white h-6 w-6"
//             />
//           </button>
//         ))}
//         <div ref={bottomRef} />
//       </div>
//     </ScrollArea>
//   );
// };

// export default HistoryView;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const HistoryView: React.FC = () => {
  const { chats, setCurrentChat, deleteChat, clearChatsHistory } = useChat();
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    navigate('/');
  };

  const handleClearHistory = () => {
    const confirmed = confirm('Are you sure you want to clear all chat history? This cannot be undone.');
    if (confirmed) {
      clearChatsHistory();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-white">Chat History</h1>
        {chats.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {chats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="codicon codicon-history text-4xl mb-2"></div>
          <p className="text-center">No chat history found.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="mb-2 bg-[#2d2d2d] rounded-md overflow-hidden">
              <div className="flex justify-between p-3 hover:bg-[#3a3a3a] cursor-pointer" onClick={() => handleChatSelect(chat.id)}>
                <div className="flex-1">
                  <h3 className="font-medium text-white truncate">{chat.title || "Untitled Chat"}</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span className="mr-2">{chat.model}</span>
                    <span>•</span>
                    <span className="ml-2">{formatDate(chat.updatedAt)}</span>
                    <span>•</span>
                    <span className="ml-2">{chat.messages.filter(m => m.role === 'user').length} messages</span>
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
                <div className="px-3 pb-3 text-sm text-gray-300 overflow-hidden max-h-16">
                  <div className="line-clamp-2">
                    <strong>Last message:</strong> {chat.messages[chat.messages.length - 1].content.substring(0, 100)}
                    {chat.messages[chat.messages.length - 1].content.length > 100 ? '...' : ''}
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

export default HistoryView;
