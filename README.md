# CyberAudit 360 — Experiment 2 (React Hooks)

## Run it
```bash
npm install
npm run dev
```
Then log in with any email + password (auth is simulated — real backend comes in Experiment 4).

## What this experiment covers
Five reusable custom hooks, each wrapping a simulated API call (`setTimeout` standing
in for `fetch`, so swapping in real endpoints in Experiment 4 is a one-line change per hook):

- `src/context/AuthContext.jsx` — shared authentication context and provider
- `src/hooks/useAuth.js` — reusable access to login/logout and session state
- `src/hooks/useAuditLogs.js` — fetch + client-side search/filter, used by Audit Logs
- `src/hooks/useAlerts.js` — fetch + resolve action, used by Dashboard & Alerts
- `src/hooks/useUsers.js` — fetch + invite-user form submission, used by Users page
- `src/hooks/useBackups.js` — fetch + create/restore actions, used by Backups page

Pages under `src/pages/` are the components that consume these hooks and the forms
that trigger their actions. `src/components/` holds the shared Sidebar/Navbar/Layout.
