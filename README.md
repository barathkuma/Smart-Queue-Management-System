# 🚀 Smart Queue Management System
> *"Join the Queue. Track Your Turn. Save Your Time."*

A production-grade, full-stack Smart Queue Management System built with a decoupled modern architecture:
- **Backend**: Django 5 + Django REST Framework + SimpleJWT + SQLite (with dynamic PostgreSQL & MySQL support via `.env`)
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts + React Router DOM

---

## 🌟 Phased Roadmap

| Phase | Milestone | Focus | Status |
|---|---|---|---|
| **Phase 1** | **Foundation & Auth** | Backend Setup, Custom User Model, JWT Auth, Role Permissions, React Frontend & AuthContext | ✅ **Completed** |
| **Phase 2** | **Services & Queue Engine** | Service Categories, Counter Controls, Token Engine (`A-001`, `B-024`), FIFO Ordering, Live Status | ✅ **Completed** |
| **Phase 3** | **User Queue Experience** | Queue position, estimated wait time, active-token status, and queue-status views | ✅ **Completed** |
| **Phase 4** | **Staff Queue Control** | Staff dashboard with Call Next, Start Serving, Complete, Skip, and Recall actions | ✅ **Completed** |
| **Phase 5** | **Admin Console** | Admin dashboard, service management, queue overview, and system health view | ✅ **Completed** |
| **Phase 6** | **Live Notifications** | Turn Approaching Alerts, Sound Chimes, Position Drift Notifications | Planned |
| **Phase 7** | **Analytics & Reports** | Average wait time, service volume, daily throughput, and peak-hours metrics | ✅ **Completed** |
| **Phase 8** | **UI/UX Polish** | Glass-style admin interface and interface transitions; theme switching and sound effects remain future work | 🟡 **In Progress** |
| **Phase 9** | **Automated Testing** | Django API tests and Playwright end-to-end test coverage; full E2E execution remains environment-dependent | 🟡 **In Progress** |
| **Phase 10** | **Demo Seed Data & Docs** | Demo services, users, and queue records via `seed_data`, plus README setup and API documentation | ✅ **Completed** |

---

## ⚡ Quick Start

### 1. Backend Setup (Django REST API)
```bash
cd smart-queue/backend

# 1. Install dependencies
python -m pip install -r requirements.txt

# 2. Run migrations
python manage.py makemigrations services queues accounts
python manage.py migrate

# 3. Seed demo services and accounts
python manage.py seed_data

# 4. Run automated test suite (accounts, services, queues)
python manage.py test

# 5. Start development server (Port 8000)
python manage.py runserver 8000
```

### 2. Frontend Setup (React + Vite + Tailwind)
```bash
cd smart-queue/frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server (Port 5173 with proxy to backend)
npm run dev
```

Visit: **`http://localhost:5173`**

---

## 🔐 Default Demo Accounts (Pre-Seeded)

The login screen features **1-Click Demo Fill buttons** for rapid testing:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Customer / User** | `user@smartqueue.com` | `Password123!` | Customer Queue Portal (`/dashboard`) |
| **Counter Staff** | `staff@smartqueue.com` | `Password123!` | Staff Desk Station (`/staff/dashboard`) |
| **Administrator** | `admin@smartqueue.com` | `Password123!` | Full System Admin Console (`/admin/dashboard`) |

---

## 🔌 API Endpoints Reference

### 1. Health & Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health/` | System & DB health check | No |
| `POST` | `/api/auth/register/` | Register new user + return JWT | No |
| `POST` | `/api/auth/login/` | Authenticate email/password + return JWT | No |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Fetch authenticated user profile | Yes (Bearer) |
| `PATCH` | `/api/auth/me/` | Update authenticated profile | Yes (Bearer) |
| `POST` | `/api/auth/logout/` | Invalidate & blacklist refresh token | Yes (Bearer) |

### 2. Services Management (`/api/services/`)
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/services/` | List active services (pass `?all=true` for admin) | Authenticated |
| `POST` | `/api/services/` | Create a new service department | `ADMIN` only |
| `GET` | `/api/services/<id>/` | Retrieve service details | Authenticated |
| `PUT/PATCH` | `/api/services/<id>/` | Update service configuration | `ADMIN` only |
| `DELETE` | `/api/services/<id>/` | Remove a service department | `ADMIN` only |

### 3. Customer Queue Operations (`/api/queue/`)
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `POST` | `/api/queue/join/` | Join service queue and generate virtual token | Authenticated (`USER`) |
| `GET` | `/api/queue/my-token/` | Retrieve user's currently active token & live wait times | Authenticated (`USER`) |
| `GET` | `/api/queue/status/` | Overall queue status across all services + active token | Authenticated |
| `GET` | `/api/queue/history/` | User's past token history | Authenticated |
| `POST` | `/api/queue/cancel/` | Cancel user's active waiting token | Authenticated |

#### Join Queue Payload & Response
**Request**:
```json
POST /api/queue/join/
{
  "service_id": 1
}
```

**Response (HTTP 201 Created)**:
```json
{
  "message": "Successfully joined queue for General Consultation!",
  "token_number": "A-001",
  "people_ahead": 0,
  "estimated_wait_time": 0,
  "status": "WAITING",
  "token": {
    "id": 1,
    "token_number": "A-001",
    "service": {
      "id": 1,
      "name": "General Consultation",
      "prefix": "A",
      "average_service_time": 5
    },
    "people_ahead": 0,
    "estimated_wait_time": 0,
    "status": "WAITING",
    "joined_at": "2026-08-31T19:20:00Z"
  }
}
```

### 4. Staff Queue Controls (`/api/queue/`)
| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `POST` | `/api/queue/call-next/` | Call the next waiting token in FIFO order (row-locked) | `STAFF` / `ADMIN` |
| `POST` | `/api/queue/start/` | Mark a called token as actively being served | `STAFF` / `ADMIN` |
| `POST` | `/api/queue/complete/` | Mark service completed | `STAFF` / `ADMIN` |
| `POST` | `/api/queue/skip/` | Mark customer absent / skipped | `STAFF` / `ADMIN` |
| `POST` | `/api/queue/recall/` | Re-call / announce token to counter | `STAFF` / `ADMIN` |

---

## 🗄️ Database Configuration

By default, the backend runs on **SQLite** with zero configuration required.
To switch to **PostgreSQL** or **MySQL**, simply adjust `backend/.env`:

```env
# PostgreSQL Configuration
DB_ENGINE=postgresql
DB_NAME=smartqueue_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```
