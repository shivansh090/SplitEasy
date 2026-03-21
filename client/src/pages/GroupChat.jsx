import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGroups } from '../hooks/useGroups';
import { useChat } from '../hooks/useChat';
import { useAnalytics } from '../hooks/useAnalytics';
import ChatWindow from '../components/chat/ChatWindow';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import ExpenseHistory from '../components/dashboard/ExpenseHistory';
import CategoryChart from '../components/analytics/CategoryChart';
import MemberBreakdown from '../components/analytics/MemberBreakdown';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';

export default function GroupChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const { currentGroup, fetchGroup } = useGroups();
  const { messages, balances, loading, sending, fetchMessages, fetchBalances, sendMessage } = useChat(id);
  const { analytics, fetchGroupAnalytics } = useAnalytics();
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('info');

  useEffect(() => {
    fetchGroup(id);
    fetchMessages();
    fetchBalances();
    fetchGroupAnalytics(id);
  }, [id, fetchGroup, fetchMessages, fetchBalances, fetchGroupAnalytics]);

  if (!currentGroup) {
    return <Loader className="min-h-screen" />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{currentGroup.name}</h1>
          <p className="text-xs text-gray-500">
            {currentGroup.members?.length} members &middot; Code: {currentGroup.inviteCode}
          </p>
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="text-gray-500 hover:text-gray-700 transition-colors lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow
            messages={messages}
            loading={loading}
            sending={sending}
            onSend={sendMessage}
            currentUserId={user?._id}
          />
        </div>

        <aside
          className={`${
            showSidebar ? 'block' : 'hidden'
          } lg:block w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0`}
        >
          {/* Sidebar tabs */}
          <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('info')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                sidebarTab === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setSidebarTab('analytics')}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                sidebarTab === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="p-4">
            {sidebarTab === 'info' && (
              <>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Members</h3>
                <div className="space-y-2 mb-6">
                  {currentGroup.members?.map((m) => (
                    <div key={m.user._id} className="flex items-center gap-2">
                      <Avatar name={m.user.name} size="sm" />
                      <span className="text-sm text-gray-700">
                        {m.user.name}
                        {m.user._id === user?._id && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Balances</h3>
                <BalanceSummary balances={balances} />

                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                  Recent Expenses
                </h3>
                <ExpenseHistory groupId={id} />
              </>
            )}

            {sidebarTab === 'analytics' && analytics && (
              <>
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(analytics.totalSpent)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Count</p>
                      <p className="text-sm font-bold text-gray-900">{analytics.expenseCount}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  By Category
                </h3>
                <CategoryChart data={analytics.categoryBreakdown} />

                {analytics.memberBreakdown && analytics.memberBreakdown.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                      Who Spent What
                    </h3>
                    <MemberBreakdown data={analytics.memberBreakdown} />
                  </>
                )}
              </>
            )}

            {sidebarTab === 'analytics' && !analytics && (
              <p className="text-center text-gray-400 text-sm py-4">No analytics data yet</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
