<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Server-Side Form Processor (process_contact.php)
 * Fulfills Practical 7: PHP Form Processing with Server-Side Validation
 * and CSV / JSON File Storage.
 * =============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error'   => 'Method Not Allowed. Form must be submitted via HTTP POST.'
    ]);
    exit;
}

// CSRF protection (Practical 7 — advanced extension)
if (!csrf_check()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Security check failed. Please reload the page and try again.']);
    exit;
}

// 1. Retrieve raw POST inputs
$fullName = trim($_POST['fullname'] ?? $_POST['fullName'] ?? $_POST['name'] ?? '');
$email    = trim($_POST['email'] ?? '');
$phone    = trim($_POST['phone'] ?? $_POST['mobile'] ?? '');
$subject  = trim($_POST['subject'] ?? 'General Inquiry');
$message  = trim($_POST['message'] ?? '');
$category = trim($_POST['category'] ?? 'General');

// 2. Server-side Sanitization
$sanitizedName    = htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8');
$sanitizedEmail   = filter_var($email, FILTER_SANITIZE_EMAIL);
$sanitizedPhone   = preg_replace('/[^\d+]/', '', $phone);
$sanitizedSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$sanitizedMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// 3. Server-side Validation
$errors = [];

if (empty($sanitizedName) || strlen($sanitizedName) < 3 || strlen($sanitizedName) > 60) {
    $errors['fullname'] = 'Full name is required and must be between 3 and 60 characters.';
}

if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'A valid email address is required.';
}

if (!empty($sanitizedPhone) && !preg_match('/^[6-9]\d{9}$/', $sanitizedPhone) && !preg_match('/^\+91[6-9]\d{9}$/', $sanitizedPhone)) {
    $errors['phone'] = 'Please enter a valid 10-digit Indian phone number.';
}

if (empty($sanitizedMessage) || strlen($sanitizedMessage) < 10) {
    $errors['message'] = 'Message is required and must contain at least 10 characters.';
}

if (!empty($errors)) {
    http_response_code(422); // Unprocessable Entity
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed on server side.',
        'errors'  => $errors
    ]);
    exit;
}

// 4. File-Based Storage Preparation (data/contacts.csv and data/contacts.json)
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$csvFile  = $dataDir . '/contacts.csv';
$jsonFile = $dataDir . '/contacts.json';
$timestamp = date('Y-m-d H:i:s');
$ticketId  = 'TKT-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 5));

$record = [
    'ticket_id'  => $ticketId,
    'timestamp'  => $timestamp,
    'full_name'  => $sanitizedName,
    'email'      => $sanitizedEmail,
    'phone'      => $sanitizedPhone,
    'subject'    => $sanitizedSubject,
    'category'   => $category,
    'message'    => $sanitizedMessage,
    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
];

// Append to CSV file
$isNewCsv = !file_exists($csvFile);
$csvHandle = @fopen($csvFile, 'a');
if ($csvHandle) {
    if ($isNewCsv) {
        fputcsv($csvHandle, ['Ticket ID', 'Timestamp', 'Full Name', 'Email', 'Phone', 'Subject', 'Category', 'Message', 'IP Address']);
    }
    fputcsv($csvHandle, array_values($record));
    fclose($csvHandle);
}

// Append to JSON file
$jsonRecords = [];
if (file_exists($jsonFile)) {
    $existing = @file_get_contents($jsonFile);
    $decoded = json_decode($existing, true);
    if (is_array($decoded)) {
        $jsonRecords = $decoded;
    }
}
$jsonRecords[] = $record;
@file_put_contents($jsonFile, json_encode($jsonRecords, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// 4b. MySQL Database Storage (Practical 8/9 Integration)
try {
    $pdo = getPDOConnection(false);
    if ($pdo !== null) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `contacts` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `ticket_id` VARCHAR(32) NOT NULL UNIQUE,
                `full_name` VARCHAR(128) NOT NULL,
                `email` VARCHAR(128) NOT NULL,
                `phone` VARCHAR(32) DEFAULT '',
                `subject` VARCHAR(128) NOT NULL,
                `category` VARCHAR(64) DEFAULT 'General',
                `message` TEXT NOT NULL,
                `ip_address` VARCHAR(45) DEFAULT '',
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stmt = $pdo->prepare("
            INSERT INTO `contacts` (
                ticket_id, full_name, email, phone, subject, category, message, ip_address, created_at
            ) VALUES (
                :ticket_id, :full_name, :email, :phone, :subject, :category, :message, :ip_address, :created_at
            )
        ");

        $stmt->execute([
            ':ticket_id'  => $ticketId,
            ':full_name'  => $sanitizedName,
            ':email'      => $sanitizedEmail,
            ':phone'      => $sanitizedPhone,
            ':subject'    => $sanitizedSubject,
            ':category'   => $category,
            ':message'    => $sanitizedMessage,
            ':ip_address' => $record['ip_address'],
            ':created_at' => $timestamp
        ]);
    }
} catch (Exception $dbEx) {
    error_log('Contact DB storage notice: ' . $dbEx->getMessage());
}

// 5. Success Response
http_response_code(200);
echo json_encode([
    'success'   => true,
    'ticket_id' => $ticketId,
    'message'   => 'Your inquiry has been successfully validated and logged in university records.',
    'data'      => [
        'full_name' => $sanitizedName,
        'email'     => $sanitizedEmail,
        'ticket_id' => $ticketId,
        'timestamp' => $timestamp
    ]
]);
