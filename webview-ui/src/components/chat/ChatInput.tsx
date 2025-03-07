import useAutosize from '../../hooks/useAutoSize';
// import { VSCodeButton }  from "@vscode/webview-ui-toolkit/react";

interface ChatInputProps {
  newMessage: string;
  isLoading: boolean;
  setNewMessage: (message: string) => void;
  submitNewMessage: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ newMessage, isLoading, setNewMessage, submitNewMessage }) => {
  const textareaRef = useAutosize(newMessage);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <div className="bottom-0 py-4 z-50">
      {/* <form onSubmit={(e) => { e.preventDefault(); submitNewMessage(); }}> */}
      <div className="flex pr-0.5 relative shrink-0 overflow-hidden ring-primary-blue ring-1 transition-all">
        <textarea
          className="block w-full max-h-[140px] p-2 resize-none"
          ref={textareaRef}
          rows={1}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
        />
        <button
          onClick={submitNewMessage}
          className="codicon codicon-send cursor-pointer right-3 p-2 rounded-md 0"
        >
        </button>
      </div>  
    </div>
  );
};

export default ChatInput;
