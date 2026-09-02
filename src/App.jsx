import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import Backups from './pages/Backups';
import { Reports, Settings, DatabaseActivity, Landing } from './pages/Static';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/users" element={<Users />} />
        <Route path="/database" element={<DatabaseActivity />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
