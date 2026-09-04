# Test Case Table - Smart Queue Management System

| Test Case ID | Module | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status | Severity | Evidence/Remarks |
|---|---|---|---|---|---|---|---|---|---|
| TC-001 | Auth | User Registration | None | POST /api/auth/register/ with valid data | Account created, JWT returned | As expected | PASS | High | Verified manually |
| TC-002 | Auth | Normal Login | Registered user | POST /api/auth/login/ with valid creds | Login successful, JWT returned | As expected | PASS | High | Verified manually |
| TC-003 | Auth | Invalid Login | Registered user | POST /api/auth/login/ with invalid creds | 400 Bad Request / Invalid credentials | As expected | PASS | High | Verified manually |
| TC-004 | Auth | Logout | Authenticated user | POST /api/auth/logout/ with refresh token | Token blacklisted, session cleared | As expected | PASS | Medium | Verified manually |
| TC-005 | Auth | JWT Refresh | Valid refresh token | POST /api/auth/refresh/ | New access token returned | As expected | PASS | Medium | Verified manually |
| TC-006 | Auth | Session Persistence | Auth token in storage | GET /api/auth/me/ with token | User profile returned | As expected | PASS | High | Verified manually |
| TC-007 | Security | ADMIN Role Escalation Prevention | None | POST /api/auth/register/ with role=ADMIN | User created with role=USER | As expected | PASS | Critical | Fixed vulnerability in serializers.py |
| TC-008 | Security | STAFF Role Escalation Prevention | None | POST /api/auth/register/ with role=STAFF | User created with role=USER | As expected | PASS | Critical | Fixed vulnerability in serializers.py |
| TC-009 | Auth | USER Authorization | Authenticated USER | GET /api/services/ | Services list returned | As expected | PASS | High | Verified manually |
| TC-010 | Auth | STAFF Authorization | Authenticated STAFF | POST /api/queue/call-next/ | Token called successfully | As expected | PASS | High | Verified manually |
| TC-011 | Auth | ADMIN Authorization | Authenticated ADMIN | GET /api/queue/analytics/ | Analytics data returned | As expected | PASS | High | Verified manually |
| TC-012 | Services | Service Listing | Authenticated user | GET /api/services/ | List of active services returned | As expected | PASS | Medium | Verified manually |
| TC-013 | Services | Service Selection | Authenticated user | Select service from list | Service details displayed | As expected | PASS | Medium | Verified via API |
| TC-014 | Queue | Join Queue | Authenticated user | POST /api/queue/join/ | Successfully joined, token returned | As expected | PASS | High | Verified manually |
| TC-015 | Queue | Token Generation | Join queue | - | Token number (e.g. A-001) generated | As expected | PASS | High | Verified manually |
| TC-016 | Queue | People Ahead Calculation | Multiple users in queue | Join queue | Correct number of people ahead | As expected | PASS | Medium | Verified manually |
| TC-017 | Queue | Estimated Waiting Time | Service avg time set | Join queue | wait_time = people_ahead * avg_time | As expected | PASS | Medium | Verified manually |
| TC-018 | Queue | Active Token Persistence | Join queue | GET /api/queue/my-token/ | Active token returned | As expected | PASS | High | Verified manually |
| TC-019 | Queue | Live Queue Status | Authenticated user | GET /api/queue/status/ | Summary of all services and current token | As expected | PASS | Medium | Verified manually |
| TC-020 | Queue | Token Cancellation | Active token exists | POST /api/queue/cancel/ | Token status changed to CANCELLED | As expected | PASS | High | Verified manually |
| TC-021 | Queue | Queue History | Past tokens exist | GET /api/queue/history/ | List of completed/cancelled tokens | As expected | PASS | Medium | Verified manually |
| TC-022 | Staff | Staff Queue Management | Authenticated STAFF | Call Next -> Start -> Complete | Token lifecycle managed correctly | As expected | PASS | High | Verified manually |
| TC-023 | Admin | Admin Dashboard | Authenticated ADMIN | GET /api/queue/analytics/ | Analytics metrics returned | As expected | PASS | High | Verified manually |
| TC-024 | Admin | Average Waiting Time Analytics | Completed tokens exist | GET /api/queue/analytics/ | avg_wait_times calculated correctly | As expected | PASS | Medium | Verified manually |
| TC-025 | Admin | Daily Throughput Analytics | Completed tokens exist | GET /api/queue/analytics/ | daily_throughput calculated correctly | As expected | PASS | Medium | Verified manually |
| TC-026 | Admin | Busiest Hours Analytics | Multiple join times | GET /api/queue/analytics/ | hourly_distribution calculated correctly | As expected | PASS | Medium | Verified manually |
| TC-027 | Admin | Service Volume Analytics | Tokens across services | GET /api/queue/analytics/ | service_volume calculated correctly | As expected | PASS | Medium | Verified manually |
| TC-028 | API | API Error Handling | Invalid request | POST /api/queue/join/ with missing data | 400 Bad Request with error details | As expected | PASS | Medium | Verified manually |
| TC-029 | Frontend | Protected Routes | Unauthenticated user | Access /dashboard | Redirected to /login | BLOCKED | High | Frontend server unstable in env |
| TC-030 | Frontend | Frontend Production Build | - | npm run build | Build completes without errors | As expected | PASS | High | Verified manually |
| TC-031 | Backend | Django System Check | - | python manage.py check | No system issues found | As expected | PASS | High | Verified manually |
| TC-032 | Backend | Django Automated Tests | - | python manage.py test | All tests passed | As expected | PASS | High | Verified manually |
| TC-033 | Database | Database/Migration Check | - | makemigrations --check / migrate --check | No pending migrations | As expected | PASS | High | Verified manually |
| TC-034 | E2E | Complete User E2E Workflow | - | Register -> Login -> Join -> Cancel | Full flow successful | BLOCKED | High | Frontend server unstable in env |
| TC-035 | E2E | Complete Staff E2E Workflow | - | Login -> Call Next -> Complete | Full flow successful | BLOCKED | High | Frontend server unstable in env |
| TC-036 | E2E | Complete Admin E2E Workflow | - | Login -> View Analytics | Full flow successful | BLOCKED | High | Frontend server unstable in env |
