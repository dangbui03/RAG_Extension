import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { useChat } from "@/context/ChatContext";

const NextjsVersion: React.FC = () => {
  const {
    nextjsVersion,
    setNextjsVersion,
    availableVersions,
    downloadedVersions,
    fetchNextjsVersionList,
    retrieveNextJsVersion,
    deleteNextJsVersion,
    repairNextJsVersion,
  } = useChat();

  // Track loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>(
    {}
  );
  const [globalLoading, setGlobalLoading] = useState(false);
  const [warningVersion, setWarningVersion] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the list of versions when the component mounts
    fetchNextjsVersionList();
  }, []);

  const handleSelectVersion = (version: string) => {
    const isDownloaded = downloadedVersions.some(
      (v) => v.version_name === version
    );

    if (isDownloaded) {
      // If the version is already downloaded, set it as the current version
      setNextjsVersion(version);
      setWarningVersion(null);
    } else {
      // Mark this version as having a warning
      setWarningVersion(version);

      // Auto-clear warning after 3 seconds
      setTimeout(() => {
        setWarningVersion(null);
      }, 3000);
    }
  };

  const handleDeleteVersion = async (version: string) => {
    setGlobalLoading(true);
    setLoadingStates((prev) => ({ ...prev, [version]: "deleting" }));
    try {
      await deleteNextJsVersion(version);
      setNextjsVersion(""); // Clear the current version if it was deleted
    } catch (error) {
      console.error("Error deleting version:", error);
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
      setGlobalLoading(false);
    }
  };

  const handleRepairVersion = async (version: string) => {
    setGlobalLoading(true);
    setLoadingStates((prev) => ({ ...prev, [version]: "repairing" }));
    try {
      await repairNextJsVersion(version);
    } catch (error) {
      console.error("Error repairing version:", error);
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
      setGlobalLoading(false);
    }
  };

  const handleDownloadVersion = async (version: string) => {
    setGlobalLoading(true);
    setLoadingStates((prev) => ({ ...prev, [version]: "downloading" }));
    try {
      await retrieveNextJsVersion(version);
    } catch (error) {
      console.error("Error downloading version:", error);
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
      setGlobalLoading(false);
    }
  };

  const isVersionLoading = (version: string) => {
    return !!loadingStates[version];
  };

  const getLoadingText = (version: string) => {
    const state = loadingStates[version];
    if (state === "downloading") return "Downloading...";
    if (state === "deleting") return "Deleting...";
    if (state === "repairing") return "Repairing...";
    return "";
  };

  return (
    <div className="gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Select Next.js Version"
            className="w-full text-white text-xs cursor-pointer"
            disabled={globalLoading}
          >
            {nextjsVersion || "Select Next.js Version"}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-50 p-0 bg-chat-darker border border-gray-700"
        >
          <div className="p-2">
            <h3 className="font- mb-2">Downloaded Version</h3>
            <div className="max-h-40 overflow-auto">
              {downloadedVersions.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-1">No versions downloaded</div>
              ) : (
                <div className="space-y-1">
                  {downloadedVersions.map((version) => (
                    <div
                      key={version.version_name}
                      className={`flex items-center justify-between group px-2 py-1 hover:bg-black ${
                        nextjsVersion === version.version_name ? "bg-gray-800" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleSelectVersion(version.version_name)}
                        className="text-left text-xs text-white truncate w-full mr-2"
                        disabled={globalLoading}
                      >
                        <div>
                          {version.version_name}
                          {nextjsVersion === version.version_name && (
                            <span className="text-green-500 text-xs ml-1">✓</span>
                          )}
                        </div>
                      </button>

                      {isVersionLoading(version.version_name) ? (
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="codicon codicon-loading animate-spin mr-1"></span>
                          {getLoadingText(version.version_name)}
                        </div>
                      ) : (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="codicon codicon-settings-gear text-white hover:text-gray-300 p-1"
                              disabled={globalLoading}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            side="left"
                            align="start"
                            className="w-12 p-2 bg-chat-darker border border-gray-700 text-xs"
                          >
                            <button
                              className="codicon codicon-trash block w-full text-left hover:bg-red-500 hover:text-white px-2 py-1 rounded"
                              title="Delete Version"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVersion(version.version_name);
                              }}
                              disabled={globalLoading}
                            />
                            <button
                              className="codicon codicon-symbol-property block w-full text-left hover:bg-blue-500 hover:text-white px-2 py-1 rounded mt-1"
                              title="Repair Version"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRepairVersion(version.version_name);
                              }}
                              disabled={globalLoading}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Separator className="my-1" />
          <div className="p-2">
            <h3 className="font-medium mb-2">Available Versions</h3>
            <div className="max-h-40 overflow-auto">
              {availableVersions.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-1">No versions available</div>
              ) : (
                <div className="space-y-1">
                  {availableVersions.map((version) => (
                    <div
                      key={version.version_name}
                      className={`flex items-center justify-between group px-2 py-1 hover:bg-black ${
                        warningVersion === version.version_name ? "bg-yellow-900/30" : ""
                      }`}
                    >
                      <span
                        className={`text-left text-xs ${
                          warningVersion === version.version_name ? "text-yellow-200" : "text-gray-300"
                        } truncate w-full mr-2`}
                        title={
                          warningVersion === version.version_name
                            ? "You need to download this version first"
                            : ""
                        }
                      >
                        <div>{version.version_name}</div>
                      </span>

                      {isVersionLoading(version.version_name) ? (
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="codicon codicon-loading animate-spin mr-1"></span>
                          {getLoadingText(version.version_name)}
                        </div>
                      ) : (
                        <button
                          className={`codicon codicon-cloud-download ${
                            warningVersion === version.version_name
                              ? "text-yellow-400 animate-pulse"
                              : "text-white hover:text-gray-300"
                          } p-1`}
                          title={
                            warningVersion === version.version_name
                              ? "Download required to use this version"
                              : "Download Version"
                          }
                          onClick={() => handleDownloadVersion(version.version_name)}
                          disabled={globalLoading}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NextjsVersion;
