import { useRef, useEffect } from 'react';
// import { useImmer } from 'use-immer';
import ChatMessages from '@/components/chat/ChatMessages';
import { useChat } from "@/context/ChatContext";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";

// Type definition for a message
// type Message = {
//   role: 'user' | 'assistant';
//   content: string;
//   sources?: string[];
//   loading?: boolean;
//   error?: boolean;
// };

const WelcomeScreen: React.FC = () => {
  return (
    <div className='mt-3 text-white text-xl font-light'>
      <p className='text-xl'>ASK SOMETHINGS</p>
      <p className='text-base'>Free to ask about Next.js frameworks, we are supporting the framework from version 13.0.1 to 15.</p>
    </div>
  )
};

const ChatWindow: React.FC = () =>  {
  const { currentChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);
  
  if (!currentChat || currentChat.messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <ScrollArea
      className= 'h-full scrollbar-thin'
      >
        <div className="min-h-full pb-32">
          {currentChat.messages.map((message, index) => (
            <ChatMessages 
              key={message.id} 
              message={message}
              isLast={index === currentChat.messages.length - 1}
            />
          ))}
          <div ref={bottomRef} />
        </div>
    </ScrollArea>
    // <div className='relative h-screen grow flex flex-col gap-6'>
    //   {messages.length === 0 && (
    //     <div className='mt-3 text-white text-xl font-light'>
    //       <p className='text-xl'>ASK SOMETHINGS</p>
    //       <p className='text-base'>Free to ask about Next.js frameworks, we are supporting the framework from version 13.0.1 to 15.</p>
    //     </div>
    //   )}
    //   <div className='grow space-y-3'>
    //     <ChatMessages
    //       messages={messages}
    //       isLoading={isLoading}
    //     />
    //   </div>
    //   <div className='bottom-1 left-0'>
    //     <ChatInput
    //       newMessage={newMessage}
    //       isLoading={isLoading}
    //       setNewMessage={setNewMessage}
    //       submitNewMessage={submitNewMessage}
    //     />
    //   </div>
    // </div>
  );
}

export default ChatWindow;
