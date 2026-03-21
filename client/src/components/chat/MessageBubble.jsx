import Avatar from '../ui/Avatar';
import { formatTime } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

function ExpenseCard({ data }) {
  let parsed;
  try {
    parsed = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-primary-100 rounded-full p-1.5">
          <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <span className="font-semibold text-primary-800 text-lg">
          {formatCurrency(parsed.amount)}
        </span>
      </div>
      <p className="text-sm text-gray-700 font-medium">{parsed.description}</p>
      <p className="text-xs text-gray-500 mt-1">
        Paid by <span className="font-medium">{parsed.paidBy}</span>
        {parsed.category && parsed.category !== 'general' && (
          <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
            {parsed.category}
          </span>
        )}
      </p>
      {parsed.splits && (
        <div className="mt-2 pt-2 border-t border-primary-200 space-y-1">
          {parsed.splits.map((s, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-600">
              <span>{s.name}</span>
              <span className="font-medium">{formatCurrency(s.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message, isOwn }) {
  const { type, content, sender, createdAt } = message;

  if (type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  if (type === 'expense_created') {
    return (
      <div className="flex justify-center my-3">
        <ExpenseCard data={content} />
      </div>
    );
  }

  const isAi = type === 'ai_response';

  return (
    <div className={`flex gap-2 my-2 ${isOwn && !isAi ? 'flex-row-reverse' : ''}`}>
      {!isOwn || isAi ? (
        <Avatar
          name={isAi ? 'SE' : sender?.name || '?'}
          size="sm"
          className={`flex-shrink-0 mt-1 ${isAi ? '!bg-primary-600' : ''}`}
        />
      ) : null}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn && !isAi
            ? 'bg-primary-600 text-white rounded-br-md'
            : isAi
            ? 'bg-gray-100 text-gray-800 rounded-bl-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {!isOwn && !isAi && sender?.name && (
          <p className="text-xs font-semibold text-primary-700 mb-0.5">
            {sender.name}
          </p>
        )}
        {isAi && (
          <p className="text-xs font-semibold text-primary-600 mb-0.5">
            SplitEasy
          </p>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {createdAt && (
          <p
            className={`text-[10px] mt-1 ${
              isOwn && !isAi ? 'text-primary-200' : 'text-gray-400'
            }`}
          >
            {formatTime(createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}
