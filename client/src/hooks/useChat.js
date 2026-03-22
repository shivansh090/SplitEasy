import { useState, useCallback } from 'react';
import api from '../api/axios';

// Module-level cache keyed by groupId — survives component unmount
const chatCache = {};
const CACHE_TTL = 60000;

export function useChat(groupId) {
  const cached = groupId && chatCache[groupId];
  const [messages, setMessages] = useState(cached?.messages || []);
  const [balances, setBalances] = useState(cached?.balances || []);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async (force = false) => {
    if (!groupId) return;
    const c = chatCache[groupId];
    if (!force && c?.messages && Date.now() - c.msgTs < CACHE_TTL) {
      setMessages(c.messages);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/messages`);
      const data = res.data.data.messages;
      if (!chatCache[groupId]) chatCache[groupId] = {};
      chatCache[groupId].messages = data;
      chatCache[groupId].msgTs = Date.now();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchBalances = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await api.get(`/groups/${groupId}/balances`);
      const data = res.data.data.balances;
      if (!chatCache[groupId]) chatCache[groupId] = {};
      chatCache[groupId].balances = data;
      setBalances(data);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    }
  }, [groupId]);

  const sendMessage = async (content) => {
    if (!groupId) return;
    setSending(true);
    try {
      const res = await api.post(`/groups/${groupId}/chat`, { content });
      const { balances: newBalances } = res.data.data;

      await fetchMessages(true); // force refetch + update cache

      if (newBalances) {
        if (!chatCache[groupId]) chatCache[groupId] = {};
        chatCache[groupId].balances = newBalances;
        setBalances(newBalances);
      }

      return res.data.data;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    balances,
    loading,
    sending,
    fetchMessages,
    fetchBalances,
    sendMessage,
  };
}
