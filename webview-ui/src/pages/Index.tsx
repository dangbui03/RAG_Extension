// import { useEffect } from "react";
import Header from "../components/Header";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";

const Index = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 relative overflow-hidden m-1">
        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  );
};

export default Index;
