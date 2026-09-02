import { useState, useEffect, useCallback } from 'react';

const MOCK_USERS = [
  { id: 1, initials: 'AD', name: 'Admin', email: 'admin@cyberaudit360.com', role: 'Admin', status: 'Active' },
  { id: 2, initials: 'PS', name: 'Priya Sharma', email: 'priya@company.com', role: 'Security Analyst', status: 'Active' },
  { id: 3, initials: 'RK', name: 'Rahul Khanna', email: 'rahul@company.com', role: 'Employee', status: 'Active' },
  { id: 4, initials: 'MV', name: 'Meera Verma', email: 'meera@company.com', role: 'Employee', status: 'Invited' },
];

// Simulated GET /api/users
function apiFetchUsers() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS), 500));
}

// Simulated POST /api/users (invite form submission)
function apiInviteUser({ name, email, role }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        initials: name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
        name,
        email,
        role,
        status: 'Invited',
      });
    }, 400);
  });
}

// Reusable hook: users list + an inviteUser() action for the invite form.
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetchUsers().then(setUsers).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const inviteUser = useCallback(async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const newUser = await apiInviteUser(formData);
      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { users, loading, submitting, error, inviteUser };
}
