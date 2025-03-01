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
    <div className='relative grow flex flex-col gap-6 pt-6 mx-4'>
      {messages.length === 0 && (
        <div className='mt-3 text-black text-xl font-light'>
          <p className='text-xl'>ASK SOMETHINGS</p>
          <p className='text-base'>Free to ask about Next.js frameworks, we are supporting the framework from version 13.0.1 to 15.</p>
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
