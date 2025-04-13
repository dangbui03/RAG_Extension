import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, ChatMessage, FileModel } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { vscode } from "@/vscode/VsCodeApi";

interface ChatContextType {
  // Chats
  chats: Chat[];
  currentChat: Chat | null;
  sendMessage: (
    content: string,
    contextFiles: FileModel[],
    chatId?: string
  ) => void;
  createNewChat: () => void;
  setCurrentChat: (chatId: string) => void;
  storeChat: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  deleteAllChats: () => void;
  fetchChats: () => void;
  fetchChatById: (chatId: string) => void;

  // Models
  selectedModel: string;
  models: string[];
  fetchModels: () => void;
  selectModel: (model: string) => void;

  // Version and file state
  nextjsVersion: string;
  setNextjsVersion: (version: string) => void;
  file: string[]; // List of file names (relative paths)
  fetchFiles: () => void;
  fetchFileContent: (filePath: string) => void;
  selectedFileContent: string; // Content of the selected file
  setSelectedFileContent: (content: string) => void;
  selectedFileName: string; // Name (or relative path) of the selected file
  setSelectedFileName: (fileName: string) => void;
  setFile: (file: string[]) => void;

  // Chat generation
  isGenerating: boolean;
  generationStartTime: number | null;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Chat-related states
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Model and version states
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [nextjsVersion, setNextjsVersion] = useState<string>("");

  // File-related states
  const [file, setFile] = useState<string[]>([]); // List of file names (relative paths)
  const [selectedFileContent, setSelectedFileContent] = useState<string>(""); // File content for the selected file
  const [selectedFileName, setSelectedFileName] = useState<string>(""); // Selected file name

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );

  // On mount, fetch initial data (models, chats, Next.js version, file list)
  useEffect(() => {
    // Initial data fetch
    // fetchModels();
    fetchChats();
    fetchNextjsVersion();

    if (chats.length > 0) {
      setCurrentChat(chats[0]);
    } else {
      // setCurrentChat(mockChats[0]);
      initializeDefaultChat();
    }

    // Set up message listener
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case "restoreState":
          // Restore your app state from the message
          if (message.state.currentChat) {
            setCurrentChat(message.state.currentChat);
          }
          if (message.state.selectedModel) {
            setSelectedModel(message.state.selectedModel);
          }
          break;
        case "nextJsVersionFetched":
          console.log("Next.js version fetched:", message.version);
          setNextjsVersion(message.version);
          break;
        case "populateModels":
          if (Array.isArray(message.models)) {
            setModels(message.models);
            // Set default model to first in the list if available
            if (message.models.length > 0) {
              setSelectedModel(message.models[0]);
            }
          }
          break;
        case "fileList":
          if (Array.isArray(message.files)) {
            // setFile(message.files);
            const fileNames = message.files.map(
              (file: { name: string }) => file.name
            );
            setFile(fileNames);
          }
          break;
        case "fileContent":
          // Set the selected file's content and name from the response
          console.log("File content fetched:", message.content);
          setSelectedFileContent(message.content);
          setSelectedFileName(message.filePath);
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
          if (message.success && Array.isArray(message.chats)) {
            setChats(message.chats);
          }
          break;
        case "allChatsDeleted":
          if (message.success) {
            setChats([]);
          }
          break;
      }
    };

    // Function to save state to the extension
    const saveStateToExtension = () => {
      const state = {
        currentChat: currentChat,
        selectedModel: selectedModel,
        // ... other state variables you want to persist
      };

      vscode.postMessage({
        command: "saveState",
        state: state,
      });
    };

    // Initial save and message listener setup
    saveStateToExtension();
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  // Save state to extension whenever important state changes
  useEffect(() => {
    const saveStateToExtension = () => {
      const state = {
        currentChat: currentChat,
        selectedModel: selectedModel,
        // ... other state variables you want to persist
      };

      vscode.postMessage({
        command: "saveState",
        state: state,
      });
    };

    saveStateToExtension();
  }, [currentChat, selectedModel]);

  // --- VS Code API calls via vscode.postMessage ---
  // Fetch files from the workspace
  const fetchFiles = () => vscode.postMessage({ command: "getFileList" });
  
  const fetchFileContent = (filePath: string) =>
    vscode.postMessage({ command: "getFileContent", filePath });

  // Fetch models from the extension
  const fetchModels = () => vscode.postMessage({ command: "populateModels" });

  // Set Next.js version in the extension
  const fetchNextjsVersion = () =>
    vscode.postMessage({ command: "readNextJsVersion" });

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

  // Initialize a default chat if no chats exist
  const initializeDefaultChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentChat(newChat);
  };

  // Create a new chat session
  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentChat(newChat);
  };

  /**
   * Send a message to the API. If a file has been selected, its content is automatically
   * added to the contextFiles parameter (as a FileModel object).
   */
  const sendMessage = (content: string, contextFiles: FileModel[] = []) => {
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

    console.log({
      text: content,
      nextJSVersion: nextjsVersion,
      model: selectedModel,
      fileList: contextFiles,
      chatId: updatedChat.id,
    });

    vscode.postMessage({
      command: "ragCall",
      text: content,
      nextJSVersion: nextjsVersion,
      model: selectedModel,
      fileList: contextFiles,
      chatId: updatedChat.id,
    });

    // Listen for the response from the VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      // Check if the response contains an answer
      if (message.command === "ragCallComplete") {
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
        nextjsVersion,
        file,
        fetchFiles,
        setFile,
        selectModel,
        fetchModels,
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
        setNextjsVersion,
        fetchFileContent,
        selectedFileContent,
        setSelectedFileContent,
        selectedFileName,
        setSelectedFileName,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
