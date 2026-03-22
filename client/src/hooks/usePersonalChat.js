import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';

export function usePersonalChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const fetched = useRef(false);

  const fetchMessages = useCallback(async (force = false) => {
    if (fetched.current && !force) return;
    setLoading(true);
    try {
      const res = await api.get('/personal/messages');
      setMessages(res.data.data.messages);
      fetched.current = true;
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
      await fetchMessages(true); // force refetch after send
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
