import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea"; // Import ShadCN Textarea
import { Button } from '@/components/ui/button';
import { useChat } from "@/context/ChatContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";

const ChatInput = () => {
  const { sendMessage } = useChat();
  const [message, setMessage] = useState("");
  const [contextFiles, setContextFiles] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      setContextFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } else {
      alert('⚠️ Please enter a question.');
      return;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const addContextFile = (fileName: string) => {
    setContextFiles([...contextFiles, fileName]);
  };
  
  const removeContextFile = (fileName: string) => {
    setContextFiles(contextFiles.filter(file => file !== fileName));
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-chat-darker border-t border-chat-border py-2">
      <div className="max-w-4xl mx-auto">
        {contextFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {contextFiles.map((file) => (
              <div 
                key={file}
                className="bg-gray-800 text-gray-200 text-xs rounded-full px-3 py-1 flex items-center gap-1"
              >
                <span>{file}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="codicon codicon-close h-4 w-4 rounded-full hover:bg-gray-700"
                  onClick={() => removeContextFile(file)}
                >
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className={cn(
          "flex items-end gap-2 rounded-lg border transition-all duration-200 bg-chat-darker",
          isInputFocused ? "border-blue-500" : "border-gray-700"
        )}>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="codicon codicon-add text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 ml-1 mb-1"
              >
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80 p-0 bg-chat-darker border border-gray-700">
              <div className="p-4">
                <h3 className="font-medium mb-2">Add Context</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Select files to provide additional context for your question
                </p>
                <div className="space-y-2">
                  {["package.json", "README.md", "src/App.tsx", "src/main.tsx"].map((file) => (
                    <button
                      key={file}
                      className="flex items-center justify-between w-full p-2 text-sm text-left hover:bg-gray-800 rounded"
                      onClick={() => {
                        addContextFile(file);
                      }}
                    >
                      <span>{file}</span>
                      <span className="text-xs text-gray-500">Add</span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type your message..."
            className="flex-1 focus-visible:ring-transparent resize-none py-3 px-3 min-h-[50px] max-h-[200px] scrollbar-thin"
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={cn(
              "codicon codicon-send text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 mr-1 mb-1 transition-opacity",
              !message.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
