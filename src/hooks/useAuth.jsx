import { useState, useCallback, createContext, useContext, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cyberaudit_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cyberaudit_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate or refresh profile with Bearer token on initialization
  useEffect(() => {
    if (token && !user) {
      fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((profile) => {
          if (profile) {
            setUser(profile);
            localStorage.setItem('cyberaudit_user', JSON.stringify(profile));
          } else {
            logout();
          }
        })
        .catch(() => {
          // If offline, keep local state
        });
    }
  }, [token]);

  // Login handler connected to Experiment 5 POST /api/users/login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (data.errors && data.errors[0]?.msg) || 'Login failed');
      }

      setToken(data.token);
      localStorage.setItem('cyberaudit_token', data.token);

      // Save user from login response or fetch from profile endpoint
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('cyberaudit_user', JSON.stringify(data.user));
      }

      // Sync user profile using the newly issued JWT
      try {
        const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem('cyberaudit_user', JSON.stringify(profileData));
        }
      } catch {
        // Keep login response user
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registration handler connected to Experiment 6 POST /api/users/register
  const register = useCallback(async (name, email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || (data.errors && data.errors[0]?.msg) || 'Registration failed'
        );
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin access test endpoint connected to GET /api/users/admin
  const checkAdminAccess = useCallback(async () => {
    if (!token) return { ok: false, status: 401, message: 'No token' };
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      return { ok: false, status: 500, error: err.message };
    }
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cyberaudit_token');
    localStorage.removeItem('cyberaudit_user');
  }, []);

  const value = {
    user,
    token,
    role: user?.role || 'user',
    isAdmin: user?.role === 'admin',
    loading,
    error,
    login,
    register,
    logout,
    checkAdminAccess,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Reusable hook: any component calls useAuth() to get auth state + actions
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
