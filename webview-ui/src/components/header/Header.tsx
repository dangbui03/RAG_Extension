import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useChat } from "@/context/ChatContext";

/**
 * Imports the Models and NextjsVersion components from their respective files.
 */
import Models from "./Models";
import NextjsVersion from "./NextjsVersion";

const Header: React.FC = () => {
  const {
    createNewChat,

    deleteAllChats,

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

  return (
    <>
      <div className="flex flex-row justify-between items-center text-xs pt-1">
        <div className="flex flex-row items-center gap-2 sm:gap-4">
          <Models />
          <NextjsVersion />
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
            className="codicon codicon-add rounded-xl cursor-pointer"
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
