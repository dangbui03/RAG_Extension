import { useRef, useEffect } from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import { useChat } from "@/context/ChatContext";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  console.log("currentChat", currentChat);
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
  );
}

export default ChatWindow;
