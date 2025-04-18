import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useChat } from "@/context/ChatContext";

const Models = () => {
  const { selectedModel, selectModel, models, fetchModels } = useChat();

  return (
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
  );
};

export default Models;
