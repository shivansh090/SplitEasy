import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const buildParams = (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return { params };
  };

  const fetchDashboardAnalytics = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard', buildParams(month, year));
      setAnalytics(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('Failed to fetch dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPersonalAnalytics = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/personal', buildParams(month, year));
      setAnalytics(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('Failed to fetch personal analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupAnalytics = useCallback(async (groupId, month, year) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/groups/${groupId}`, buildParams(month, year));
      setAnalytics(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('Failed to fetch group analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    fetchDashboardAnalytics,
    fetchPersonalAnalytics,
    fetchGroupAnalytics,
  };
}
