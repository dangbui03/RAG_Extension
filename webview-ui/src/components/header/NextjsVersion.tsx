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
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>({});
  const [warningVersion, setWarningVersion] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the list of versions when the component mounts
    fetchNextjsVersionList();
  }, []);

  const handleSelectVersion = (version: string) => {
    const isDownloaded = downloadedVersions.some((v) => v.versionName === version);
    
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
    try {
      // Set loading state for this version
      setLoadingStates(prev => ({ ...prev, [version]: 'deleting' }));
      
      // Call the delete function
      await deleteNextJsVersion(version);
      
      // Clear loading state when done
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    } catch (error) {
      console.error("Error deleting version:", error);
      // Clear loading state on error
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    }
  };

  const handleRepairVersion = async (version: string) => {
    try {
      // Set loading state for this version
      setLoadingStates(prev => ({ ...prev, [version]: 'repairing' }));
      
      // Call the repair function
      await repairNextJsVersion(version);
      
      // Clear loading state when done
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    } catch (error) {
      console.error("Error repairing version:", error);
      // Clear loading state on error
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    }
  };

  const handleDownloadVersion = async (version: string) => {
    try {
      // Set loading state for this version
      setLoadingStates(prev => ({ ...prev, [version]: 'downloading' }));
      
      // Call the download function
      await retrieveNextJsVersion(version);
      
      // Clear loading state when done
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    } catch (error) {
      console.error("Error downloading version:", error);
      // Clear loading state on error
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[version];
        return newState;
      });
    }
  };

  const isVersionLoading = (version: string) => {
    return !!loadingStates[version];
  };

  const getLoadingText = (version: string) => {
    const state = loadingStates[version];
    if (state === 'downloading') return 'Downloading...';
    if (state === 'deleting') return 'Deleting...';
    if (state === 'repairing') return 'Repairing...';
    return '';
  };

  return (
    <div className="gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Select Next.js Version"
            className="w-full text-white text-sm cursor-pointer"
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
            <h3 className="font-medium mb-2">Downloaded Version</h3>
            <div className="max-h-40 overflow-auto">
              {downloadedVersions.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-1">No versions downloaded</div>
              ) : (
                <div className="space-y-1">
                  {downloadedVersions.map((version) => (
                    <div
                      key={version.versionName}
                      className={`flex items-center justify-between group px-2 py-1 hover:bg-black ${nextjsVersion === version.versionName ? 'bg-gray-800' : ''}`}
                    >
                      <button
                        onClick={() => handleSelectVersion(version.versionName)}
                        className="text-left text-sm text-white truncate w-full mr-2"
                        disabled={isVersionLoading(version.versionName)}
                      >
                        <div>
                          {version.versionName}
                          {nextjsVersion === version.versionName && (
                            <span className="text-green-500 text-xs ml-1">✓</span>
                          )}
                        </div>
                      </button>

                      {isVersionLoading(version.versionName) ? (
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="codicon codicon-loading animate-spin mr-1"></span>
                          {getLoadingText(version.versionName)}
                        </div>
                      ) : (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="codicon codicon-settings-gear text-white hover:text-gray-300 p-1"
                              disabled={isVersionLoading(version.versionName)}
                            ></button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="left"
                            align="start"
                            className="w-12 p-2 bg-chat-darker border border-gray-700 text-sm"
                          >
                            <button
                              className="codicon codicon-trash block w-full text-left hover:bg-red-500 hover:text-white px-2 py-1 rounded"
                              title="Delete Version"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVersion(version.versionName);
                              }}
                              disabled={isVersionLoading(version.versionName)}
                            ></button>
                            <button
                              className="codicon codicon-symbol-property block w-full text-left hover:bg-blue-500 hover:text-white px-2 py-1 rounded mt-1"
                              title="Repair Version"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRepairVersion(version.versionName);
                              }}
                              disabled={isVersionLoading(version.versionName)}
                            ></button>
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
                <div className="text-gray-400 text-sm text-center py-1">No versions available</div>
              ) : (
                <div className="space-y-1">
                  {availableVersions.map((version) => (
                    <div
                      key={version.versionName}
                      className={`flex items-center justify-between group px-2 py-1 hover:bg-black ${warningVersion === version.versionName ? 'bg-yellow-900/30' : ''}`}
                    >
                      <span
                        className={`text-left text-sm ${warningVersion === version.versionName ? 'text-yellow-200' : 'text-gray-300'} truncate w-full mr-2`}
                        title={warningVersion === version.versionName ? "You need to download this version first" : ""}
                      >
                        <div>{version.versionName}</div>
                      </span>

                      {isVersionLoading(version.versionName) ? (
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="codicon codicon-loading animate-spin mr-1"></span>
                          {getLoadingText(version.versionName)}
                        </div>
                      ) : (
                        <button
                          className={`codicon codicon-cloud-download ${
                            warningVersion === version.versionName 
                              ? 'text-yellow-400 animate-pulse' 
                              : 'text-white hover:text-gray-300'
                          } p-1`}
                          title={warningVersion === version.versionName ? "Download required to use this version" : "Download Version"}
                          onClick={() => handleDownloadVersion(version.versionName)}
                          disabled={isVersionLoading(version.versionName)}
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