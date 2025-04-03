import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { hopscotch } from "react-syntax-highlighter/dist/esm/styles/prism";

import { ChatMessage } from "@/types";

interface ChatMessagesProps {
  chat: ChatMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

const AIResponse: React.FC<ChatMessagesProps> = ({ chat, children }) => {
  const code = ({ children, className, ...rest }: { children: React.ReactNode, className?: string, [key: string]: unknown }) => {
    const match = className?.match(/language-(\w+)/);

    return match ? (
      <>
        <div className="code-block">
          <div className="">{match[0]}</div>

          <SyntaxHighlighter
            { ...rest }
            pretag="div"
            language={match[1]}
            style={hopscotch}
            customStyle={{
              marginBlock: "0",
              padding: "2px",
            }}
            codeTagProps={{
              style: {
                padding: "14px",
                fontWeight: "400",
              }
            }}
          >
            {children}
          </SyntaxHighlighter>
        </div>

        <div className="">
            <p>
              <a className="link" href="" target="_blank">

              </a>
            </p>
        </div>
      </>
    ) : (
      <code className={className}>{children}</code>
    );
  };
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-gray-700">
        A
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-sm text-gray-300">Assistant</h3>
          <span className="text-xs text-gray-500">
            {format(new Date(chat.timestamp), "h:mm a")}
          </span>
        </div>

        {children}

        <div className="markdown-content">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{ code }}
          >
            {chat.ai_answer}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
