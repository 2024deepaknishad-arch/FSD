import { useState, useCallback, createContext, useContext } from 'react';

// Simulated API call. Swap this for a real fetch('/api/auth/login') in Experiment 4.
function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          token: 'demo.jwt.token',
          user: { name: email.split('@')[0] || 'Admin', email, role: 'Admin' },
        });
      } else {
        reject(new Error('Email and password are required.'));
      }
    }, 600);
  });
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password);
      setUser(data.user);
      setToken(data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = { user, token, loading, error, login, logout, isAuthenticated: !!token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Reusable hook: any component calls useAuth() to get auth state + actions.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
