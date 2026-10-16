# CHARUSAT StudentHub — Unified Academic Portal & Student Services

> **Course**: Web Development Frameworks (ITUE203)  
> **Faculty**: Faculty of Technology and Engineering (FTE) — CHARUSAT  
> **Semester**: 3rd Semester, Academic Year 2026–27 (ODD)  
> **Student Lead**: Tirth Ladani (Roll No: **25IT049**)  
> **Department**: Department of Information Technology, CSPIT  

---

## 📌 Executive Summary

**StudentHub** is an enterprise-grade academic intranet and centralized student services platform built for Charotar University of Science and Technology (CHARUSAT). It connects undergraduate and postgraduate students with real-time academic records, automated biometric attendance calculation, timetable matrices, event registration, and administrative petitions.

The project fulfills all **15 Academic Practicals** defined in the ITUE203 syllabus, combining a modern Glassmorphism frontend with a secure PHP & MySQL backend architecture.

---

## 📋 Comprehensive Practical Syllabus Mapping (1 to 15)

| Practical No. | Topic / Practical Title | Core Deliverables & Implementation Files | Status |
| :---: | :--- | :--- | :---: |
| **P1** | **Project Initiation, Sitemap & GitHub Setup** | 11 semantic pages, `docs/sitmap.png`, `docs/wireframes/`, project structure, `README.md` | ✅ Complete |
| **P2** | **Semantic HTML5 & Accessibility Structure** | HTML5 semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`), ARIA attributes | ✅ Complete |
| **P3** | **Responsive UI (CSS Grid, Flexbox, Mobile-First)** | Glassmorphism UI tokens, CSS Grid & Flexbox layouts in `css/style.css` and `css/premium.css` | ✅ Complete |
| **P4** | **JS DOM Manipulation, Events & Interactivity** | Accordions, modals, 3D graduation cap viewer, single tactile 3D theme switcher in `js/theme.js` | ✅ Complete |
| **P5** | **Registration Form with Frontend Validation** | Real-time regex validation (Name, Roll, Email, Mobile, Programme, Year, Gender, Terms) in `pages/register.html` | ✅ Complete |
| **P6** | **Rendering External JSON using Fetch API** | `data/events.json`, `data/students.json`, `data/faqs.json` (16 records each) with search, filter, pagination in `js/json-engine.js` | ✅ Complete |
| **P7** | **PHP Form Processing & CSV/JSON Storage** | Server sanitization, CSV and JSON writing (`data/contacts.csv`, `data/contacts.json`) in `backend/process_contact.php` & `backend/view_inquiries.php` | ✅ Complete |
| **P8** | **MySQL Schema Design, ER Model & DB Connectivity** | Normalized schema (`database/schema.sql`) with 20+ seed records, PDO & MySQLi engine in `backend/db.php` | ✅ Complete |
| **P9** | **Secure User Registration & Password Hashing** | Server-side validation, duplicate check, and BCrypt `password_hash()` in `backend/register.php` | ✅ Complete |
| **P10** | **Secure Login/Logout, Sessions, RBAC & Timeout** | `password_verify()`, session ID regeneration, 15-min timeout, RBAC redirect in `backend/login.php` & `backend/logout.php` | ✅ Complete |
| **P11** | **Student Management CRUD with Search & Filter** | Full student CRUD (Create, Read, Update, Delete) with prepared statements in `api/students.php` | ✅ Complete |
| **P12** | **Event Management CRUD with Poster Upload** | Event management with image file validation (MIME, max 2MB size, unique filename) in `api/events.php` | ✅ Complete |
| **P13** | **PHP JSON API & AJAX/Fetch-Based CRUD** | RESTful JSON API endpoints (`api/students.php`, `api/events.php`) consumed asynchronously via Fetch API | ✅ Complete |
| **P14** | **Admin Dashboard with RBAC & Audit Log** | Role-based admin console, database aggregation metrics, and audit logger in `api/admin_stats.php` & `backend/audit.php` | ✅ Complete |
| **P15** | **Final Integration, Documentation & Deployment** | Full-stack deployment on Apache / XAMPP, database seed scripts, comprehensive testing checklist | ✅ Complete |

---

## 🗂️ Project Directory Structure

```text
Student hub/
├── index.html                   # 3D Interactive Hero, Cap Model, Quick Links
├── redame.md                    # (Archived/Replaced by README.md)
├── README.md                    # Project Documentation & Practical Mapping
├── css/
│   ├── style.css                # Base Design System, Typography, Layout
│   └── premium.css              # Cyber Glassmorphism, 3D Theme Atmospheres
├── js/
│   ├── theme.js                 # 3D Theme Switcher (Blue, Purple, Green, Midnight)
│   ├── json-engine.js           # Practical 6: Fetch API, Search, Sort & Pagination
│   ├── portal-data.js           # Student Data Engine & LocalStorage Sync
│   ├── script.js                # Global Interactions, Nav, Counters, Modals
│   ├── admin-sync.js            # Admin Console Approvals & Notice Stream
│   ├── dashboard-sync.js        # Student Dashboard Live Tab Switcher
│   └── animations.js            # GSAP Motion Blur & Model Orbit Animations
├── pages/
│   ├── about.html               # University History, Leadership & Campus Life
│   ├── admin.html               # Administrator Portal, Directory, Marks & Approvals
│   ├── contact.html             # Inquiry Form with Server-side Logging
│   ├── dashboard.html           # Student Attendance, Marks, Timetable & Fees
│   ├── events.html              # Dynamic Campus Events (Powered by Fetch API)
│   ├── faq.html                 # Dynamic Knowledgebase & Accordion
│   ├── feedback.html            # Rating Matrix & Suggestion Submission
│   ├── login.html               # Secure Role-Based Authentication
│   ├── profile.html             # Student Digital ID & Academic Credentials
│   └── register.html            # Regex Validated Student Enrollment
├── data/
│   ├── events.json              # 16 University Event Records (Practical 6)
│   ├── students.json            # 16 Student Profiles across 5 Departments (Practical 6)
│   ├── faqs.json                # 16 Academic & Portal FAQs (Practical 6)
│   ├── contacts.csv             # Server-logged Inquiry Submissions (Practical 7)
│   ├── contacts.json            # JSON Inquiry Mirror (Practical 7)
│   └── registrations.json       # Fallback Registration Mirror (Practical 9)
├── database/
│   └── schema.sql               # MySQL Normalized Schema & 20+ Seed Records (Practical 8)
├── backend/
│   ├── db.php                   # PDO & MySQLi Database Connection Engine (Practical 8)
│   ├── process_contact.php      # Server-Side Sanitization & File Storage (Practical 7)
│   ├── view_inquiries.php       # Inquiries Web Viewer (Practical 7 Extension)
│   ├── register.php             # Duplicate Check & Password Hashing (Practical 9)
│   ├── login.php                # Session Auth, RBAC & password_verify() (Practical 10)
│   ├── logout.php               # Session Invalidation (Practical 10)
│   ├── auth_check.php           # Inactivity Timeout (15m) & RBAC Guard (Practical 10/14)
│   └── audit.php                # Traceable Administrative Activity Logger (Practical 14)
├── api/
│   ├── students.php             # Student Management CRUD REST API (Practical 11 & 13)
│   ├── events.php               # Event CRUD & Validated Poster Upload (Practical 12 & 13)
│   └── admin_stats.php          # Dynamic Statistics & Audit Log Endpoint (Practical 14)
├── uploads/
│   └── events/                  # Validated Event Poster Images
└── docs/
    ├── sitmap.png               # High-Level Information Architecture Sitemap
    └── wireframes/              # Low-Fidelity UI Wireframes (Home, Login, Dashboard, Events)
