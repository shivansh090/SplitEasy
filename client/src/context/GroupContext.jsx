import { createContext, useState, useCallback } from 'react';
import api from '../api/axios';

export const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data.data.groups);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroup = useCallback(async (groupId) => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}`);
      setCurrentGroup(res.data.data.group);
      return res.data.data.group;
    } catch (err) {
      console.error('Failed to fetch group:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = async (name, description) => {
    const res = await api.post('/groups', { name, description });
    const newGroup = res.data.data.group;
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const joinGroup = async (inviteCode) => {
    const res = await api.post(`/groups/${inviteCode}/join`, { inviteCode });
    const joined = res.data.data.group;
    setGroups((prev) => [joined, ...prev]);
    return joined;
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        loading,
        fetchGroups,
        fetchGroup,
        createGroup,
        joinGroup,
        setCurrentGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}
