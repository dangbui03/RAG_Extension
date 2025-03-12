import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, ChatMessage} from "@/types"; //, AIModel 
import { v4 as uuidv4 } from "uuid";
import { vscode } from "@/vscode/VsCodeApi";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  selectedModel: string;
  isModelSelectOpen: boolean;
  setIsModelSelectOpen: (isOpen: boolean) => void;
  selectModel: (model: string) => void;
  createNewChat: () => void;
  sendMessage: (content: string) => void; //, contextFiles?: string[]
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [chatContent, setChatContent] = useState<string>('');

  // Listen for messages from the VS Code extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === 'update' || message.type === 'updateDone') {
        // The extension sent an updated AI response in Markdown
        const rawMarkdown = message.content || 'No response received.';
        setChatContent(rawMarkdown);
      } 
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (chats.length === 0 && selectedModel) {
      const newChat: Chat = {
        id: uuidv4(),
        title: "New Chat",
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setChats([newChat]);
      setCurrentChat(newChat);
    }
  }, [selectedModel, chats.length]);

  const selectModel = (model: string) => {
    setSelectedModel(model);
    setIsModelSelectOpen(false);
  };

  const createNewChat = () => {
    if (!selectedModel) return;
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
  };

  const setCurrentChatById = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);

    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(updatedChats[0] || null);
    }
  };

  const sendMessage = (content: string) => { //, contextFiles: string[] = []) => {
    if (!currentChat || !selectedModel) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sent"
    };

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "sending"
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage, assistantMessage],
      updatedAt: new Date()
    };

    setCurrentChat(updatedChat);
    setChats(prevChats =>
      prevChats.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
    );

    vscode.postMessage({
      command: 'askQuestion',
      text: content,
      model: selectedModel,
    });

    setTimeout(() => {
      const responseContent = chatContent;//`I'm responding to: "${content}".\n\nThis is a simulated response from ${selectedModel}. In a real implementation, this would call the appropriate API.`;

      const completedMessage: ChatMessage = {
        ...assistantMessage,
        content: responseContent,
        status: "sent"
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages.slice(0, -1), completedMessage],
        title: updatedChat.messages.length === 0 ? content.slice(0, 30) + "..." : updatedChat.title
      };

      setCurrentChat(finalChat);
      setChats(prevChats =>
        prevChats.map(chat => chat.id === finalChat.id ? finalChat : chat)
      );

      setChatContent('');
    }, 1500);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        selectedModel,
        isModelSelectOpen,
        setIsModelSelectOpen,
        selectModel,
        createNewChat,
        sendMessage,
        setCurrentChat: setCurrentChatById,
        deleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
