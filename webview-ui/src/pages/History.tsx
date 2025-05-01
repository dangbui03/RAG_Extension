import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Mode = "menu" | "rename";

const History: React.FC = () => {
  const { chats, setCurrentChat, deleteChat, deleteAllChats, renameChat } =
    useChat();

  const [confirmOpen, setConfirmOpen] = useState(false);            // popover “Clear all”
  const [activeId, setActiveId]     = useState<string | null>(null); // chat đang mở popover
  const [mode, setMode]             = useState<Mode>("menu");        // menu | rename
  const [draftTitle, setDraftTitle] = useState("");                  // input rename

  const navigate = useNavigate();

  const formatDate = (d: Date | string) =>
    formatDistanceToNow(typeof d === "string" ? new Date(d) : d, {
      addSuffix: true,
    });

  /* ----------------------------------------- */
  return (
    <div className="h-full flex flex-col">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-base font-semibold text-white">Chat History</h1>

        <div className="flex gap-2 sm:gap-4">
          {chats.length > 0 && (
            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
              <PopoverTrigger asChild>
                <div
                  className="codicon codicon-clear-all rounded-xl cursor-pointer"
                  title="Clear history"
                />
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-xs text-gray-400 mb-3">
                  Delete <b>all</b> chat history?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      deleteAllChats();
                      setConfirmOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <div
            className="codicon codicon-comment-discussion rounded-xl cursor-pointer"
            title="Return Chat"
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      {chats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="codicon codicon-history text-4xl mb-2" />
          <p>No chat history found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="mb-2 bg-[#2d2d2d] rounded-md">
              {/* ====== ONE ROW ====== */}
              <div
                className="flex justify-between p-3 hover:bg-[#3a3a3a] cursor-pointer"
                onClick={() => {
                  setCurrentChat(chat.id);
                  navigate("/");
                }}
              >
                {/* title + meta */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {chat.title || "Untitled Chat"}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span>{formatDate(chat.updatedAt)}</span>
                    <span className="mx-2">•</span>
                    <span>{chat.messages.length} messages</span>
                  </div>
                </div>

                {/* ------- Single Popover per row ------- */}
                <Popover
                  open={activeId === chat.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setActiveId(chat.id);
                      setMode("menu");
                      setDraftTitle(chat.title || "");
                    } else {
                      setActiveId(null);
                      setMode("menu");
                    }
                  }}
                >
                  <PopoverTrigger
                    asChild
                    onClick={(e) => {
                      e.stopPropagation(); // đừng chọn chat khi bấm ⚙︎
                    }}
                  >
                    <button
                      className="codicon codicon-gear text-gray-400 hover:text-white ml-2"
                      title="Chat settings"
                    />
                  </PopoverTrigger>

                  <PopoverContent
                    onClick={(e) => e.stopPropagation()}
                    className="w-64 p-3 bg-[#2d2d2d]"
                  >
                    {mode === "menu" && (
                      <>
                        {/* MENU ------------- */}
                        <button
                          onClick={() => setMode("rename")}
                          className="flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded hover:bg-[#3a3a3a] text-white"
                        >
                          <span className="codicon codicon-edit" />
                          Rename
                        </button>

                        <button
                          onClick={() => {
                            deleteChat(chat.id);
                            setActiveId(null);
                          }}
                          className="flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded hover:bg-[#3a3a3a] text-red-400 mt-1"
                        >
                          <span className="codicon codicon-trash" />
                          Delete
                        </button>
                      </>
                    )}

                    {mode === "rename" && (
                      <>
                        {/* RENAME ------------ */}
                        <p className="text-sm mb-2 text-white">Rename chat</p>
                        <input
                          autoFocus
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="w-full mb-3 px-2 py-1 rounded bg-[#1e1e1e] text-white text-sm"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded"
                            onClick={() => {
                              const t = draftTitle.trim();
                              if (t) renameChat(chat.id, t);
                              setActiveId(null);
                            }}
                          >
                            OK
                          </button>
                          <button
                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded"
                            onClick={() => setMode("menu")}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* preview last message */}
              {chat.messages.length > 0 && (
                <div className="px-3 pb-3 text-xs text-gray-300 max-h-16 overflow-hidden">
                  <div className="line-clamp-2">
                    <strong>Last message:</strong>{" "}
                    {chat.messages.at(-1)!.user_prompt.slice(0, 100)}
                    {chat.messages.at(-1)!.user_prompt.length > 100 && "..."}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
