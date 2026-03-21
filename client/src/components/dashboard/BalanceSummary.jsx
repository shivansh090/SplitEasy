import { formatCurrency } from '../../utils/formatCurrency';
import Avatar from '../ui/Avatar';

export default function BalanceSummary({ balances }) {
  if (!balances || balances.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        No expenses yet
      </div>
    );
  }

  const sorted = [...balances].sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-2">
      {sorted.map((b) => (
        <div
          key={b.userId}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Avatar name={b.name} size="sm" />
            <span className="text-sm font-medium text-gray-700">{b.name}</span>
          </div>
          <span
            className={`text-sm font-semibold ${
              b.balance > 0
                ? 'text-green-600'
                : b.balance < 0
                ? 'text-red-600'
                : 'text-gray-400'
            }`}
          >
            {b.balance > 0 && '+'}
            {formatCurrency(b.balance)}
          </span>
        </div>
      ))}
    </div>
  );
}
