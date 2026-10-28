# CyberAudit 360

Full-Stack Cybersecurity Auditing, Database Activity Monitoring, and Real-Time WebSocket Communication Platform.

---

## Project Architecture & Directory Structure

CyberAudit 360 follows a clean, decoupled two-tier architecture:

```
CyberAudit360/
├── frontend/                                   # React, Vite, Tailwind CSS, Socket.IO Client
│   ├── src/                                    # Components, pages, hooks, context, socket service
│   ├── public/                                 # Static assets & icons
│   ├── index.html                              # SPA entrypoint
│   ├── package.json                            # Frontend dependencies & scripts
│   ├── package-lock.json                       # Reproducible dependency lockfile
│   ├── Dockerfile                              # Multi-stage build (Vite + Nginx)
│   ├── .dockerignore                           # Build ignore configuration
│   ├── nginx.conf                              # Nginx reverse proxy configuration
│   ├── tailwind.config.js                      # Tailwind styling system tokens
│   ├── postcss.config.js                       # PostCSS configuration
│   ├── vite.config.js                          # Vite build tool configuration
│   └── .env.example                            # Frontend environment configuration template
├── backend/                                    # Express, MongoDB Atlas, Socket.IO Server
│   ├── controllers/                            # Route controllers (userController)
│   ├── middleware/                             # authMiddleware (JWT & RBAC), errorMiddleware
│   ├── models/                                 # Mongoose models (User, AuditLog)
│   ├── routes/                                 # Express routes (userRoutes, auditLogRoutes, alertRoutes)
│   ├── server.js                               # HTTP Server & Socket.IO initialization
│   ├── package.json                            # Backend dependencies & test scripts
│   ├── Dockerfile                              # Node.js Alpine container configuration
│   ├── .dockerignore                           # Backend build ignore configuration
│   ├── test_exp6.js                            # Automated Experiment 6 test suite
│   ├── test_exp8.js                            # Automated Experiment 8 test suite
│   └── .env.example                            # Backend environment configuration template
├── docker-compose.yml                          # Orchestrates frontend (5173) and backend (5000)
├── compose.exp7.yaml                           # Experiment 7 compose reference (Nginx production 3000)
├── test_exp7_verification.cjs                  # Automated Experiment 7 container test suite
├── test_exp9_verification.cjs                  # Automated Experiment 9 Docker Compose test suite
├── CyberAudit360_Experiment6.postman_collection.json # Postman API test collection
├── .env.example                                # Master environment template
└── .gitignore                                  # Git ignore rules
```

---

## Local Development Workflow

### 1. Backend Setup (Port 5000)
```bash
cd backend
npm install
npm start
# Or with hot-reloading:
npm run dev
```

### 2. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

### 3. Running Automated Tests
```bash
# In backend directory:
npm run test:exp8    # Runs 15 test cases verifying Socket.IO chat, alerts, & regressions
npm run test:exp6    # Runs 12 test cases verifying JWT auth, RBAC, & Atlas persistence

# In project root:
node test_exp9_verification.cjs  # Runs 14 test cases verifying Docker Compose setup
```

---

## Docker & Docker Compose (Experiment 9)

Both the React/Vite frontend and Node.js/Express backend run inside Docker containers orchestrated using `docker-compose.yml` with port 5173 mapped to the Vite dev server and port 5000 mapped to the Express + Socket.IO API.

### Prerequisites
- **Docker Desktop for Windows** (v28.x+ or v29.x+) with Linux engine enabled.
- Active **MongoDB Atlas** database cluster.

### Setup & Launch
1. Ensure `backend/.env` has a valid `MONGO_URI`.
2. Build container images:
   ```bash
   docker compose build
   ```
3. Launch both containers in detached mode:
   ```bash
   docker compose up -d
   ```
4. Verify running containers:
   ```bash
   docker compose ps
   ```
5. Inspect application logs:
   ```bash
   docker compose logs backend
   docker compose logs frontend
   ```
6. Run the automated container verification suite:
   ```bash
   node test_exp9_verification.cjs
   ```
7. Stop containers:
   ```bash
   docker compose down
   ```

### Accessing the Containerized Application
| Service | Host URL | Description |
| :--- | :--- | :--- |
| **Frontend (React / Vite)** | [http://localhost:5173](http://localhost:5173) | Complete CyberAudit 360 web application served via Vite container |
| **Docker Status Page** | [http://localhost:5173/docker](http://localhost:5173/docker) | Container diagnostics, live `/api` response, and Atlas status |
| **Real-Time Chat** | [http://localhost:5173/chat](http://localhost:5173/chat) | Real-time WebSocket chat and live security alerts |
| **Backend API Root** | [http://localhost:5000/](http://localhost:5000/) | Express API Health check endpoint |
| **Backend Health API** | [http://localhost:5000/api](http://localhost:5000/api) | Returns `{ message: "Backend is running inside Docker!" }` |
| **Security Alerts API** | [http://localhost:5000/api/alerts](http://localhost:5000/api/alerts) | Security alert simulation and feed endpoint |
| **Audit Logs API** | [http://localhost:5000/api/auditlogs](http://localhost:5000/api/auditlogs) | Audit log CRUD REST endpoint (Atlas DB) |

---

## Experiments Overview

- **Experiment 1**: Responsive Tailwind CSS UI, dark-mode cybersecurity aesthetic.
- **Experiment 2**: Reusable React custom hooks (`useAuth`, `useAuditLogs`, `useAlerts`, `useUsers`, `useBackups`).
- **Experiment 3**: React Context API (`SecurityContext`) for global application state.
- **Experiment 4**: Express REST API with MongoDB Atlas and Mongoose `AuditLog` CRUD.
- **Experiment 5**: Secure REST APIs with Helmet headers, CORS policies, rate limiting, and input validation.
- **Experiment 6**: JWT authentication, bcryptjs password hashing, role authorization (`admin` vs `user`), and protected routes.
- **Experiment 7**: Containerization with Dockerfiles, multi-stage Vite/Nginx build, and production port mappings.
- **Experiment 8**: Full-duplex real-time communication using Socket.IO (broadcast chat and live security alert bus).
- **Experiment 9**: Multi-container full-stack application deployment with Docker Compose (`docker-compose.yml`), container healthchecks, and live service orchestration.
