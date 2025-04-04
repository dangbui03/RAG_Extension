import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";


import { ChatMessage } from "@/types";

interface ChatMessagesProps {
  chat: ChatMessage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

const sampleChat = {
  ai_answer: `
Hello! Here's some code:

\`\`\`javascript
function greet(name) {
return "Hello, " + name + "!";
}
console.log(greet("World"));
\`\`\`

And some text.
  `,
  timestamp: "2025-04-02T14:30:00Z",
};

const AIResponse: React.FC<ChatMessagesProps> = ({ chat, children }) => {
  const Code: React.FC<React.ComponentPropsWithoutRef<"code">> = ({ children, className, ...rest }) => {
    const match = className?.match(/language-(\w+)/);
  
    return match ? (
      <>
        <div className="code-block">
          <div className="">{match[0]}</div>
  
          <SyntaxHighlighter
            {...rest}
            PreTag="div"
            language={match[1]}
            style={darcula}
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
  
        <div className="">
          <p>
            Use Code
            <a className="link ms-2" href="#" target="_blank">
              with caution.
            </a>
          </p>
  
          <a className="codicon codicon-copy">Copy</a>
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
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{ code: Code }}
          >
            {/* {chat.ai_answer} */}
            {sampleChat.ai_answer}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
