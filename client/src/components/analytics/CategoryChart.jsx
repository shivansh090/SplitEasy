import { formatCurrency } from '../../utils/formatCurrency';

const CATEGORY_COLORS = {
  food: { bg: 'bg-amber-400', bar: 'bg-amber-400', text: 'text-amber-600' },
  transport: { bg: 'bg-sky-400', bar: 'bg-sky-400', text: 'text-sky-600' },
  shopping: { bg: 'bg-rose-400', bar: 'bg-rose-400', text: 'text-rose-600' },
  entertainment: { bg: 'bg-violet-400', bar: 'bg-violet-400', text: 'text-violet-600' },
  bills: { bg: 'bg-slate-400', bar: 'bg-slate-400', text: 'text-slate-600' },
  rent: { bg: 'bg-red-400', bar: 'bg-red-400', text: 'text-red-600' },
  groceries: { bg: 'bg-emerald-400', bar: 'bg-emerald-400', text: 'text-emerald-600' },
  medical: { bg: 'bg-teal-400', bar: 'bg-teal-400', text: 'text-teal-600' },
  travel: { bg: 'bg-indigo-400', bar: 'bg-indigo-400', text: 'text-indigo-600' },
  general: { bg: 'bg-gray-300', bar: 'bg-gray-300', text: 'text-gray-500' },
};

const CATEGORY_ICONS = {
  food: '\uD83C\uDF54', transport: '\uD83D\uDE97', shopping: '\uD83D\uDECD\uFE0F',
  entertainment: '\uD83C\uDFAC', bills: '\uD83D\uDCCB', rent: '\uD83C\uDFE0',
  groceries: '\uD83E\uDED2', medical: '\uD83C\uDFE5', travel: '\u2708\uFE0F', general: '\uD83D\uDCB0',
};

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-6">No expense data</p>;
  }

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <div className="space-y-3.5">
      {data.map((item) => {
        const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;
        return (
          <div key={item.category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{CATEGORY_ICONS[item.category] || '\uD83D\uDCB0'}</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                <span className={`text-xs font-medium ${colors.text} bg-gray-50 px-1.5 py-0.5 rounded`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                style={{ width: `${maxTotal > 0 ? (item.total / maxTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
