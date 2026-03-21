import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';

export default function GroupCard({ group }) {
  const memberCount = group.members?.length || 0;

  return (
    <Link
      to={`/groups/${group._id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {group.description}
            </p>
          )}
        </div>
        <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">
          {group.inviteCode}
        </span>
      </div>
      <div className="flex items-center mt-3 gap-1">
        <div className="flex -space-x-2">
          {group.members?.slice(0, 4).map((m) => (
            <Avatar
              key={m.user._id || m.user}
              name={m.user.name || '?'}
              size="sm"
              className="ring-2 ring-white"
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-2">
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}