```

---

## 🗄️ Database Architecture & ER Model (Practical 8)

The MySQL database (`studenthub`) is normalized into 5 interconnected tables:

```
+--------------------+        +---------------------+
|       USERS        |        |      STUDENTS       |
+--------------------+        +---------------------+
| id (PK)            | 1    1 | id (PK)             |
| roll_no (UNIQUE)   |<-------| user_id (FK)        |
| email (UNIQUE)     |        | roll_no (UNIQUE)    |
| password_hash      |        | full_name           |
| role (ENUM)        |        | email, phone        |
| status             |        | department, semester|
| created_at         |        | cgpa, attendance    |
+--------------------+        +---------------------+
          |                              | 1
          | 1                            |
          |                              | N
          v N                            v
+--------------------+        +---------------------+
|     AUDIT_LOGS     |        |    REGISTRATIONS    |
+--------------------+        +---------------------+
| id (PK)            |        | id (PK)             |
| user_id (FK)       |        | event_id (FK) ----->+
| action             |        | student_id (FK)     |
| target_entity      |        | ticket_code         |
| details, ip_address|        | status, registered_at
+--------------------+        +---------------------+
                                         | N
                                         | 1
                              +---------------------+
                              |       EVENTS        |
                              +---------------------+
                              | id (PK)             |
                              | title, category     |
                              | event_date, location|
                              | poster_url, fee     |
                              | seats_total, left   |
                              +---------------------+
