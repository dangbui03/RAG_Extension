import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Skeleton } from "@/components/ui/skeleton";

export const ResponseLoading = () => {
  const { isGenerating, generationStartTime } = useChat();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isGenerating || !generationStartTime) {
      setElapsedTime(0);
      return;
    }

    // Set up the interval to update elapsed time
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - generationStartTime) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    // Clean up the interval when component unmounts or isGenerating changes
    return () => clearInterval(interval);
  }, [isGenerating, generationStartTime]);

  // Make sure we don't render anything if not generating
  if (!isGenerating) return null;

  return (
    <div className="flex flex-col space-y-2 py-2 w-full border-t border-gray-800 animate-pulse ">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-400">
            Thinking...
          </span>
        </div>
        <span className="text-xs text-gray-500">{elapsedTime}s</span>
      </div>

      <div className="space-y-2 mt-2">
        <Skeleton className="h-4 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-700" />
        <Skeleton className="h-4 w-2/3 bg-gray-700" />
      </div>
    </div>
  );
};

export default ResponseLoading;
