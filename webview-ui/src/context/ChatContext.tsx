import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, ChatMessage } from "@/types"; //, AIModel
import { v4 as uuidv4 } from "uuid";
import { vscode } from "@/vscode/VsCodeApi";
// import { mockChats } from "@/types";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  selectedModel: string;
  models: string[];
  isGenerating: boolean;
  generationStartTime: number | null;
  selectModel: (model: string) => void;
  sendMessage: (content: string, chatId?: string) => void; //, contextFiles?: string[]
  createNewChat: () => void;
  setCurrentChat: (chatId: string) => void;
  storeChat: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  deleteAllChats: () => void;
  fetchChats: () => void;
  fetchChatById: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );

  // Initialize and fetch history when component mounts
  useEffect(() => {
    // Initial data fetch
    fetchModels();
    fetchChats();

    if (chats.length > 0) {
      setCurrentChat(chats[0]);
    } else {
      initializeDefaultChat();
    }

    // Set up message listener
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        // case "update":
        //   console.log("update", message);
        //   if (currentChat) {
        //     const lastMessage =
        //       currentChat.messages[currentChat.messages.length - 1];
        //     const updatedMessages = [
        //       ...currentChat.messages.slice(0, -1),
        //       {
        //         ...lastMessage,
        //         ai_answer: message.content,
        //         status: "sent" as const,
        //       },
        //     ];
        //     const updatedChat = {
        //       ...currentChat,
        //       messages: updatedMessages,
        //       updatedAt: new Date(),
        //     };
        //     setCurrentChat(updatedChat);
        //     storeChat(updatedChat);
        //   }
        //   break;
        case "populateModels":
          if (Array.isArray(message.models)) {
            setModels(message.models);
            // Set default model to first in the list if available
            if (message.models.length > 0) {
              setSelectedModel(message.models[0]);
            }
          }
          break;
        case "chatsFetched":
          setChats(message.chats);
          break;
        case "chatFetched":
          setCurrentChat(message.chat);
          break;
        case "chatStored":
          fetchChats();
          break;
        case "chatDeleted":
          // We already updated the local state, but we can sync with server state if needed
          if (message.success && Array.isArray(message.chats)) {
            setChats(message.chats);
          }
          break;
        case "allChatsDeleted":
          // We already updated the local state, but we can sync with server state if needed
          if (message.success) {
            setChats([]);
          }
          break;
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  // Fetch models from the extension
  const fetchModels = () => vscode.postMessage({ command: "populateModels" });

  // Fetch all chats from the extension
  const fetchChats = () => vscode.postMessage({ command: "fetchChats" });

  // Fetch chat by id
  const fetchChatById = (chatId: string) =>
    vscode.postMessage({ command: "fetchChatById", chatId });

  // Store chat in the extension
  const storeChat = (chat: Chat) =>
    vscode.postMessage({ command: "storeChat", chat });

  // Delete chat by id
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);

    // If we're deleting the current chat, create a new one or select the first available
    if (currentChat && currentChat.id === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChat(updatedChats[0]);
      } else {
        createNewChat();
      }
    }
    vscode.postMessage({ command: "deleteChat", chatId });
  };

  // Delete all chat
  const deleteAllChats = () => {
    setChats([]);
    createNewChat();
    vscode.postMessage({ command: "deleteAllChats" });
  };

  const initializeDefaultChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // setChats([newChat]);
    setCurrentChat(newChat);
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentChat(newChat);

    // // Store the new chat
    // vscode.postMessage({
    //   command: 'storeChat',
    //   chat: newChat
    // });
  };

  const sendMessage = (content: string) => {
    // console.log(selectedModel, content);

    if (!currentChat) return;
    if (!selectedModel) {
      alert("Please select a model first.");
      return;
    }

    // Create the user message and assistant message placeholders
    const newMessage: ChatMessage = {
      id: uuidv4(),
      user_prompt: content,
      model: selectedModel,
      timestamp: new Date(),
      status: "sent",
    };

    setIsGenerating(true);
    setGenerationStartTime(Date.now());

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      updatedAt: new Date(),
    };

    const finalChat = {
      ...updatedChat,
      title:
        updatedChat.messages.length === 1
          ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
          : updatedChat.title,
    };

    setCurrentChat(finalChat);
    // setChats(prevChats =>
    //   prevChats.map(chat => chat.id === finalChat.id ? finalChat : chat)
    // );
    if (currentChat.messages.length === 0) {
      setChats((prevChats) => [
        finalChat,
        ...prevChats.filter((chat) => chat.id !== finalChat.id),
      ]);
    } else {
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === finalChat.id ? finalChat : chat))
      );
    }

    // storeChat(updatedChat);
    vscode.postMessage({
      command: "askQuestion",
      text: content,
      model: selectedModel,
      chatId: updatedChat.id,
    });

    // Listen for the response from the VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;

      // Check if the response contains an answer
      if (message.command === "update") {
        const responseContent = message.content || "No response received.";

        const updatedMessage: ChatMessage = {
          ...newMessage,
          ai_answer: responseContent,
          status: "sent",
        };

        const completedChat = {
          ...finalChat,
          messages: finalChat.messages.map((msg) =>
            msg.id === newMessage.id ? updatedMessage : msg
          ),
        };

        setCurrentChat(completedChat);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === completedChat.id ? completedChat : chat
          )
        );
        storeChat(completedChat);
      }
      setIsGenerating(false);
      setGenerationStartTime(null);
    });
  };

  const selectModel = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        selectedModel,
        models,
        selectModel,
        isGenerating,
        generationStartTime,
        sendMessage,
        createNewChat,
        fetchChats,
        fetchChatById,
        storeChat,
        deleteChat,
        deleteAllChats,
        setCurrentChat: fetchChatById,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
