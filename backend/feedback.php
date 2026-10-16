<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Feedback Processor (backend/feedback.php)
 * Handles Student Voice and Portal Feedback submissions.
 * Validates inputs, persists to MySQL database, and logs to JSON & CSV.
 * =============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';

// Only allow HTTP POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error'   => 'Method Not Allowed. Submissions must be sent via POST.'
    ]);
    exit;
}

// 1. Retrieve raw POST inputs
$rating        = filter_var($_POST['rating'] ?? 5, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 5]]) ?: 5;
$feedbackType  = trim($_POST['feedback_type'] ?? $_POST['type'] ?? 'suggestion');
$name          = trim($_POST['name'] ?? $_POST['fullname'] ?? '');
$enrolment     = trim($_POST['enrolment'] ?? $_POST['roll'] ?? '');
$email         = trim($_POST['email'] ?? '');
$department    = trim($_POST['department'] ?? 'Information Technology');
$comments      = trim($_POST['comments'] ?? $_POST['message'] ?? '');
$isAnonymous   = !empty($_POST['is_anonymous']) && ($_POST['is_anonymous'] === '1' || $_POST['is_anonymous'] === 'true' || $_POST['is_anonymous'] === true);

// Topics can arrive as an array or JSON string or comma-separated list
$topicsRaw = $_POST['topics'] ?? $_POST['topic'] ?? [];
$topics = [];
if (is_array($topicsRaw)) {
    $topics = array_map('trim', $topicsRaw);
} elseif (is_string($topicsRaw) && strlen($topicsRaw) > 0) {
    $decoded = json_decode($topicsRaw, true);
    if (is_array($decoded)) {
        $topics = array_map('trim', $decoded);
    } else {
        $topics = array_filter(array_map('trim', explode(',', $topicsRaw)));
    }
}
if (empty($topics)) {
    $topics = ['general'];
}

// 2. Sanitization
$sanitizedName       = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$sanitizedEnrolment  = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $enrolment));
$sanitizedEmail      = filter_var($email, FILTER_SANITIZE_EMAIL);
$sanitizedDepartment = htmlspecialchars($department, ENT_QUOTES, 'UTF-8');
$sanitizedComments   = htmlspecialchars($comments, ENT_QUOTES, 'UTF-8');
$sanitizedType       = htmlspecialchars($feedbackType, ENT_QUOTES, 'UTF-8');
$topicsString        = implode(', ', $topics);

// 3. Validation
$errors = [];
if (empty($sanitizedComments) || strlen($sanitizedComments) < 5) {
    $errors['comments'] = 'Please provide constructive feedback with at least 5 characters.';
}

if (!$isAnonymous && !empty($sanitizedEmail) && !filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid student email address.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Validation error',
        'errors'  => $errors
    ]);
    exit;
}

// 4. Generate Reference Code and Metadata
$refId     = 'SH-FB-2026-' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 4));
$timestamp = date('Y-m-d H:i:s');
$clientIp  = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

$record = [
    'ref_id'       => $refId,
    'timestamp'    => $timestamp,
    'rating'       => $rating,
    'feedback_type'=> $sanitizedType,
    'topics'       => $topics,
    'student_name' => $isAnonymous ? 'Anonymous Student' : ($sanitizedName ?: 'Anonymous Student'),
    'enrolment'    => $isAnonymous ? 'Anonymous' : ($sanitizedEnrolment ?: 'N/A'),
    'email'        => $isAnonymous ? '' : $sanitizedEmail,
    'department'   => $sanitizedDepartment,
    'is_anonymous' => $isAnonymous ? 1 : 0,
    'comments'     => $sanitizedComments,
    'ip_address'   => $clientIp
];

// 5. Store in MySQL Database (if available)
try {
    $pdo = getPDOConnection(false);
    if ($pdo !== null) {
        // Ensure feedback table exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `feedback` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `ref_id` VARCHAR(32) NOT NULL UNIQUE,
                `rating` TINYINT NOT NULL DEFAULT 5,
                `feedback_type` VARCHAR(64) DEFAULT 'suggestion',
                `topics` VARCHAR(255) DEFAULT '',
                `student_name` VARCHAR(128) DEFAULT '',
                `enrolment` VARCHAR(32) DEFAULT '',
                `email` VARCHAR(128) DEFAULT '',
                `department` VARCHAR(128) DEFAULT '',
                `is_anonymous` TINYINT(1) DEFAULT 0,
                `comments` TEXT NOT NULL,
                `ip_address` VARCHAR(45) DEFAULT '',
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stmt = $pdo->prepare("
            INSERT INTO `feedback` (
                ref_id, rating, feedback_type, topics, student_name, enrolment, email, department, is_anonymous, comments, ip_address, created_at
            ) VALUES (
                :ref_id, :rating, :feedback_type, :topics, :student_name, :enrolment, :email, :department, :is_anonymous, :comments, :ip_address, :created_at
            )
        ");

        $stmt->execute([
            ':ref_id'        => $refId,
            ':rating'        => $rating,
            ':feedback_type' => $sanitizedType,
            ':topics'        => $topicsString,
            ':student_name'  => $record['student_name'],
            ':enrolment'     => $record['enrolment'],
            ':email'         => $record['email'],
            ':department'    => $sanitizedDepartment,
            ':is_anonymous'  => $isAnonymous ? 1 : 0,
            ':comments'      => $sanitizedComments,
            ':ip_address'    => $clientIp,
            ':created_at'    => $timestamp
        ]);
    }
} catch (Exception $dbEx) {
    // Graceful fallback to file storage
    error_log('Database feedback storage notice: ' . $dbEx->getMessage());
}

// 6. Persist to data/feedback.json and data/feedback.csv
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$jsonFile = $dataDir . '/feedback.json';
$csvFile  = $dataDir . '/feedback.csv';

// JSON file write
$jsonList = [];
if (file_exists($jsonFile)) {
    $existingRaw = @file_get_contents($jsonFile);
    $decoded = json_decode($existingRaw, true);
    if (is_array($decoded)) {
        $jsonList = $decoded;
    }
}
$jsonList[] = $record;
@file_put_contents($jsonFile, json_encode($jsonList, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// CSV file write
$isNewCsv = !file_exists($csvFile);
$csvHandle = @fopen($csvFile, 'a');
if ($csvHandle) {
    if ($isNewCsv) {
        fputcsv($csvHandle, ['Ref ID', 'Timestamp', 'Rating', 'Type', 'Topics', 'Student Name', 'Enrolment', 'Email', 'Department', 'Is Anonymous', 'Comments', 'IP Address']);
    }
    fputcsv($csvHandle, [
        $refId,
        $timestamp,
        $rating,
        $sanitizedType,
        $topicsString,
        $record['student_name'],
        $record['enrolment'],
        $record['email'],
        $sanitizedDepartment,
        $isAnonymous ? 'Yes' : 'No',
        $sanitizedComments,
        $clientIp
    ]);
    fclose($csvHandle);
}

// 7. Success Response
http_response_code(200);
echo json_encode([
    'success'    => true,
    'ref_id'     => $refId,
    'message'    => 'Thank you! Your feedback has been securely registered with the Student Services & IT Council.',
    'timestamp'  => $timestamp,
    'data'       => [
        'ref_id'      => $refId,
        'rating'      => $rating,
        'student'     => $record['student_name'],
        'enrolment'   => $record['enrolment'],
        'department'  => $sanitizedDepartment,
        'timestamp'   => $timestamp,
        'is_anonymous'=> $isAnonymous
    ]
]);
