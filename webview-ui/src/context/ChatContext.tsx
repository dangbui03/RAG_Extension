import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, ChatMessage, AIModel } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { vscode } from '../vscode/VsCodeApi';
// import { useToast } from "@/hooks/use-toast";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  selectedModel: AIModel;
  isModelSelectOpen: boolean;
  setIsModelSelectOpen: (isOpen: boolean) => void;
  selectModel: (model: AIModel) => void;
  createNewChat: () => void;
  sendMessage: (content: string, contextFiles?: string[]) => void;
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  availableModels: AIModel[];  // Add availableModels to the context
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>({} as AIModel);
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]); // State to store available models
//   const { toast } = useToast();

  // Fetch available models from the API when the component mounts
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'populateModels' && Array.isArray(message.models)) {
        const models: AIModel[] = message.models;
        setAvailableModels(models);
        if (models.length > 0) {
          setSelectedModel(models[0]); // Default to the first model
        }
      }
    };

    // Request available models from the extension or backend
    vscode.postMessage({ command: 'populateModels' });

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initialize with a default chat
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

  const selectModel = (model: AIModel) => {
    setSelectedModel(model);
    // toast({
    //   title: "Model Updated",
    //   description: `Now using ${model.name}`,
    //   duration: 3000,
    // });
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

    // toast({
    //   title: "Chat Deleted",
    //   description: "The chat has been removed",
    //   duration: 3000,
    // });
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

    setTimeout(() => {
      const responseContent = `I'm responding to: "${content}".\n\nThis is a simulated response from ${selectedModel.name} by ${selectedModel.provider}. In a real implementation, this would call the appropriate API.`;

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
        availableModels // Add availableModels to the context
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
