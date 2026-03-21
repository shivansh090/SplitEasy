import { useState, useCallback } from 'react';
import api from '../api/axios';

export function usePersonalChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/personal/messages');
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error('Failed to fetch personal messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (content) => {
    setSending(true);
    try {
      const res = await api.post('/personal/chat', { content });
      const { aiMessage, expense } = res.data.data;

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString() + '-user',
          type: 'user_message',
          content,
          sender: JSON.parse(localStorage.getItem('user')),
          createdAt: new Date().toISOString(),
        },
        ...(expense
          ? [
              {
                _id: Date.now().toString() + '-expense',
                type: 'expense_created',
                content: JSON.stringify({
                  description: expense.description,
                  amount: expense.amount,
                  paidBy: expense.paidBy?.name || 'You',
                  category: expense.category,
                  splits: [],
                }),
                relatedExpense: expense,
                createdAt: new Date().toISOString(),
              },
            ]
          : []),
        {
          _id: Date.now().toString() + '-ai',
          type: 'ai_response',
          content: aiMessage,
          createdAt: new Date().toISOString(),
        },
      ]);

      return res.data.data;
    } catch (err) {
      console.error('Failed to send personal message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, fetchMessages, sendMessage };
}
