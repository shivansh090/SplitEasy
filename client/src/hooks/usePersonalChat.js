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
      // Re-fetch all messages so we get every expense card the backend created
      await fetchMessages();
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
