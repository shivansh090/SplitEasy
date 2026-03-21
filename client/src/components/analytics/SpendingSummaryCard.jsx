import { formatCurrency } from '../../utils/formatCurrency';

export default function SpendingSummaryCard({ totalSpent = 0, expenseCount = 0, avgExpense = 0 }) {
  const items = [
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Expenses',
      value: expenseCount,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      iconBg: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Avg / Expense',
      value: formatCurrency(avgExpense),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${item.iconBg}`}>{item.icon}</div>
          </div>
          <p className="text-lg font-bold text-gray-900">{item.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
