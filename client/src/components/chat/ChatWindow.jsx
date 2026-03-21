import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Loader from '../ui/Loader';

export default function ChatWindow({
  messages,
  loading,
  sending,
  onSend,
  currentUserId,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto chat-scrollbar px-4 py-2">
        {loading ? (
          <Loader className="py-12" />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium text-lg">Start chatting!</p>
            <p className="text-sm mt-1 text-center max-w-xs">
              Type an expense like "I paid 200 for snacks, split with everyone"
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === currentUserId || msg.sender === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} disabled={sending} />
    </div>
  );
}
