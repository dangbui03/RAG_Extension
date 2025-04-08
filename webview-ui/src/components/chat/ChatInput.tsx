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
import { FileModel } from "@/types"; // Import your FileModel type

const ChatInput = () => {
  const { sendMessage, selectedModel, file, fetchFileContent, selectedFileContent, selectedFileName, setSelectedFileContent, setSelectedFileName } = useChat();
  const [message, setMessage] = useState("");
  // const [contextFiles, setContextFiles] = useState<string[]>([]);
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
    if (message.trim()) {
      const contextFiles: FileModel[] = [];
      // If a file has been picked up and its content is available, create a FileModel.
      if (selectedFileName && selectedFileContent) {
        const fileExtension = getFileExtension(selectedFileName);
        const fileModel: FileModel = {
          fileName: selectedFileName,
          fileExtension,
          fileContent: selectedFileContent,
        };
        contextFiles.push(fileModel);
      }
      // Call sendMessage with the message and context file(s)
      sendMessage(message, contextFiles);
      // Clear the message and reset file selection states
      setMessage("");
      setContextFile("");
      setSelectedFileName("");
      setSelectedFileContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } else {
      alert("⚠️ Please enter a question.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // const addContextFile = (fileName: string) => {
  //   setContextFiles([...contextFiles, fileName]);
  // };

  // const removeContextFile = (fileName: string) => {
  //   setContextFiles(contextFiles.filter(file => file !== fileName));
  // };

  // Set the context file (only one)
  // When a file is selected, call the VS Code API to fetch its content and update state.
  const addContextFile = (fileName: string) => {
    // Request the file content from the extension.
    // The response from the extension should update the context via the message listener.
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
                size="icon"
                className="codicon codicon-close h-4 w-4 rounded-full hover:bg-gray-700"
                onClick={removeContextFile}
              />
            </div>
          </div>
        )}

        <div
          title="Add Context"
          className={cn(
            "relative w-full rounded-lg border transition-all duration-200 bg-chat-darker border-gray-700"
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="codicon codicon-add text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 absolute left-2 top-1/2 -translate-y-1/2"
              />
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-80 p-0 bg-chat-darker border border-gray-700"
            >
              <div className="p-4">
                <h3 className="font-medium mb-2">Add Context</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Select a file to provide additional context for your question
                </p>
                <div className="space-y-2">
                  {file.map((fileName, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-between w-full p-2 text-sm text-left hover:bg-gray-800 rounded"
                      onClick={() => addContextFile(fileName)}
                    >
                      <span>{fileName}</span>
                      <span className="text-xs text-gray-500">Select</span>
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
            placeholder="Type your message here..."
            className="w-full resize-none py-3 pl-12 pr-12 min-h-[50px] max-h-[200px] scrollbar-thin focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent border-0 bg-transparent"
          />
          <Button
            variant="ghost"
            size="icon"
            title="Send Message"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={cn(
              "codicon codicon-send text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 absolute right-2 top-1/2 -translate-y-1/2 transition-opacity",
              !message.trim() && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      </div>
    </div>
  );
};
//   return (
//     <div className="absolute bottom-0 left-0 right-0 bg-chat-darker border-t border-chat-border py-2">
//       <div className="max-w-4xl mx-auto">
//         {/* {contextFiles.length > 0 && (
//           <div className="flex flex-wrap gap-2 mb-2">
//             {contextFiles.map((file) => (
//               <div 
//                 key={file}
//                 className="bg-gray-800 text-gray-200 text-xs rounded-full px-3 py-1 flex items-center gap-1"
//               >
//                 <span>{file}</span>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="codicon codicon-close h-4 w-4 rounded-full hover:bg-gray-700"
//                   onClick={() => removeContextFile(file)}
//                 >
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//          */}

//         {contextFile && (
//           <div className="flex flex-wrap gap-2 mb-2">
//             <div className="bg-gray-800 text-gray-200 text-xs rounded-full px-3 py-1 flex items-center gap-1">
//               <span>{contextFile}</span>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="codicon codicon-close h-4 w-4 rounded-full hover:bg-gray-700"
//                 onClick={removeContextFile}
//               />
//             </div>
//           </div>
//         )}
//         <div
//           title="Add Context"
//           className={cn(
//             "relative w-full rounded-lg border transition-all duration-200 bg-chat-darker border-gray-700"
//             // isInputFocused ? "border-blue-500" : "border-gray-700"
//           )}
//         >
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="codicon codicon-add text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 absolute left-2 top-1/2 -translate-y-1/2" //*ml-1 mb-1
//               ></Button>
//             </PopoverTrigger>
//             <PopoverContent
//               side="top"
//               align="start"
//               className="w-80 p-0 bg-chat-darker border border-gray-700"
//             >
//               <div className="p-4">
//                 <h3 className="font-medium mb-2">Add Context</h3>
//                 <p className="text-sm text-gray-400 mb-4">
//                   Select files to provide additional context for your question
//                 </p>
//                 <div className="space-y-2">
//                   {/* {["package.json", "README.md", "src/App.tsx", "src/main.tsx"].map((file) => ( */}
//                   {file.map((file) => (
//                     <button
//                       key={file}
//                       className="flex items-center justify-between w-full p-2 text-sm text-left hover:bg-gray-800 rounded"
//                       onClick={() => {
//                         addContextFile(file);
//                       }}
//                     >
//                       <span>{file}</span>
//                       <span className="text-xs text-gray-500">Add</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </PopoverContent>
//           </Popover>

//           <Textarea
//             ref={textareaRef}
//             value={message}
//             onChange={handleTextareaChange}
//             onKeyDown={handleKeyDown}
//             // onFocus={() => setIsInputFocused(true)}
//             // onBlur={() => setIsInputFocused(false)}
//             placeholder="Type your message here..."
//             className="w-full resize-none py-3 pl-12 pr-12 min-h-[50px] max-h-[200px] scrollbar-thin focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent border-0 bg-transparent"
//           />
//           <Button
//             variant="ghost"
//             size="icon"
//             title="Send Message"
//             onClick={handleSendMessage}
//             disabled={!message.trim()}
//             className={cn(
//               "codicon codicon-send text-gray-400 hover:text-white hover:bg-gray-800 rounded-md h-9 w-9 absolute right-2 top-1/2 -translate-y-1/2 transition-opacity",
//               !message.trim() && "opacity-50 cursor-not-allowed"
//             )}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

export default ChatInput;
