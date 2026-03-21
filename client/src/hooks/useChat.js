import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useChat(groupId) {
  const [messages, setMessages] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/messages`);
      setMessages(res.data.data.messages);
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
      setBalances(res.data.data.balances);
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

      // Re-fetch all messages so we get every expense card
      await fetchMessages();

      if (newBalances) {
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
