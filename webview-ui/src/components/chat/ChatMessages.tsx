import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChatMessage } from "@/types";

interface ChatMessagesProps {
  message: ChatMessage;
  isLast: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ message, isLast }) => {
  // Determine if this is a user message or AI message based on available properties
  // const isUserMessage = !!message.user_prompt;
  // const content = isUserMessage ? message.user_prompt : message.ai_answer;

  // return (
  //   <div
  //     className={cn(
  //       "px-6 py-5 transition-all duration-300 animate-slide-in",
  //       isUserMessage ? "bg-transparent" : "bg-gray-900/30",
  //       isLast && message.status === "sending" && "animate-pulse"
  //     )}
  //   >
  //     <div className="max-w-4xl mx-auto">
  //       <div className="flex items-start gap-4">
  //         <div
  //           className={cn(
  //             "w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1",
  //             isUserMessage ? "bg-blue-600" : "bg-gray-700"
  //           )}
  //         >
  //           {isUserMessage ? "U" : "A"}
  //         </div>

  //         <div className="flex-1 overflow-hidden">
  //           <div className="flex justify-between items-center mb-1">
  //             <h3 className="font-medium text-sm text-gray-300">
  //               {isUserMessage ? "You" : "Assistant"}
  //             </h3>
  //             <span className="text-xs text-gray-500">
  //               {format(new Date(message.timestamp), "h:mm a")}
  //             </span>
  //           </div>

  //           <div className="prose prose-invert max-w-none text-sm">
  //             {message.status === "sending" ? (
  //               <div className="flex space-x-1 items-center">
  //                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
  //                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-100"></div>
  //                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-200"></div>
  //               </div>
  //             ) : (
  //               <ReactMarkdown>{content || ""}</ReactMarkdown>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="mb-6">
      {/* User Message */}
      <div className="px-6 py-5 transition-all duration-300 animate-slide-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-blue-600">
              U
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm text-gray-300">You</h3>
                <span className="text-xs text-gray-500">
                  {format(new Date(message.timestamp), "h:mm a")}
                </span>
              </div>
              
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{message.user_prompt}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Message */}
      {(message.status === "sending" || message.ai_answer) && (
        <div className={cn(
          "px-6 py-5 transition-all duration-300 animate-slide-in bg-gray-900/30",
          isLast && message.status === "sending" && "animate-pulse"
        )}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-gray-700">
                A
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-sm text-gray-300">Assistant</h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), "h:mm a")}
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none text-sm">
                  {message.status === "sending" ? (
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-100"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse animation-delay-200"></div>
                    </div>
                  ) : (
                    <ReactMarkdown>{message.ai_answer}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
