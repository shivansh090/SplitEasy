import { useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(m, y) {
  return new Date(y, m, 0).getDate();
}

export default function MonthPicker({ month, year, day, onChange }) {
  const [showDayPicker, setShowDayPicker] = useState(false);
  const now = new Date();
  const currentMonth = month || null;
  const currentYear = year || now.getFullYear();
  const currentDay = day || null;

  const goPrev = () => {
    if (currentDay && currentMonth) {
      // Go to previous day
      if (currentDay === 1) {
        // Go to last day of previous month
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

  const handleDaySelect = (d) => {
    onChange(currentMonth, currentYear, d);
    setShowDayPicker(false);
  };

  const switchToMonth = () => {
    if (currentDay) {
      onChange(currentMonth, currentYear, null);
    } else if (!currentMonth) {
      onChange(now.getMonth() + 1, now.getFullYear(), null);
    }
  };

  const switchToDay = () => {
    if (!currentMonth) {
      onChange(now.getMonth() + 1, now.getFullYear(), now.getDate());
    } else if (!currentDay) {
      setShowDayPicker(true);
    }
  };

  return (
    <div className="flex items-center gap-1.5 relative">
      {/* Granularity toggle */}
      <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-md mr-1">
        <button
          onClick={() => onChange(null, null, null)}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            !currentMonth && !currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={switchToMonth}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            currentMonth && !currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Month
        </button>
        <button
          onClick={switchToDay}
          className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
            currentDay ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Day
        </button>
      </div>

      {/* Nav arrows */}
      <button
        onClick={goPrev}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[110px] text-center">
        {getLabel()}
      </span>
      <button
        onClick={goNext}
        disabled={!currentMonth}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Day picker dropdown */}
      {showDayPicker && currentMonth && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20 w-56">
          <p className="text-xs text-gray-500 font-medium mb-2">
            Pick a day in {MONTHS[currentMonth - 1]} {currentYear}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                onClick={() => handleDaySelect(d)}
                className="w-7 h-7 text-xs rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-gray-700"
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDayPicker(false)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
