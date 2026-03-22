import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SVGLineChart({ data, label }) {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 16, bottom: 32, left: 8 };
  const width = 400;
  const height = 180;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const points = data.map((d, i) => ({
    x: padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padding.top + chartH - (d.total / maxVal) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding.left}
          y1={padding.top + chartH * (1 - ratio)}
          x2={padding.left + chartW}
          y2={padding.top + chartH * (1 - ratio)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px]" fill="#6366f1" fontWeight="600">
            {formatCurrency(p.total)}
          </text>
          <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px]" fill="#94a3b8" fontWeight="500">
            {label(p)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function MonthlyTrendChart({ data, dailyData }) {
  const [view, setView] = useState('monthly');

  const hasDaily = dailyData && dailyData.length > 0;
  const hasMonthly = data && data.length > 0;

  if (!hasMonthly && !hasDaily) {
    return <p className="text-center text-gray-400 text-sm py-6">No trend data yet</p>;
  }

  const currentData = view === 'daily' ? (dailyData || []) : (data || []);

  const labelFn = view === 'daily'
    ? (p) => `${p.day || ''}`
    : (p) => MONTHS[(p.month || 1) - 1];

  return (
    <div>
      {/* Always show both toggles */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setView('monthly')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            view === 'monthly' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setView('daily')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            view === 'daily' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Daily
        </button>
      </div>
      {currentData.length > 0 ? (
        <SVGLineChart data={currentData} label={labelFn} />
      ) : (
        <p className="text-center text-gray-400 text-sm py-6">
          {view === 'daily' ? 'Select a month to see daily breakdown' : 'No monthly data yet'}
        </p>
      )}
    </div>
  );
}
