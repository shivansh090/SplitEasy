const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthPicker({ month, year, onChange }) {
  const now = new Date();
  const currentMonth = month || null;
  const currentYear = year || now.getFullYear();

  const goPrev = () => {
    if (!currentMonth) {
      onChange(12, currentYear - 1);
    } else if (currentMonth === 1) {
      onChange(12, currentYear - 1);
    } else {
      onChange(currentMonth - 1, currentYear);
    }
  };

  const goNext = () => {
    if (!currentMonth) return;
    if (currentMonth === 12) {
      onChange(1, currentYear + 1);
    } else {
      onChange(currentMonth + 1, currentYear);
    }
  };

  const clearFilter = () => onChange(null, null);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goPrev}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
        {currentMonth ? `${MONTHS[currentMonth - 1]} ${currentYear}` : 'All Time'}
      </span>
      <button
        onClick={goNext}
        disabled={!currentMonth}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {currentMonth && (
        <button
          onClick={clearFilter}
          className="text-xs text-primary-600 hover:underline ml-1"
        >
          All
        </button>
      )}
    </div>
  );
}
