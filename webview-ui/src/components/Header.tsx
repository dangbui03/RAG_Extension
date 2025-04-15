import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { versions } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const Header: React.FC = () => {
  const {
    createNewChat,
    selectedModel,
    selectModel,
    models,
    deleteAllChats,
    nextjsVersion,
    setNextjsVersion,
    fetchModels
  } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {
    createNewChat();
    navigate("/");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all chats?")) {
      deleteAllChats();
    }
  };
  const handleDeleteVersion = (version: string) => {
    console.log("Delete version:", version);
    // Your actual logic here
  };
  
  const handleRepairVersion = (version: string) => {
    console.log("Repair version:", version);
    // Your actual logic here
  };
  

return (
  <>
    <div className="flex flex-row justify-between items-center text-sm pt-1">
      <div className="flex flex-row items-center gap-2 sm:gap-4">
        <div className="gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                title="Select Model"
                className="w-[100px] text-white text-sm cursor-pointer overflow-ellipsis"
                onClick={fetchModels}
              >
                {(selectedModel.length > 10
                  ? selectedModel.slice(0, 10) + ".."
                  : selectedModel) || "Select Model"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-60 p-0 bg-chat-darker border border-gray-700"
            >
              <div className="p-2">
                <h3 className="font-medium mb-2">Select Model</h3>
                <div className="max-h-60 overflow-auto">
                  <div className="space-y-1">
                    {models.length === 0 ? (
                      <p className="text-sm">Not found</p>
                    ) : (
                      models.map((m) => (
                        <button
                          key={m}
                          value={m}
                          onClick={() => selectModel(m)}
                          className="block w-full text-left px-2 py-1 hover:bg-black"
                        >
                          {m}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                title="Select Next.js Version"
                className="w-full text-white text-sm cursor-pointer"
              >
                {nextjsVersion}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-50 p-0 bg-chat-darker border border-gray-700"
            >
              <div className="p-2">
                <h3 className="font-medium mb-2">Select Next.js Version</h3>
                <div className="max-h-60 overflow-auto">
                  <div className="space-y-1">
                  {versions.map((version) => (
                    <div
                      key={version}
                      className="flex items-center justify-between group px-2 py-1 hover:bg-black"
                    >
                      <button
                        onClick={() => setNextjsVersion(version)}
                        className="text-left text-sm text-white truncate w-full mr-2"
                      >
                        {version}
                      </button>

                      {/* Settings Icon with Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="codicon codicon-settings-gear text-white hover:text-gray-300 p-1">
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="left"
                          align="start"
                          className="w-32 p-2 bg-chat-darker border border-gray-700 text-sm"
                        >
                          <button
                            className="codicon codicon-trash block w-full text-left hover:bg-red-500 hover:text-white px-2 py-1 rounded"
                            title="Delete Version"
                            onClick={() => handleDeleteVersion(version)}
                          >
                          </button>
                          <button
                            className="codicon codicon-symbol-property block w-full text-left hover:bg-blue-500 hover:text-white px-2 py-1 rounded mt-1"
                            title="Repair Version"
                            onClick={() => handleRepairVersion(version)}
                          >
                          </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
              <Separator className="my-2" />

            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 text-white sm:gap-4">
        {location.pathname === "/history" && (
          <div
            onClick={handleClearAll}
            className="codicon codicon-clear-all rounded-xl cursor-pointer"
          ></div>
        )}
        <div
          onClick={() => navigate("/settings")}
          className="codicon codicon-gear rounded-xl cursor-pointer"
          title="Settings"
        />
        <div
          onClick={handleNewChat}
          className="codicon codicon-comment-discussion rounded-xl cursor-pointer"
          title="New Chat"
        />
        <div
          onClick={handleHistory}
          className="codicon codicon-history rounded-xl cursor-pointer"
          title="History"
        />
      </div>
    </div>
  </>
);
};

export default Header;
