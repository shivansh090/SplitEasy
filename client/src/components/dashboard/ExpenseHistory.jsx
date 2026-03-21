import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelative } from '../../utils/dateHelpers';
import Loader from '../ui/Loader';

export default function ExpenseHistory({ groupId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    api
      .get(`/groups/${groupId}/expenses`)
      .then((res) => setExpenses(res.data.data.expenses))
      .catch((err) => console.error('Failed to load expenses:', err))
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <Loader size="sm" className="py-4" />;

  if (expenses.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-4">No expenses yet</p>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto chat-scrollbar">
      {expenses.map((exp) => (
        <div
          key={exp._id}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {exp.description}
            </p>
            <p className="text-xs text-gray-500">
              Paid by {exp.paidBy?.name || 'Unknown'} &middot;{' '}
              {formatRelative(exp.createdAt)}
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-700 ml-2">
            {formatCurrency(exp.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
