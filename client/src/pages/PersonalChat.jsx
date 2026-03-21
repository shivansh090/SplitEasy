import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePersonalChat } from '../hooks/usePersonalChat';
import ChatWindow from '../components/chat/ChatWindow';

export default function PersonalChat() {
  const { user } = useAuth();
  const { messages, loading, sending, fetchMessages, sendMessage } = usePersonalChat();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">Personal Expenses</h1>
          <p className="text-xs text-gray-500">Track your own spending</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatWindow
          messages={messages}
          loading={loading}
          sending={sending}
          onSend={sendMessage}
          currentUserId={user?._id}
          emptyText='Type "spent 500 on coffee" to track an expense'
        />
      </div>
    </div>
  );
}
