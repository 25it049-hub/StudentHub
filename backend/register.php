<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Secure Registration Processor (register.php)
 * Fulfills Practical 9: Secure Registration with MySQL Insert, Duplicate Checks,
 * and BCrypt Password Hashing using MySQLi Prepared Statements.
 * =============================================================================
 */

ob_start();
@ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    if (ob_get_length()) ob_clean();
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. POST required.']);
    exit;
}

// CSRF protection (Practical 9 — advanced extension)
if (!csrf_check()) {
    http_response_code(403);
    if (ob_get_length()) ob_clean();
    echo json_encode(['success' => false, 'message' => 'Security check failed. Please reload the page and try again.']);
    exit;
}

// 1. Collect inputs
$fullName   = trim($_POST['fullname'] ?? $_POST['fullName'] ?? $_POST['name'] ?? '');
$rollNo     = strtoupper(trim($_POST['roll'] ?? $_POST['roll_no'] ?? $_POST['rollNo'] ?? ''));
$email      = trim($_POST['email'] ?? '');
$mobile     = trim($_POST['mobile'] ?? $_POST['phone'] ?? '');
$programme  = trim($_POST['programme'] ?? 'B.Tech Information Technology');
$year       = trim($_POST['year'] ?? '3rd Year (Semester 5 & 6)');
$gender     = trim($_POST['gender'] ?? 'Male');
$password   = $_POST['password'] ?? '';
$confirmPw  = $_POST['confirm_password'] ?? $_POST['confirm-password'] ?? $_POST['confirmPassword'] ?? '';

// 2. Server-side Validation
$errors = [];

if (empty($fullName) || !preg_match('/^[A-Za-z\s]{3,50}$/', $fullName)) {
    $errors['fullname'] = 'Full name must contain only letters and spaces (3-50 chars).';
}

if (empty($rollNo) || !preg_match('/^[0-9]{2}[A-Za-z]{2,3}[0-9]{3}$/i', $rollNo)) {
    $errors['roll'] = 'Invalid Roll / Enrolment Number format (e.g. 25IT049).';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'A valid university email address is required.';
}

if (empty($mobile) || !preg_match('/^[6-9]\d{9}$/', $mobile)) {
    $errors['mobile'] = 'A valid 10-digit Indian mobile number is required.';
}

if (empty($password) || strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters long.';
}

if ($password !== $confirmPw) {
    $errors['confirm_password'] = 'Passwords do not match.';
}

if (!empty($errors)) {
    http_response_code(422);
    if (ob_get_length()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server validation failed.',
        'errors'  => $errors
    ]);
    exit;
}

// 3. Secure Password Hashing (BCrypt via PHP native password_hash)
$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$confirmationId = 'SH-REG-' . date('Y') . '-' . mt_rand(1000, 9999);
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// 4. Database Insert via MySQLi Prepared Statements
$mysqli = getMySQLiConnection(false);

