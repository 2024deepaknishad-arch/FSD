import { createContext, useCallback, useState } from 'react';

export const AuthContext = createContext(null);

// Simulated API call. Replace this with fetch('/api/auth/login') in Experiment 4.
function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          token: 'demo.jwt.token',
          user: { name: 'Admin User', email, role: 'ADMIN' },
        });
      } else {
        reject(new Error('Email and password are required.'));
      }
    }, 600);
  });
}

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
    setError(null);
  }, []);

  const value = { user, role: user?.role ?? null, token, loading, error, login, logout, isAuthenticated: !!token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
