import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import GroupList from '../components/groups/GroupList';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import MonthPicker from '../components/analytics/MonthPicker';
import SpendingSummaryCard from '../components/analytics/SpendingSummaryCard';
import CategoryChart from '../components/analytics/CategoryChart';
import MonthlyTrendChart from '../components/analytics/MonthlyTrendChart';
import RecentExpensesList from '../components/analytics/RecentExpensesList';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'personal', label: 'Personal' },
  { id: 'groups', label: 'Groups' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  const { analytics: dashboardData, loading: dashLoading, fetchDashboardAnalytics } = useAnalytics();
  const { analytics: personalData, loading: persLoading, fetchPersonalAnalytics } = useAnalytics();

  useEffect(() => {
    if (tab === 'overview') fetchDashboardAnalytics(month, year);
    if (tab === 'personal') fetchPersonalAnalytics(month, year);
  }, [tab, month, year, fetchDashboardAnalytics, fetchPersonalAnalytics]);

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentData = tab === 'overview' ? dashboardData : personalData;
  const currentLoading = tab === 'overview' ? dashLoading : persLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-700">SplitEasy</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview & Personal tabs */}
        {(tab === 'overview' || tab === 'personal') && (
          <div className="space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {tab === 'overview' ? 'All Expenses' : 'Personal Expenses'}
              </h2>
              <div className="flex items-center gap-3">
                <MonthPicker month={month} year={year} onChange={handleMonthChange} />
                {tab === 'personal' && (
                  <Link
                    to="/personal"
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    + Add Expense
                  </Link>
                )}
              </div>
            </div>

            {currentLoading && !currentData ? (
              <Loader className="py-12" />
            ) : currentData ? (
              <>
                <SpendingSummaryCard
                  totalSpent={currentData.totalSpent}
                  expenseCount={currentData.expenseCount}
                  avgExpense={currentData.avgExpense}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      By Category
                    </h3>
                    <CategoryChart data={currentData.categoryBreakdown} />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Monthly Trend
                    </h3>
                    <MonthlyTrendChart data={currentData.monthlyTrend} dailyData={currentData.dailyTrend} />
                  </div>
                </div>

                {currentData.recentExpenses && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Recent Expenses
                    </h3>
                    <RecentExpensesList
                      expenses={currentData.recentExpenses}
                      onUpdate={() => {
                        if (tab === 'overview') fetchDashboardAnalytics(month, year);
                        else fetchPersonalAnalytics(month, year);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No expense data yet</p>
                {tab === 'personal' && (
                  <Link to="/personal" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                    Start tracking personal expenses
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Groups tab */}
        {tab === 'groups' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
              <Button onClick={() => setShowModal(true)} size="sm">
                + New Group
              </Button>
            </div>
            <GroupList />
            <CreateGroupModal isOpen={showModal} onClose={() => setShowModal(false)} />
          </div>
        )}
      </main>
    </div>
  );
}
