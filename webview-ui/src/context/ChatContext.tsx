import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, ChatMessage } from "@/types"; //, AIModel 
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
  fetchChatsHistory: () => void;
  clearChatsHistory: () => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  // const [qaHistory, setQAHistory] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize and fetch history when component mounts
  useEffect(() => {
    console.log(isLoading);
    fetchChatsHistory();
    
    // Set up message listener
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "chatsHistory") {
        setChats(message.history || []);
        if (message.history && message.history.length > 0) {
          setCurrentChat(message.history[0]);
        }
        setIsLoading(false);
      } else if (message.command === "update") {
        updateCurrentChatWithResponse(message.content);
      } else if (message.command === "chatStored") {
        // Handle confirmation of chat storage if needed
      }
    };

    window.addEventListener("message", messageHandler);
    
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  const fetchChatsHistory = () => {
    setIsLoading(true);
    vscode.postMessage({
      command: "getChatsHistory"
    });
  };

  const clearChatsHistory = () => {
    setIsLoading(true);
    vscode.postMessage({
      command: "clearChatsHistory"
    });
  };

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

    // Helper function to update current chat with response
    const updateCurrentChatWithResponse = (content: string) => {
      if (!currentChat) return;
      
      // Find the last assistant message that's in 'sending' status
      const messages = [...currentChat.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant' && messages[i].status === 'sending') {
          // Update this message with the response
          messages[i] = {
            ...messages[i],
            content: content,
            status: 'sent'
          };
          break;
        }
      }
      
      const updatedChat: Chat = {
        ...currentChat,
        messages,
        updatedAt: new Date()
      };
      
      // Update title if this is the first message
      if (currentChat.messages.length <= 2) {
        const firstUserMessage = currentChat.messages.find(m => m.role === 'user');
        if (firstUserMessage) {
          updatedChat.title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
        }
      }
      
      setCurrentChat(updatedChat);
      setChats(prevChats =>
        prevChats.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
      );
      
      // Store updated chat
      vscode.postMessage({
        command: 'storeChat',
        chat: updatedChat
      });
    };

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

    // Store the updated chat before getting response
    vscode.postMessage({
      command: 'storeChat',
      chat: updatedChat
    });

    // Post the question to the VS Code extension
    vscode.postMessage({
      command: 'askQuestion',
      text: content,
      model: selectedModel,
    });
  
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
    console.log(chats);
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
        fetchChatsHistory,
        clearChatsHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
