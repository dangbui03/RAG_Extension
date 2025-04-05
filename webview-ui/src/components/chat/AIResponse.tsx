import React, { useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ChatMessage } from "@/types";

import toTitleCase from "@/utils/ToTitleCase";

interface ChatMessagesProps {
  chat: ChatMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

const AIResponse: React.FC<ChatMessagesProps> = ({ chat, children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = useCallback(async (text: string) => {
    try {
      setCopied(false);
      setCopied(true);
      await navigator.clipboard.writeText(text).then(() => {
        console.log("Code copied to clipboard!");
      });
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Error copying code:", error);
    }
  }, []);

  const Code: React.FC<React.ComponentPropsWithoutRef<"code">> = ({
    children,
    className,
    ...rest
  }) => {
    const match = className?.match(/language-(\w+)/);

    return match ? (
      <>
        <div className="code-block">
          <div className="px-4 py-2 pb-0 font-sans">
            {toTitleCase(match[1])}
          </div>

          <SyntaxHighlighter
            {...rest}
            PreTag="div"
            language={match[1]}
            style={dracula}
            customStyle={{
              marginBlock: "0",
              padding: "2px",
            }}
            codeTagProps={{
              style: {
                padding: "14px",
                fontWeight: "400",
              },
            }}
          >
            {String(children)}
          </SyntaxHighlighter>
        </div>

        <div className="bg-dark-onSurfaceContainer rounded-t-xs rounded-b-md flex justify-between items-center h-11 font-sans text-sm ps-4 pe-2">
          <p>
            Use Code
            <a className="link ms-2" href="#" target="_blank">
              with caution.
            </a>
          </p>

          <div
            className="rounded-md border-gray-500/50 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-700/50 group"
            onClick={() => handleCopyCode(String(children))}
            title="Copy code"
          >
            {copied ? (
              <div
                className="codicon codicon-check text-sm text-green-500"
                title="Copied"
              />
            ) : (
              <div className="codicon codicon-copy text-sm cursor-pointer group-hover:text-blue-300" />
            )}
          </div>
        </div>
      </>
    ) : (
      <code className={className} {...rest}>
        {children}
      </code>
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
          <Markdown remarkPlugins={[remarkGfm]} components={{ code: Code }}>
            {/* {chat.ai_answer} */}
            {chat.ai_answer}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
