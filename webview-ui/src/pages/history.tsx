import React, {  } from 'react';
// import { useChat } from "@/context/ChatContext";
import Header from '../components/Header';
// import HistoryView from '@/components/history/HistoryView';

const History: React.FC = () => {
  // const { fetchChatsHistory } = useChat();

  // useEffect(() => {
  //   // Refresh chat history when visiting the page
  //   fetchChatsHistory();
  // }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#1e1e1e]">
      <div className="p-4 border-b border-[#333333]">
        <Header />
      </div>
      <div className="flex-1 relative overflow-hidden">
        {/* <HistoryView /> */}
        hi
      </div>
    </div>
  );
};

export default History;