```

---

## ⚙️ Installation & Local Deployment Guide (XAMPP / Apache)

### Prerequisites
1. **XAMPP** (Apache, MySQL, PHP 8.1+) installed at `C:\xampp`.
2. Modern Web Browser (Chrome, Firefox, or Edge).

### Step 1: Copy Project to XAMPP Document Root
Copy this project folder into `C:\xampp\htdocs\studenthub`.

### Step 2: Start Apache & MySQL
1. Open **XAMPP Control Panel**.
2. Click **Start** for **Apache**.
3. Click **Start** for **MySQL**.

### Step 3: Import Database Schema
1. Open your browser and navigate to `http://localhost/phpmyadmin`.
2. Click on **New** to create a database named `studenthub` (or click **Import** directly).
3. Choose the file `database/schema.sql` located inside your project folder.
4. Click **Import** (or **Go**) at the bottom.
5. All 5 tables and 20+ seed student records will be populated automatically!

### Step 4: Access the Application
Open your browser and visit:
```
http://localhost/studenthub/index.html
```

---

## 🔐 Default Demo Accounts (Pre-Seeded)

| Account Role | Username / Roll No | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@charusat.edu.in` | `Admin@2026` | `pages/admin.html` (Full Admin Console) |
| **Student** | `25it049@charusat.edu.in` (or `25IT049`) | `Charusat@2026` | `pages/dashboard.html` (Student Portal) |

---

## 🧪 Testing Verification Checklist

- **Practical 5 Validation**: Open `pages/register.html`, click "Create Account" without filling fields to see inline regex errors. Click "Auto-fill Details" to test complete validation and receipt generation.
- **Practical 6 Dynamic JSON**: Open `pages/events.html` and `pages/faq.html`. Search for keywords, filter by category chips, sort, and navigate pages via numbered pagination pills.
- **Practical 7 Server Form**: Open `pages/contact.html`, submit the inquiry form, and inspect records in `backend/view_inquiries.php` or `data/contacts.csv`.
- **Practical 8 Connection**: Run `php backend/db.php` from terminal to test connection diagnostics.
- **Practical 9 Hashed Registration**: Submit `pages/register.html` — verified with `password_hash()` BCrypt algorithm.
- **Practical 10 Authentication & Timeout**: Sign in on `pages/login.html` as student vs admin to verify role redirection. Check `backend/auth_check.php` for 15-minute inactivity timeout.
- **Practical 11 & 12 CRUD**: Open `pages/admin.html` to add, edit marks, update attendance, and delete student records.
- **Practical 14 Audit Logs**: All administrative modifications trigger automatic entries into `audit_logs`.

---

## 📜 Academic Integrity & Submission
Developed as part of the curriculum requirement for **Web Development Frameworks (ITUE203)** at Charotar University of Science and Technology (CHARUSAT).
