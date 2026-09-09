# CyberAudit 360 — Experiments 2 and 3

## Run it
```bash
npm install
npm run dev
```
Then log in with any email + password (auth is simulated — real backend comes in Experiment 4).

## Experiment 2: React Hooks
Five reusable custom hooks, each wrapping a simulated API call (`setTimeout` standing
in for `fetch`, so swapping in real endpoints in Experiment 4 is a one-line change per hook):

- `src/hooks/useAuth.jsx` — login/logout, session state, used by the Login form
- `src/hooks/useAuditLogs.js` — client-side search/filter over the shared audit-log state
- `src/hooks/useAlerts.js` — reusable access to shared security-alert state
- `src/hooks/useUsers.js` — fetch + invite-user form submission, used by Users page
- `src/hooks/useBackups.js` — fetch + create/restore actions, used by Backups page

Pages under `src/pages/` are the components that consume these hooks and the forms
that trigger their actions. `src/components/` holds the shared Sidebar/Navbar/Layout.

## Experiment 3: Context API global state

`src/context/SecurityContext.jsx` provides the application-wide `auditLogs` and
`securityAlerts` state. It exposes `addAuditLog()` and `resolveAlert()` actions.
The provider wraps the routed app in `src/App.jsx`, so the Dashboard, Audit Logs,
Alerts, and Sidebar automatically re-render after a security event is simulated or
an alert is resolved.
