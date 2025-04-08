import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { versions } from "@/types";

const Header: React.FC = () => {
  const {
    createNewChat,
    selectedModel,
    selectModel,
    models,
    deleteAllChats,
    nextjsVersion,
    setNextjsVersion,
  } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectModel(e.target.value);
  };

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

  const selectNextjsVersion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNextjsVersion(e.target.value);
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center text-sm pt-1">
        <div className="flex flex-row items-center gap-2 sm:gap-4">
          <div className="gap-4">
            <select
              id="model"
              title="Select Model"
              className="w-[90px] text-white text-sm cursor-pointer !px-1"
              value={selectedModel}
              onChange={handleModelChange}
            >
              {models.length === 0 && <option value="">Not found</option>}
              {models.map((m) => (
                <option
                  key={m}
                  value={m}
                  className="bg-[#1e1e1e] text-white hover:bg-black"
                >
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="gap-4">
            <select
              id="nextjsVersion"
              title="Select Next.js Version"
              className="w-full text-white text-sm cursor-pointer px-1"
              value={nextjsVersion}
              onChange={selectNextjsVersion}
            >
              {versions.map((version) => (
                <option
                  key={version}
                  value={version}
                  className="bg-[#1e1e1e] text-white hover:bg-black"
                >
                  {version}
                </option>
              ))}
            </select>
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
