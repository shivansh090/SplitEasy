import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Try "I paid 500 for coffee, split with Rahul"'
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder:text-gray-400 disabled:opacity-50"
        style={{ maxHeight: '120px' }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        {disabled ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    </form>
  );
}
