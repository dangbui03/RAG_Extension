import { useState } from 'react';
import { useImmer } from 'use-immer';
// import api from '@/api';
// import { parseSSEStream } from '@/utils';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

// Type definition for a message
type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  loading?: boolean;
  error?: boolean;
};

const ChatWindow: React.FC = () =>  {
  // const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const isLoading = !!(messages.length && messages[messages.length - 1].loading);

  async function submitNewMessage(): Promise<void> {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((draft: Message[]) => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', sources: [], loading: true },
    ]);
    setNewMessage('');

    // let chatIdOrNew = chatId;
    try {
      // if (!chatId) {
      //   const { id } = await api.createChat();
      //   setChatId(id);
      //   chatIdOrNew = id;
      // }

    //   const stream = await api.sendChatMessage(chatIdOrNew, trimmedMessage);
    //   // Ensure `parseSSEStream` is correctly implemented or imported
    //   for await (const textChunk of parseSSEStream(stream)) {
    //     setMessages(draft => {
    //       draft[draft.length - 1].content += textChunk;
    //     });
    //   }
    //   setMessages(draft => {
    //     draft[draft.length - 1].loading = false;
    //   });
    } catch (err) {
      console.log(err);
      setMessages((draft: Message[]) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  return (
    <div className='relative grow flex flex-col gap-6 pt-6'>
      {messages.length === 0 && (
        <div className='mt-3 font-urbanist text-primary-blue text-xl font-light space-y-2'>
          <p>👋 Welcome!</p>
          <p>I am powered by the latest technology reports from leading institutions like the World Bank, the World Economic Forum, McKinsey, Deloitte and the OECD.</p>
          <p>Ask me anything about the latest technology trends.</p>
        </div>
      )}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
}

export default ChatWindow;
