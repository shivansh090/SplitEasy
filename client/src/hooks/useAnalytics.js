import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';

const CACHE_TTL = 60000; // 1 minute

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  const buildParams = (month, year, day) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (day) params.day = day;
    return { params };
  };

  const cacheKey = (prefix, month, year, day) => `${prefix}-${month || 0}-${year || 0}-${day || 0}`;

  const fetchWithCache = async (key, url, month, year, day) => {
    const cached = cache.current[key];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setAnalytics(cached.data);
      return cached.data;
    }

    setLoading(true);
    try {
      const res = await api.get(url, buildParams(month, year, day));
      const data = res.data.data;
      cache.current[key] = { data, ts: Date.now() };
      setAnalytics(data);
      return data;
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => { cache.current = {}; };

  const fetchDashboardAnalytics = useCallback(async (month, year, day) => {
    return fetchWithCache(cacheKey('dash', month, year, day), '/analytics/dashboard', month, year, day);
  }, []);

  const fetchPersonalAnalytics = useCallback(async (month, year, day) => {
    return fetchWithCache(cacheKey('pers', month, year, day), '/analytics/personal', month, year, day);
  }, []);

  const fetchGroupAnalytics = useCallback(async (groupId, month, year, day) => {
    return fetchWithCache(cacheKey(`grp-${groupId}`, month, year, day), `/analytics/groups/${groupId}`, month, year, day);
  }, []);

  return {
    analytics,
    loading,
    fetchDashboardAnalytics,
    fetchPersonalAnalytics,
    fetchGroupAnalytics,
    invalidateCache,
  };
}
