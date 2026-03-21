import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GroupList from '../components/groups/GroupList';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-700">SplitEasy</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
          <Button onClick={() => setShowModal(true)} size="sm">
            + New Group
          </Button>
        </div>

        <GroupList />

        <CreateGroupModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </main>
    </div>
  );
}
