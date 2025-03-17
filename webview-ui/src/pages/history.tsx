import { ChatProvider } from "@/context/ChatContext";
import Header from '../components/Header';
import HistoryView from '@/components/history/HistoryView';

const History = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* <Sidebar /> */}
        <Header />
        <div className="flex-1 relative overflow-hidden">
          <HistoryView />
        </div>
      </div>
    </ChatProvider>
  );
};

export default History;