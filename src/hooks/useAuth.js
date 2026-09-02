import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Reusable hook: any component can access the signed-in user, role, and auth actions.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
