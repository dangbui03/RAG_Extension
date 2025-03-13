import React, { useState, useEffect }  from 'react';
import { useNavigate } from 'react-router-dom';
import { vscode } from '@/vscode/VsCodeApi';
import { useChat } from "@/context/ChatContext";


const Header: React.FC = () => {
  const { selectedModel, selectModel, createNewChat } = useChat();
  const navigate = useNavigate();

  const [models, setModels] = useState<string[]>([]);
  // const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    vscode.postMessage({ command: 'populateModels' });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
    const message = event.data;

    if (message.command === 'populateModels') {
      // Update the list of models
      if (Array.isArray(message.models)) {
        setModels(message.models);
        selectModel(message.models[0]);
      } else {
        setModels(['No models found']);
        selectModel('No models found');
      }
    }
  }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectModel(e.target.value);
  };

  return (
    <div className="flex flex-row justify-between items-center text-sm">
      <div className="gap-4">
        <select
            id="model"
            className="w-full text-white p-1 text-sm cursor-pointer "
            value={selectedModel}
            onChange={handleModelChange}
        >
            {models.length === 0 && (
              <option value="">Loading models...</option>
            )}
            {models.map((m) => (
              <option key={m} value={m} className="bg-[#1e1e1e] text-white hover:bg-black">
                  {m}
              </option>
            ))}
        </select>
      </div>
      <div className="flex gap-2 text-white sm:gap-4">
        <div
          onClick={createNewChat}
          className="codicon codicon-comment-discussion rounded-xl cursor-pointer"
        />
        <div
          onClick={() => navigate("/history")}
          className="codicon codicon-settings-gear rounded-xl cursor-pointer"
        />
        <div
          onClick={() => navigate("/")}
          className="codicon codicon-history rounded-xl cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Header;