if ($mysqli !== null) {
    // 4a. Check Duplicate Email or Roll Number
    $checkStmt = $mysqli->prepare("SELECT id, roll_no, email FROM users WHERE roll_no = ? OR email = ? LIMIT 1");
    if ($checkStmt) {
        $checkStmt->bind_param('ss', $rollNo, $email);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            $checkStmt->close();
            http_response_code(409); // Conflict
            if (ob_get_length()) ob_clean();
            echo json_encode([
                'success' => false,
                'message' => 'An account with this Roll Number or Email already exists.',
                'field'   => 'roll'
            ]);
            exit;
        }
        $checkStmt->close();
    }

    // Department & semester determination
    $dept = (strpos($programme, 'Information Technology') !== false) ? 'Information Technology' :
            ((strpos($programme, 'Computer Engineering') !== false) ? 'Computer Engineering' :
            ((strpos($programme, 'Computer Science') !== false) ? 'Computer Science & Engineering' : 'Information Technology'));
    $sem = (strpos($year, 'Semester 5') !== false) ? 5 : ((strpos($year, 'Semester 3') !== false) ? 3 : 1);

    // 4b. Insert User Account
    $userStmt = $mysqli->prepare("INSERT INTO users (roll_no, email, password_hash, role, status) VALUES (?, ?, ?, 'student', 'Active')");
    if ($userStmt) {
        $userStmt->bind_param('sss', $rollNo, $email, $passwordHash);
        $userStmt->execute();
        $newUserId = $mysqli->insert_id;
        $userStmt->close();

        // 4c. Insert Student Academic Record
        $stStmt = $mysqli->prepare("INSERT INTO students (user_id, full_name, roll_no, email, phone, gender, department, programme, academic_year, semester, cgpa, sgpa, attendance, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 8.50, 8.50, 90.00, 'Active')");
        if ($stStmt) {
            $stStmt->bind_param('issssssssi', $newUserId, $fullName, $rollNo, $email, $mobile, $gender, $dept, $programme, $year, $sem);
            $stStmt->execute();
            $stStmt->close();
        }

        // 4d. Write Audit Log Entry
        $auditStmt = $mysqli->prepare("INSERT INTO audit_logs (user_id, action, target_entity, entity_id, details, ip_address) VALUES (?, 'USER_REGISTER', 'users', ?, ?, ?)");
        if ($auditStmt) {
            $details = "Student self-registered with roll $rollNo ($email)";
            $auditStmt->bind_param('iiss', $newUserId, $newUserId, $details, $clientIp);
            $auditStmt->execute();
            $auditStmt->close();
        }
    }
} else {
    $dept = (strpos($programme, 'Information Technology') !== false) ? 'Information Technology' :
            ((strpos($programme, 'Computer Engineering') !== false) ? 'Computer Engineering' : 'Information Technology');
    $sem = (strpos($year, 'Semester 5') !== false) ? 5 : 1;
}

// 4e. Synchronize with data/students.json & data/registrations.json
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$studentsJsonPath = $dataDir . '/students.json';
if (file_exists($studentsJsonPath)) {
    $allStudents = json_decode(@file_get_contents($studentsJsonPath), true) ?: [];
    $found = false;
    foreach ($allStudents as $st) {
        if (strcasecmp($st['enrolment'] ?? $st['roll_no'] ?? '', $rollNo) === 0) {
            $found = true;
            break;
        }
    }
    if (!$found) {
        $allStudents[] = [
            'id'                => count($allStudents) + 1,
            'enrolment'         => $rollNo,
            'fullName'          => $fullName,
            'email'             => $email,
            'phone'             => $mobile,
            'department'        => $dept,
            'programme'         => $programme,
            'academic_year'     => $year,
            'gender'            => $gender,
            'semester'          => (string)$sem,
            'attendance'        => 90,
            'overallAttendance' => 90,
            'cgpa'              => 8.50,
            'sgpa'              => 8.50,
            'status'            => 'Active',
            'avatar'            => strtoupper(substr($fullName, 0, 1) . substr($rollNo, -1))
        ];
        @file_put_contents($studentsJsonPath, json_encode($allStudents, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}

$regFile = $dataDir . '/registrations.json';
$records = [];
if (file_exists($regFile)) {
    $decoded = json_decode(@file_get_contents($regFile), true);
    if (is_array($decoded)) $records = $decoded;
}
$records[] = [
    'confirmation_id' => $confirmationId,
    'full_name'       => $fullName,
    'roll_no'         => $rollNo,
    'email'           => $email,
    'mobile'          => $mobile,
    'programme'       => $programme,
    'academic_year'   => $year,
    'gender'          => $gender,
    'password_hash'   => $passwordHash,
    'registered_at'   => date('Y-m-d H:i:s'),
    'ip_address'      => $clientIp
];
@file_put_contents($regFile, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// 5. Return Success Response
http_response_code(201); // Created
if (ob_get_length()) ob_clean();
echo json_encode([
    'success'         => true,
    'confirmation_id' => $confirmationId,
    'message'         => 'Student registration completed successfully with secure BCrypt hashing.',
    'student'         => [
        'id'                => $newUserId ?? mt_rand(100, 999),
        'fullName'          => $fullName,
        'full_name'         => $fullName,
        'enrolment'         => $rollNo,
        'roll_no'           => $rollNo,
        'email'             => $email,
        'phone'             => $mobile,
        'department'        => $dept,
        'programme'         => $programme,
        'semester'          => (string)$sem,
        'academic_year'     => $year,
        'gender'            => $gender,
        'cgpa'              => 8.50,
        'sgpa'              => 8.50,
        'overallAttendance' => 90,
        'attendance'        => 90,
        'status'            => 'Active'
    ]
]);
