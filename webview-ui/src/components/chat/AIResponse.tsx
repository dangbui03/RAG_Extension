/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { format } from "date-fns";
import { ChatMessage } from "@/types";
import toTitleCase from "@/utils/ToTitleCase";

interface ChatMessagesProps {
  chat: ChatMessage;
  children?: React.ReactNode;
}

// Define types for the Markdown components
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

const AIResponse: React.FC<ChatMessagesProps> = ({ chat, children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = useCallback(async (text: string) => {
    try {
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

  // rehype-pretty-code options
  const rehypePrettyCodeOptions = {
    theme: 'dracula',
    keepBackground: true,
    onVisitLine(node: any) {
      // Prevent lines from collapsing in `display: grid` mode
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
    onVisitHighlightedLine(node: any) {
      // Add a class to highlighted lines
      node.properties.className = ['highlighted-line'];
    },
    onVisitHighlightedWord(node: any) {
      // Add a class to highlighted words
      node.properties.className = ['highlighted-word'];
    },
  };

  // Custom code block component
  const Pre = React.forwardRef<HTMLPreElement, PreProps>(({ children, ...props }, ref) => {
    // Extract the text content for copying
    let textContent = '';
    let language = '';
    
    // Check if children is a React element and has the necessary properties
    if (React.isValidElement(children)) {
      // Extract language from className if it exists and matches the pattern
      const childClassName = (children.props as any)?.className || '';
      const languageMatch = /language-(\w+)/.exec(childClassName);
      language = languageMatch ? languageMatch[1] : '';
      
      // Extract text content for copying
      const childChildren = (children.props as any)?.children;
      if (typeof childChildren === 'string') {
        textContent = childChildren;
      } else if (Array.isArray(childChildren)) {
        textContent = childChildren
          .map(child => (typeof child === 'string' ? child : ''))
          .join('');
      }
    }

    return (
      <div className="code-wrapper rounded-md overflow-hidden my-2">
        {language && (
          <div className="px-4 py-2 pb-0 font-sans bg-dark-onSurfaceContainer">
            {toTitleCase(language)}
          </div>
        )}
        <pre ref={ref} {...props} className="p-0 m-0 overflow-auto">
          {children}
        </pre>
        <div className="bg-dark-onSurfaceContainer rounded-t-xs rounded-b-md flex justify-between items-center h-11 font-sans text-sm ps-4 pe-2">
          <p>
            Use Code
            <a className="link ms-2" href="#" target="_blank">
              with caution.
            </a>
          </p>

          <div
            className="rounded-md border-gray-500/50 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-700/50 group"
            onClick={() => handleCopyCode(textContent)}
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
      </div>
    );
  });
  
  Pre.displayName = 'Pre';

  // Custom code span component (for inline code)
  const Code = React.forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => {
    // Check if this is a code block (has language-*) or inline code
    const match = className ? /language-(\w+)/.exec(className) : null;
    
    // Return the code without modifications if it's not a code block
    if (!match) {
      return <code ref={ref} className={className} {...props} />;
    }
    
    // The code block styling is handled by the Pre component and rehype-pretty-code
    return <code ref={ref} className={className} {...props} />;
  });
  
  Code.displayName = 'Code';

  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 mt-1 bg-gray-700">
        A
      </div>
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex flex-wrap justify-between items-center mb-1">
          <h3 className="font-medium text-sm text-gray-300">Assistant</h3>
          <span className="text-xs text-gray-500">
            {format(new Date(chat.timestamp), "h:mm a")}
          </span>
        </div>

        {children}

        <div className="markdown-content">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypePrettyCode, rehypePrettyCodeOptions]]}
            components={{
              pre: Pre,
              code: Code
            }}
          >
            {chat.ai_answer}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;