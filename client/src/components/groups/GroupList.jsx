import { useEffect } from 'react';
import { useGroups } from '../../hooks/useGroups';
import GroupCard from './GroupCard';
import Loader from '../ui/Loader';

export default function GroupList() {
  const { groups, loading, fetchGroups } = useGroups();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loading && groups.length === 0) {
    return <Loader className="py-12" />;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="font-medium">No groups yet</p>
        <p className="text-sm mt-1">Create a group or join one with an invite code</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((group) => (
        <GroupCard key={group._id} group={group} />
      ))}
    </div>
  );
}
