import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useChat } from "@/context/ChatContext";
import { Separator } from "@/components/ui/separator";
import { versions } from "@/types";

const NextjsVersion: React.FC = () => {
  const { nextjsVersion, setNextjsVersion } = useChat();

  const handleDeleteVersion = (version: string) => {
    console.log("Delete version:", version);
    // Your actual logic here
  };

  const handleRepairVersion = (version: string) => {
    console.log("Repair version:", version);
    // Your actual logic here
  };

  const handleDownloadVersion = (version: string) => {
    console.log("Download version:", version);
    // Your actual logic here
  };

  return (
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
            <div className="max-h-40 overflow-auto">
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
                        <button className="codicon codicon-settings-gear text-white hover:text-gray-300 p-1"></button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="left"
                        align="start"
                        className="w-12 p-2 bg-chat-darker border border-gray-700 text-sm"
                      >
                        <button
                          className="codicon codicon-trash block w-full text-left hover:bg-red-500 hover:text-white px-2 py-1 rounded"
                          title="Delete Version"
                          onClick={() => handleDeleteVersion(version)}
                        ></button>
                        <button
                          className="codicon codicon-symbol-property block w-full text-left hover:bg-blue-500 hover:text-white px-2 py-1 rounded mt-1"
                          title="Repair Version"
                          onClick={() => handleRepairVersion(version)}
                        ></button>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Separator className="my-1" />
          <div className="p-2">
            <h3 className="font-medium mb-2">Select Next.js Version</h3>
            <div className="max-h-40 overflow-auto">
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
                    <button
                      className="codicon codicon-cloud-download text-white hover:text-gray-300 p-1"
                      title="Download Version"
                      onClick={() => handleDownloadVersion(version)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NextjsVersion;
