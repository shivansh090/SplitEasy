import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';

// Module-level cache — survives component unmount
const messageCache = { messages: null, ts: 0 };
const CACHE_TTL = 60000;

export function usePersonalChat() {
  const [messages, setMessages] = useState(messageCache.messages || []);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async (force = false) => {
    if (!force && messageCache.messages && Date.now() - messageCache.ts < CACHE_TTL) {
      setMessages(messageCache.messages);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/personal/messages');
      const data = res.data.data.messages;
      messageCache.messages = data;
      messageCache.ts = Date.now();
      setMessages(data);
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
      await fetchMessages(true); // force refetch + update cache
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
