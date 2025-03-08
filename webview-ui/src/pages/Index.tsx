// import { useEffect } from "react";
import { ChatProvider } from "@/context/ChatContext";
import Header from '../components/Header';
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from '@/components/chat/ChatInput';
// import { useEffect } from "react";
// import { useToast } from "@/hooks/use-toast";

const Index = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* <Sidebar /> */}
        <Header />
        <div className="flex-1 relative overflow-hidden">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;