import { useRef, useEffect } from "react";
import ChatMessages from "@/components/chat/ChatMessages";
import { useChat } from "@/context/ChatContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResponseLoading from "@/components/chat/ResponseLoading";

const WelcomeScreen: React.FC = () => {
  const { userNextjsVersion } = useChat();

  const formattedVersion = userNextjsVersion?.startsWith('v')
    ? `version ${userNextjsVersion.slice(1)}`
    : `version ${userNextjsVersion}`;

  return (
    <div className="mt-3 text-white text-xl font-light">
      <p className="text-sm">We has dectected Nextjs version you are using: {formattedVersion}</p>
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const { currentChat, isGenerating } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages, isGenerating]);

  if (!currentChat || currentChat.messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <ScrollArea className="h-full scrollbar-thin">
      <div className="min-h-full pb-32 flex flex-col items-center">
        {currentChat.messages.map((message, index) => (
          <ChatMessages
            key={message.id}
            message={message}
            isLast={index === currentChat.messages.length - 1}
          />
        ))}
        {isGenerating && (
          <div className="mt-4 flex justify-center">
            <ResponseLoading />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatWindow;
