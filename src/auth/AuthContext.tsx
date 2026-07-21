import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchAgentMe,
  loginAgent,
  type Agent,
} from '../api/agent';
import {ApiError, getStoredToken, setStoredToken} from '../api/client';

type AuthContextValue = {
  agent: Agent | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setAgent: (agent: Agent | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setAgent(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAgentMe();
      setAgent(data.agent);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setStoredToken(null);
      }
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginAgent(email, password);
    setStoredToken(data.token);
    setAgent(data.agent);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setAgent(null);
  }, []);

  const value = useMemo(
    () => ({agent, loading, login, logout, refresh, setAgent}),
    [agent, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
