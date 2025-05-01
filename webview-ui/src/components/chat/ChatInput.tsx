import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea"; // Import ShadCN Textarea
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FileModel } from "@/share/types"; // Import your FileModel type

const ChatInput = () => {
  const {
    sendMessage,
    selectedModel,
    file,
    fetchFiles,
    fetchFileContent,
    selectedFileContent,
    selectedFileName,
    setSelectedFileContent,
    setSelectedFileName,
    isGenerating,
  } = useChat();

  const [message, setMessage] = useState("");
  const [contextFile, setContextFile] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to extract file extension from a file name
  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  // When the user clicks "Send Message", construct a FileModel if a file is selected,
  // and then pass it along with the message to the sendMessage API.
  const handleSendMessage = () => {
    if (!selectedModel) {
      alert("⚠️ Please select a model first.");
      return;
    }
    if (!message.trim()) {
      alert("⚠️ Please enter a question.");
      return;
    }

    const contextFiles: FileModel[] = [];
    if (selectedFileName && selectedFileContent) {
      contextFiles.push({
        file_name: selectedFileName,
        file_extension: getFileExtension(selectedFileName),
        file_content: selectedFileContent,
      });
    }

    sendMessage(message, contextFiles);
    setMessage("");
    setContextFile("");
    setSelectedFileName("");
    setSelectedFileContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFetchFiles = () => {
    fetchFiles();
  };

  // Set the context file (only one)
  // When a file is selected, call the VS Code API to fetch its content and update state.
  const addContextFile = (fileName: string) => {
    fetchFileContent(fileName);
    // Save the selected file name (and update contextFile state for display).
    setSelectedFileName(fileName);
    setContextFile(fileName);
  };

  // Remove the selected file from state.
  const removeContextFile = () => {
    setContextFile("");
    setSelectedFileName("");
    setSelectedFileContent("");
  };

  // Handle textarea changes and auto-resize it.
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-chat-darker border-t border-chat-border py-2">
      <div className="max-w-4xl mx-auto">
        {/* Display the selected file (if any) */}
        {contextFile && (
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="bg-gray-800 text-gray-200 text-xs rounded-full px-3 py-1 flex items-center gap-1">
              <span>{contextFile}</span>
              <Button
                variant="ghost"
                size="sm"
                className="codicon codicon-close h-4 w-4 rounded-full hover:bg-gray-700"
                onClick={removeContextFile}
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            "relative w-full rounded-lg border transition-all duration-200 bg-chat-darker border-gray-700"
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Add Context"
                className="codicon codicon-new-file text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-8 w-8 absolute left-2 top-1/2 -translate-y-1/2"
                onClick={handleFetchFiles}
              />
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-80 p-0 bg-chat-darker border border-gray-700"
            >
              <div className="p-2">
                <h3 className="font-medium mb-2">Add Context</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Select a file to provide additional context for your question
                </p>
                <div className="max-h-60 overflow-auto">
                  <div className="space-y-1">
                    {file.map((fileName, index) => (
                      <button
                        key={index}
                        className="flex items-center justify-between w-full p-2 text-xs text-left hover:bg-gray-800 rounded"
                        onClick={() => addContextFile(fileName)}
                      >
                        <span
                          title={fileName}
                          className="whitespace-nowrap overflow-x-auto"
                        >
                          {/* Inline truncation: if fileName is longer than 30 characters, show only the last 30 characters prefixed with "..." */}
                          {fileName.length > 30
                            ? "..." + fileName.slice(-30)
                            : fileName}
                        </span>
                        <span className="text-xs text-gray-500">Select</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Textarea
            ref={textareaRef}
            value={message}
            title="Chat Input"
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="text-xs w-full resize-none py-3 pl-12 pr-12 min-h-[50px] max-h-[200px] scrollbar-thin focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent border-0 bg-transparent"
          />
          <Button
            variant="ghost"
            size="icon"
            title="Send Message"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={cn(
              "text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-8 w-8 absolute right-2 top-1/2 -translate-y-1/2 transition-opacity",
              (!message.trim() || isGenerating) &&
                "opacity-50 cursor-not-allowed",
              (isGenerating)
                ? "codicon codicon-stop-circle"
                : "codicon codicon-send"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
