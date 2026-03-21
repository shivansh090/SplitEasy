import { useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup, joinGroup } = useGroups();
  const [tab, setTab] = useState('create');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createGroup(name, description);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await joinGroup(inviteCode.trim().toUpperCase());
      setInviteCode('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Group">
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => { setTab('create'); setError(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => { setTab('join'); setError(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'join' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Join
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {tab === 'create' ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Goa Trip 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What's this group for?"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Create Group
          </Button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center tracking-widest font-mono text-lg uppercase"
              placeholder="ABC123"
              maxLength={6}
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Join Group
          </Button>
        </form>
      )}
    </Modal>
  );
}
