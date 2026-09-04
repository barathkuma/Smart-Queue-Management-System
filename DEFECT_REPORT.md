# Defect Report - Smart Queue Management System

| Defect ID | Related Test Case | Module | Description | Steps to Reproduce | Expected Behavior | Actual Behavior | Severity | Status | Fix Applied |
|---|---|---|---|---|---|---|---|---|---|
| DEF-001 | TC-007, TC-008 | Auth / Security | Public registration allowed specifying ADMIN/STAFF roles | 1. POST /api/auth/register/ with `"role": "ADMIN"` | Account should be created as `USER` | Account created as `ADMIN` | Critical | Fixed | Removed `role` field from `UserRegisterSerializer` and ensured default `USER` role in manager |
