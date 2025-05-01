import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Chat,
  ChatMessage,
  FileModel,
  NextjsVersionList,
  NextjsVersionItem,
  AdditionalOptions,
} from "@/share/types";
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
  renameChat: (chatId: string, newTitle: string) => void;

  // Models
  selectedModel: string;
  models: string[];
  fetchModels: () => void;
  selectModel: (model: string) => void;

  // Advaced settings
  // advancedOptions: AdditionalOptions;
  // setAdvancedOptions: (options: AdditionalOptions) => void;

  // Version
  userNextjsVersion: string;
  nextjsVersion: string;
  setNextjsVersion: (version: string) => void;
  fetchNextjsVersionList: () => void;
  retrieveNextJsVersion: (version: string) => void;
  deleteNextJsVersion: (version: string) => void;
  repairNextJsVersion: (version: string) => void;
  availableVersions: NextjsVersionList;
  downloadedVersions: NextjsVersionList;

  // File-related states
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

  // Model
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);

  // Next.js version states
  const [nextjsVersion, setNextjsVersion] = useState<string>("");
  const [userNextjsVersion, setUserNextjsVersion] = useState<string>("");
  const [availableVersions, setAvailableVersions] = useState<NextjsVersionList>(
    []
  );
  const [downloadedVersions, setDownloadedVersions] =
    useState<NextjsVersionList>([]);

  // File-related states
  const [file, setFile] = useState<string[]>([]); // List of file names (relative paths)
  const [selectedFileContent, setSelectedFileContent] = useState<string>(""); // File content for the selected file
  const [selectedFileName, setSelectedFileName] = useState<string>(""); // Selected file name

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );

  // Effect for setting up message handlers and initial fetching
  useEffect(() => {
    // Initial data fetch
    fetchChats();
    fetchNextjsVersion();

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
          setUserNextjsVersion(message.version);
          break;
        case "nextJsVersionList":
          {
            const downloadedVersions = message.versionList.filter(
              (v: NextjsVersionItem) => v.downloaded === true
            );
            const availableVersions = message.versionList.filter(
              (v: NextjsVersionItem) => v.downloaded === false
            );
            setDownloadedVersions(downloadedVersions);
            setAvailableVersions(availableVersions);
          }
          break;
        case "retrievedNextJsVersion":
          if (message.version_name) {
            fetchNextjsVersionList();
          }
          break;
        case "deletedNextJsVersion":
          if (message.version_name) {
            fetchNextjsVersionList();
          }
          break;
        case "repairedNextJsVersion":
          if (message.version) {
            fetchNextjsVersionList();
          }
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
        case "chatRenamed":
          if (message.success) {
            // Extension trả về mảng chats mới ⇒ đồng bộ lại local-state
            if (Array.isArray(message.chats)) {
              setChats(message.chats);
            }
            if (currentChat?.id === message.chatId) {
              setCurrentChat((prev) =>
                prev ? { ...prev, title: message.title } : prev
              );
            }
          }
          break;
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  // Effect to handle chat initialization
  useEffect(() => {
    if (chats.length > 0) {
      setCurrentChat(chats[0]);
    } else {
      initializeDefaultChat();
    }
  }, [chats]);

  // Effect to save state to extension
  useEffect(() => {
    const saveStateToExtension = () => {
      const state = {
        currentChat,
        selectedModel,
        // ... other state variables you want to persist
      };

      vscode.postMessage({
        command: "saveState",
        state,
      });
    };

    saveStateToExtension();
  }, [currentChat, selectedModel]);

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

  // Fetch file content by file path
  const fetchFileContent = (filePath: string) =>
    vscode.postMessage({ command: "getFileContent", filePath });

  // Fetch models from the extension
  const fetchModels = () => vscode.postMessage({ command: "populateModels" });

  // Set Next.js version in the extension
  const fetchNextjsVersion = () =>
    vscode.postMessage({ command: "readNextJsVersion" });

  const fetchNextjsVersionList = () =>
    vscode.postMessage({ command: "getNextJsVersionList" });

  const retrieveNextJsVersion = (version: string) =>
    vscode.postMessage({ command: "retrieveNextJsVersion", version });

  const deleteNextJsVersion = (version: string) =>
    vscode.postMessage({ command: "deleteNextJsVersion", version });

  const repairNextJsVersion = (version: string) =>
    vscode.postMessage({ command: "repairNextJsVersion", version });

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

  const renameChat = (chatId: string, newTitle: string) => {
    try {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
        )
      );
      if (currentChat?.id === chatId) {
        setCurrentChat({ ...currentChat, title: newTitle.trim() });
      }

      vscode.postMessage({
        command: "renameChatTitle",
        chatId,
        newTitle: newTitle.trim(),
      });
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
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
    const savedOptionsString = localStorage.getItem("advancedSettings");
    const savedOptions: AdditionalOptions = savedOptionsString
      ? JSON.parse(savedOptionsString)
      : { retriever_options: {}, generator_options: {} };
    console.log("Saved options:", savedOptions);
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
      files: contextFiles.map((file) => file.file_name),
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

    console.log("input", {
      text: content,
      nextJSVersion: nextjsVersion,
      model: selectedModel,
      fileList: contextFiles,
      chatId: updatedChat.id,
    });

    const savedOptionsString = localStorage.getItem("advancedSettings");
    const savedOptions: AdditionalOptions = savedOptionsString
      ? JSON.parse(savedOptionsString)
      : { retriever_options: {}, generator_options: {} };

    vscode.postMessage({
      command: "ragCall",
      text: content,
      nextJSVersion: nextjsVersion,
      model: selectedModel,
      fileList: contextFiles,
      additionalOptions: savedOptions,
      chatId: updatedChat.id,
    });
    console.log(isGenerating, "isGenerating1");

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
        console.log(isGenerating, "isGenerating2");
        setIsGenerating(false);
        setGenerationStartTime(null);
      }
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

        // Next.js version
        nextjsVersion,
        userNextjsVersion,
        setNextjsVersion,
        fetchNextjsVersionList,
        retrieveNextJsVersion,
        deleteNextJsVersion,
        repairNextJsVersion,
        availableVersions,
        downloadedVersions,

        // File-related states
        file,
        fetchFiles,
        setFile,

        // Model
        models,
        selectedModel,
        selectModel,
        fetchModels,

        // chat generation
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
        renameChat,

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
