import { formatCurrency } from '../../utils/formatCurrency';
import Avatar from '../ui/Avatar';

export default function MemberBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-4">No data</p>;
  }

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <div className="space-y-3">
      {data.map((member) => (
        <div key={member.userId}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar name={member.name} size="sm" />
              <span className="text-sm font-medium text-gray-700">{member.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(member.total)}</span>
              <span className="text-xs text-gray-400 w-10 text-right">{member.percentage}%</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${maxTotal > 0 ? (member.total / maxTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
