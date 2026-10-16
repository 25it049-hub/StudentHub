# CHARUSAT StudentHub — Production Deployment Guide

This guide details how to deploy CHARUSAT StudentHub across popular hosting platforms.

---

## 1. Database Setup

The complete database schema with pre-configured seed records is in [`database/schema.sql`](file:///c:/Users/Tirth/Downloads/Student%20hub/database/schema.sql).

### Tables Included
1. `users` — Student & Administrator accounts with BCrypt password hashes
2. `students` — Academic profiles, CGPA, SGPA, attendance, department info
3. `events` — Campus events, hackathons, seminars, seat availability
4. `registrations` — Event ticketing & registration records
5. `audit_logs` — Administrative audit tracking
6. `feedback` — Student voice feedback entries
7. `contacts` — Inquiries & contact form submissions

### Seed Credentials
- **Student Account**:
  - Email / Roll: `25it049@charusat.edu.in` / `25IT049`
  - Password: `Charusat@2026` or `Student@123`
- **Administrator Console**:
  - Email / Roll: `admin@charusat.edu.in` / `ADMIN01`
  - Password: `Admin@2026`

---

## 2. Environment Configuration (`.env`)

In your production host, create a `.env` file in the project root based on [`.env.example`](file:///c:/Users/Tirth/Downloads/Student%20hub/.env.example):

```ini
DB_HOST=localhost       # or your cloud MySQL host
DB_PORT=3306
DB_NAME=studenthub      # or your cPanel database name (e.g. u123456_studenthub)
DB_USER=root           # or your cPanel MySQL user
DB_PASS=your_db_password
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
```

> [!NOTE]
> [`backend/db.php`](file:///c:/Users/Tirth/Downloads/Student%20hub/backend/db.php) automatically reads from `.env`, system environment variables (`$_ENV` / `$_SERVER`), or falls back to local MySQL.

---

## 3. Deployment Options

### Option A: Shared Hosting / cPanel (Hostinger, InfinityFree, cPanel)
1. **Upload Files**:
   - Compress the project root files (or clone via Git) and upload into `public_html/`.
2. **Import Database**:
   - In cPanel, open **phpMyAdmin**.
   - Create a new database or select your existing database.
   - Click **Import** and select [`database/schema.sql`](file:///c:/Users/Tirth/Downloads/Student%20hub/database/schema.sql).
3. **Configure Database Credentials**:
   - Create a `.env` file in `public_html/` with your cPanel database username, password, and database name.
4. **Done!**
   - Access `https://your-domain.com` or `https://your-domain.com/pages/login.html`.

---

### Option B: Linux VPS / Cloud Server (Ubuntu + Apache + MySQL)
1. **Clone Repository**:
   ```bash
   cd /var/www/html
   git clone <your-repo-url> studenthub
   cd studenthub
   ```
2. **Import Database**:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. **Set Permissions**:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/studenthub
   sudo chmod -R 755 /var/www/html/studenthub
   sudo chmod -R 775 /var/www/html/studenthub/data
   sudo chmod -R 775 /var/www/html/studenthub/uploads
   ```
4. **Enable Apache Modules**:
   ```bash
   sudo a2enmod rewrite headers
   sudo systemctl restart apache2
   ```

---

### Option C: Free Cloud PaaS (Render / Railway / Docker)
1. Deploy a free MySQL database service (e.g. on Railway, Aiven, or Supabase).
2. Import `database/schema.sql`.
3. Set the Environment Variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`) in your hosting dashboard.
4. Deploy the PHP application.

---

## 4. Security Hardening Included
- **CSRF Tokens**: Form submissions require session CSRF token validation.
- **SQL Injection Prevention**: All queries use MySQLi & PDO prepared statements with parameter binding.
- **XSS Sanitization**: User inputs sanitized via `htmlspecialchars()` and regex validation.
- **Sensitive File Shielding**: [`.htaccess`](file:///c:/Users/Tirth/Downloads/Student%20hub/.htaccess) blocks public downloads of `.env`, `*.sql`, `registrations.json`, `contacts.*`, and `feedback.*`.
- **Security Headers**: Configured with `X-Frame-Options`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.
