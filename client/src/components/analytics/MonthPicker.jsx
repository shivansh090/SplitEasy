const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(m, y) {
  return new Date(y, m, 0).getDate();
}

export default function MonthPicker({ month, year, day, onChange }) {
  const now = new Date();
  const currentMonth = month || null;
  const currentYear = year || now.getFullYear();
  const currentDay = day || null;

  const goPrev = () => {
    if (currentDay && currentMonth) {
      if (currentDay === 1) {
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        onChange(prevMonth, prevYear, daysInMonth(prevMonth, prevYear));
      } else {
        onChange(currentMonth, currentYear, currentDay - 1);
      }
    } else if (currentMonth) {
      onChange(currentMonth === 1 ? 12 : currentMonth - 1, currentMonth === 1 ? currentYear - 1 : currentYear, null);
    } else {
      onChange(12, currentYear - 1, null);
    }
  };

  const goNext = () => {
    if (currentDay && currentMonth) {
      const maxDay = daysInMonth(currentMonth, currentYear);
      if (currentDay >= maxDay) {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        onChange(nextMonth, nextYear, 1);
      } else {
        onChange(currentMonth, currentYear, currentDay + 1);
      }
    } else if (currentMonth) {
      onChange(currentMonth === 12 ? 1 : currentMonth + 1, currentMonth === 12 ? currentYear + 1 : currentYear, null);
    }
  };

  const getLabel = () => {
    if (currentDay && currentMonth) {
      return `${currentDay} ${MONTHS[currentMonth - 1]} ${currentYear}`;
    }
    if (currentMonth) return `${MONTHS[currentMonth - 1]} ${currentYear}`;
    return 'All Time';
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
      {/* Granularity toggle */}
      <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-md">
        <button
          onClick={() => onChange(null, null, null)}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            !currentMonth && !currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            if (currentDay) onChange(currentMonth, currentYear, null);
            else if (!currentMonth) onChange(now.getMonth() + 1, now.getFullYear(), null);
          }}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            currentMonth && !currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => {
            // Default to today
            if (!currentDay) {
              onChange(
                currentMonth || now.getMonth() + 1,
                currentYear || now.getFullYear(),
                now.getDate()
              );
            }
          }}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Day
        </button>
      </div>

      {/* Nav arrows + label */}
      <div className="flex items-center gap-1">
        <button onClick={goPrev} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Tappable date label — tap to open native date picker on mobile */}
        <label className="relative cursor-pointer">
          <span className="text-sm font-medium text-gray-700 min-w-[90px] sm:min-w-[110px] text-center block">
            {getLabel()}
          </span>
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            value={
              currentDay && currentMonth
                ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`
                : currentMonth
                ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
                : ''
            }
            onChange={(e) => {
              const d = new Date(e.target.value);
              if (!isNaN(d.getTime())) {
                onChange(d.getMonth() + 1, d.getFullYear(), d.getDate());
              }
            }}
          />
        </label>

        <button
          onClick={goNext}
          disabled={!currentMonth}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
