# CyberAudit 360

Full-Stack Cybersecurity Auditing and Database Activity Monitoring Application.

---

## Experiment 7: Containerize Frontend and Backend with Docker & Docker Compose

In Experiment 7, both the React/Vite frontend and the Node.js/Express backend are containerized into standalone Docker images and orchestrated simultaneously using Docker Compose on a shared bridge network.

### Prerequisites

- **Docker Desktop for Windows** (v28.x+ or v29.x+) with Linux containers enabled.
- **Node.js** (v18+ or v20+) and **npm** (for local development).
- Active **MongoDB Atlas** database cluster and connection string.

### Environment Variable Setup

The backend connects securely to MongoDB Atlas using environment variables. Secret credentials are never baked into Docker images or committed to version control.

1. Locate or create `backend/.env` (using `backend/.env.example` as a template):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   ADMIN_SECRET=your_admin_secret_key
   ```
2. Verify that `MONGO_URI` points to your active MongoDB Atlas database.

---

### Running the Application with Docker Compose

Ensure Docker Desktop is running before executing these commands in the project root:

#### 1. Validate Compose Configuration
```bash
docker compose config
```

#### 2. Build the Docker Images
```bash
docker compose build
```

#### 3. Start Both Containers in the Background
```bash
docker compose up -d
```

#### 4. Verify Container Status
```bash
docker compose ps
```
Expected output:
Both `cyberaudit360-backend` (port `5000:5000`) and `cyberaudit360-frontend` (port `3000:80`) should show state `running` / `Up`.

#### 5. Inspect Application Logs
```bash
# View combined logs:
docker compose logs

# Follow backend logs specifically:
docker compose logs -f backend

# Follow frontend Nginx logs:
docker compose logs -f frontend
```

#### 6. Stop the Application
```bash
docker compose down
```

---

### Accessing the Application

| Service | Host URL | Description |
| :--- | :--- | :--- |
| **Frontend (React)** | [http://localhost:3000](http://localhost:3000) | Complete CyberAudit 360 web application served via Nginx |
| **Docker Exp 7 Status** | [http://localhost:3000/docker](http://localhost:3000/docker) | Dedicated verification page displaying backend live response & diagnostics |
| **Backend API Root** | [http://localhost:5000/](http://localhost:5000/) | Express API Health check endpoint |
| **Backend Exp 7 API** | [http://localhost:5000/api](http://localhost:5000/api) | Returns `{ message: "Backend is running inside Docker!" }` |
| **Audit Logs API** | [http://localhost:5000/api/auditlogs](http://localhost:5000/api/auditlogs) | Audit log CRUD REST endpoint (Atlas DB) |
| **Auth Profile API** | [http://localhost:5000/api/users/profile](http://localhost:5000/api/users/profile) | JWT protected user profile endpoint |

---

### Rebuilding After Code Changes

When you modify frontend or backend source files, rebuild and restart the containers with:

```bash
docker compose up --build -d
```

---

### Troubleshooting

1. **Docker daemon connection error (`cannot find the file specified` / `engine not running`)**:
   - Ensure Docker Desktop is launched and the whale icon is visible in the Windows system tray.
   - Wait 15–30 seconds for the Docker Linux engine to initialize before running `docker compose up`.

2. **Port Conflict (`bind: address already in use` on port 3000 or 5000)**:
   - Identify processes holding the port: `Get-NetTCPConnection -LocalPort 5000, 3000`
   - Either terminate the conflicting host application, or modify host port mappings in `compose.yaml` (e.g. `"3001:80"` or `"5001:5000"`).

3. **MongoDB Atlas Connection Error**:
   - Ensure `MONGO_URI` is correctly defined in `backend/.env`.
   - In MongoDB Atlas Network Access settings, ensure your current IP address (or `0.0.0.0/0` for development/containers) is whitelisted so Docker containers can reach Atlas.

4. **Frontend-to-Backend Communication**:
   - Frontend runs inside the user's browser on the host machine. By default, API requests target `http://localhost:5000`.
   - In addition, Nginx in the frontend container reverse-proxies `/api/` directly to `http://backend:5000/api/` across the internal Docker bridge network (`cyberaudit-network`).

---

## Previous Experiments Preserved

- **Experiment 1**: Tailwind CSS design system, dark-mode cybersecurity aesthetic, responsive layout.
- **Experiment 2**: Reusable React custom hooks (`useAuth`, `useAuditLogs`, `useAlerts`, `useUsers`, `useBackups`).
- **Experiment 3**: React Context API (`SecurityContext`) for global application state.
- **Experiment 4**: Express REST API with MongoDB Atlas and Mongoose `AuditLog` CRUD.
- **Experiment 5**: Secure REST APIs with Helmet headers, CORS policies, rate limiting, and input validation.
- **Experiment 6**: JWT authentication, bcryptjs password hashing, role authorization (`admin` vs `user`), and protected routes.
