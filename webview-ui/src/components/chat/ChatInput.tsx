import useAutosize from '../../hooks/useAutoSize';
import sendIcon from '../../assets/images/send.svg';
import { VSCodeButton }  from "@vscode/webview-ui-toolkit/react";

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
    <div className="sticky bottom-0 bg-white py-4 z-50">
      {/* <form onSubmit={(e) => { e.preventDefault(); submitNewMessage(); }}> */}
        <div className="p-1.5 bg-primary-blue/35 rounded-3xl font-mono animate-chat duration-400">
          <div className="pr-0.5 bg-white relative shrink-0 overflow-hidden ring-primary-blue ring-1 focus-within:ring-2 transition-all">
            <textarea
              className="block w-full max-h-[140px] pt-2 px-4 bg-white rounded-3xl resize-none placeholder:text-primary-blue placeholder:leading-4 placeholder:-translate-y-1 sm:placeholder:leading-normal sm:placeholder:translate-y-0 focus:outline-none"
              ref={textareaRef}
              rows={1}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
            />
            {/* Context and Model Buttons */}
            <div className="mt-3 flex justify-between items-center mx-4 my-3 gap-2 max-xsm:flex-col">
              {/* Context Button */}
              <button
                type="button"
                className=" p-2 text-black rounded-full text-sm hover:bg-red-200 transition-all"
              >
                #Context
              </button>
              {/* Model Button */}
              <div className="flex justify-between"> 
                <button
                  type="button"
                  className="p-2 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-all"
                >
                  Gwen2.5B:1.5b
                </button>
                <button
                  onClick={submitNewMessage}
                  className="right-3 pl-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue/80"
                >
                  <img src={sendIcon} alt="send" />
                </button>
              </div>
            </div>
          </div>
          {/* Send button */}
          
        </div>
      {/* </form> */}
    </div>
  );
};

export default ChatInput;
