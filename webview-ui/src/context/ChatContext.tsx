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

  const sendMessage = (content: string) => {
    console.log(selectedModel, content);
  
    if (!currentChat) return;
  
    if (!selectedModel) {
      alert('Please select a model first.');
      return;
    }
  
    // Post the question to the VS Code extension
    vscode.postMessage({
      command: 'askQuestion',
      text: content,
      model: selectedModel,
    });
  
    // Create the user message and assistant message placeholders
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
  
    // Update the chat state with the new user and assistant messages
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage, assistantMessage],
      updatedAt: new Date()
    };
  
    setCurrentChat(updatedChat);
    setChats(prevChats =>
      prevChats.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
    );
  
    // Listen for the response from the VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;
  
      // Check if the response contains an answer
      if (message.command === "update") {
        const responseContent = message.content || "No response received.";
  
        // Update the assistant's message with the actual response
        const completedMessage: ChatMessage = {
          ...assistantMessage,
          content: responseContent,
          status: "sent"
        };
  
        // Finalize the chat with the updated assistant's message
        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages.slice(0, -1), completedMessage],
          title: updatedChat.messages.length === 0 ? content.slice(0, 30) + "..." : updatedChat.title
        };
  
        setCurrentChat(finalChat);
        setChats(prevChats =>
          prevChats.map(chat => chat.id === finalChat.id ? finalChat : chat)
        );
      }
    });
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
