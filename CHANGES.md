# Backend & Database Improvements — CHARUSAT StudentHub

**Project:** ITUE203 (Web Development Frameworks) — Semester 3, 2026-27
**Scope:** PHP backend (`backend/`, `api/`), MySQL database (`database/`), form processors
**Constraint respected:** MySQL database kept intact (no replacement); improvements only

---

## 1. Security Fixes (Critical)

| File | Change | Why |
|------|--------|-----|
| `backend/login.php` | Removed hardcoded demo accounts (`admin2026`, etc.) and JSON-file fallback; relies solely on DB + `password_verify()` | Prevents unauthorized admin/student access |
| `backend/login.php` | Added `last_login` timestamp update on successful login | Practical 10 — intermediate extension |
| `backend/login.php` | Remember-me token stored as SHA256 hash in DB; raw cookie only | Prevents token leak from DB |
| `backend/login.php` | Added `require_once __DIR__ . '/bootstrap.php';` (session hardening) | Consistent cookie settings |
| `api/students.php` | Added `require_auth()` + `csrf_check()` on POST/PUT/DELETE | Prevents unauthenticated CRUD |
| `api/events.php` | Added `require_auth()` + `csrf_check()` on POST/DELETE | Prevents unauthenticated event creation/deletion |
| `api/admin_stats.php` | Enforced admin-only access (returns 403 if not admin) | Removes demo-data leak when unauthenticated |
| `api/admin_stats.php` | Removed fallback to hardcoded statistics | Source of truth = DB only |
| `database/schema.sql` | Replaced broken seed hashes with real bcrypt (`$2b$10$...`) | `password_verify()` now works |

---

## 2. New Shared Infrastructure

- `backend/bootstrap.php` — session config (`httponly`, `samesite=Lax`), `json_response()`, `csrf_token()`, `csrf_check()`
- `backend/csrf_token.php` — endpoint for frontend to fetch a session-bound token
- Updated `pages/contact.html` and `pages/register.html` to fetch token before submitting

---

## 3. Form Processor Hardening

- `backend/register.php` — CSRF check added (via `csrf_check()`)
- `backend/process_contact.php` — CSRF check added; uses `bootstrap.php`

---

## 4. Performance & Schema Improvements

- Added indexes: `users.email`, `users.roll_no`, `users.remember_token`; `students.email`, `students.roll_no`; `audit_logs.user_id`
- `database/schema.sql` updated with index definitions (applied on next `CREATE DATABASE` / import)

---

## 5. Practical Mapping (ITUE203)

| Practical | Improvement Made |
|---|---|
| 7 (Contact Form) | CSRF guard; server-side validation kept |
| 8 (MySQL Schema) | Real bcrypt hashes; added indexes |
| 9 (Registration) | CSRF + `password_hash()` kept; no hardcoded fallbacks |
| 10 (Login/Session) | `last_login`, remember-me hash, session regeneration, no hardcoded accounts |
| 11 (Student CRUD) | API auth + CSRF; DB-only source of truth |
| 12 (Event CRUD + Upload) | API auth + CSRF; file validation kept |
| 13 (JSON API + Fetch) | Endpoints protected; standard JSON errors |
| 14 (Admin Dashboard) | Admin-only access enforced; audit logs from DB |

---

## 6. Files Changed / Added

**Added:** `backend/bootstrap.php`, `backend/csrf_token.php`
**Modified:** `backend/login.php`, `backend/register.php`, `backend/process_contact.php`, `api/students.php`, `api/events.php`, `api/admin_stats.php`, `database/schema.sql`, `pages/contact.html`, `pages/register.html`

---

*Done: 2026-10-14 — improved professionally without changing database technology.*
