<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Students RESTful JSON API (api/students.php)
 * Fulfills Practical 11 & Practical 13: Student Management CRUD with Search,
 * Filter, Prepared Statements, and AJAX/Fetch Consumption without Page Reload.
 * =============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../backend/db.php';
require_once __DIR__ . '/../backend/audit.php';
require_once __DIR__ . '/../backend/bootstrap.php';

function require_auth(): void {
    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        json_response(['success'=>false,'error'=>'Authentication required.'], 401);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $parsedJson = json_decode($rawInput, true);
    if (is_array($parsedJson)) {
        $_POST = array_merge($_POST, $parsedJson);
    }
}

// Support method spoofing via POST _method or action parameter
if ($method === 'POST') {
    if (isset($_POST['_method'])) $method = strtoupper($_POST['_method']);
    else if (isset($_POST['action']) && $_POST['action'] === 'delete') $method = 'DELETE';
    else if (isset($_POST['action']) && $_POST['action'] === 'update') $method = 'PUT';
}

$mysqli = getMySQLiConnection(false);

// Fallback helper to read from data/students.json when MySQL is offline
function getFallbackStudents(): array {
    $f = __DIR__ . '/../data/students.json';
    if (file_exists($f)) {
        $dec = json_decode(file_get_contents($f), true);
        if (is_array($dec)) return $dec;
    }
    return [];
}

function saveFallbackStudents(array $list): void {
    $f = __DIR__ . '/../data/students.json';
    @file_put_contents($f, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// -----------------------------------------------------------------------------
// GET: Retrieve Student List (with Search & Department Filter) or Single Student
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    // Practical 11 Intermediate Extension: Export student list to CSV
    if (isset($_GET['export']) && $_GET['export'] === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="students_charusat_export.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['ID', 'Roll Number', 'Full Name', 'Email', 'Phone', 'Gender', 'Department', 'Programme', 'Semester', 'CGPA', 'SGPA', 'Attendance (%)', 'Status']);

        if ($mysqli !== null) {
            $res = $mysqli->query("SELECT id, roll_no, full_name, email, phone, gender, department, programme, semester, cgpa, sgpa, attendance, status FROM students ORDER BY roll_no ASC");
            if ($res) {
                while ($row = $res->fetch_assoc()) {
                    fputcsv($out, [
                        $row['id'],
                        $row['roll_no'],
                        $row['full_name'],
                        $row['email'],
                        $row['phone'],
                        $row['gender'],
                        $row['department'],
                        $row['programme'],
                        $row['semester'],
                        $row['cgpa'],
                        $row['sgpa'],
                        $row['attendance'],
                        $row['status']
                    ]);
                }
            }
        } else {
            foreach (getFallbackStudents() as $st) {
                fputcsv($out, [
                    $st['id'] ?? '',
                    $st['enrolment'] ?? $st['roll_no'] ?? '',
                    $st['fullName'] ?? $st['full_name'] ?? '',
                    $st['email'] ?? '',
                    $st['phone'] ?? '',
                    $st['gender'] ?? 'Male',
                    $st['department'] ?? '',
                    $st['programme'] ?? '',
                    $st['semester'] ?? 5,
                    $st['cgpa'] ?? 8.5,
                    $st['sgpa'] ?? 8.5,
                    $st['attendance'] ?? $st['overallAttendance'] ?? 90,
                    $st['status'] ?? 'Active'
                ]);
            }
        }
        fclose($out);
        exit;
    }

    $id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $search = trim($_GET['search'] ?? $_GET['q'] ?? '');
    $dept   = trim($_GET['dept'] ?? $_GET['department'] ?? 'all');

    if ($id > 0) {
        // Fetch single student
        if ($mysqli !== null) {
            $stmt = $mysqli->prepare("SELECT * FROM students WHERE id = ? LIMIT 1");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $res = $stmt->get_result();
            $student = $res->fetch_assoc();
            $stmt->close();
            if ($student) {
                echo json_encode(['success' => true, 'data' => $student]);
                exit;
            }
        } else {
            foreach (getFallbackStudents() as $st) {
                if ((int)$st['id'] === $id) {
                    echo json_encode(['success' => true, 'data' => $st]);
                    exit;
                }
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Student not found.']);
        exit;
    }

    // List students with Search and Filter
    if ($mysqli !== null) {
        $sql = "SELECT * FROM students WHERE 1=1";
        $params = [];
        $types = '';

        if (!empty($search)) {
            $sql .= " AND (full_name LIKE ? OR roll_no LIKE ? OR email LIKE ?)";
            $term = "%$search%";
            $params[] = $term; $params[] = $term; $params[] = $term;
            $types .= 'sss';
        }

        if ($dept !== 'all' && !empty($dept)) {
            $sql .= " AND department = ?";
            $params[] = $dept;
            $types .= 's';
        }

        $sql .= " ORDER BY roll_no ASC";
        $stmt = $mysqli->prepare($sql);
        if ($params) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $res = $stmt->get_result();
        $students = [];
        while ($row = $res->fetch_assoc()) {
            $students[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success'     => true,
            'source'      => 'MySQL Database',
            'total'       => count($students),
            'data'        => $students
        ]);
        exit;
    } else {
        // JSON Fallback
        $students = getFallbackStudents();
        if ($dept !== 'all' && !empty($dept)) {
            $students = array_values(array_filter($students, function ($s) use ($dept) {
                return strcasecmp($s['department'] ?? '', $dept) === 0;
            }));
        }
        if (!empty($search)) {
            $students = array_values(array_filter($students, function ($s) use ($search) {
                $pool = strtolower(($s['fullName'] ?? '') . ' ' . ($s['enrolment'] ?? '') . ' ' . ($s['email'] ?? ''));
                return strpos($pool, strtolower($search)) !== false;
            }));
        }

        echo json_encode([
            'success'     => true,
            'source'      => 'JSON Datastore (Simulation)',
            'total'       => count($students),
            'data'        => $students
        ]);
        exit;
    }
}

// -----------------------------------------------------------------------------
// POST: Add New Student (CREATE)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    require_auth();
    if (!csrf_check()) {
        json_response(['success' => false, 'error' => 'Invalid or missing CSRF token.'], 403);
    }
    $fullName = trim($_POST['full_name'] ?? $_POST['fullname'] ?? $_POST['fullName'] ?? '');
    $rollNo   = strtoupper(trim($_POST['roll_no'] ?? $_POST['roll'] ?? $_POST['enrolment'] ?? ''));
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $dept     = trim($_POST['department'] ?? 'Information Technology');
    $prog     = trim($_POST['programme'] ?? 'B.Tech ' . $dept);
    $sem      = (int)($_POST['semester'] ?? 5);
    $attendance = (float)($_POST['attendance'] ?? $_POST['overallAttendance'] ?? 90.0);
    $cgpa     = (float)($_POST['cgpa'] ?? 8.5);

    if (empty($fullName) || empty($rollNo) || empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Full name, roll number, and email are required.']);
        exit;
    }

    if ($mysqli !== null) {
        $stmt = $mysqli->prepare("INSERT INTO students (full_name, roll_no, email, phone, department, programme, semester, attendance, cgpa, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')");
        $stmt->bind_param('ssssssidd', $fullName, $rollNo, $email, $phone, $dept, $prog, $sem, $attendance, $cgpa);
        if ($stmt->execute()) {
            $newId = $mysqli->insert_id;
            $stmt->close();
            logAuditAction('STUDENT_CREATE', 'students', $newId, "Added student $rollNo ($fullName)");

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => "Student $rollNo added successfully.",
                'id'      => $newId
            ]);
            exit;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $stmt->error]);
            exit;
        }
    } else {
        $students = getFallbackStudents();
        $newId = count($students) + 1;
        $newStudent = [
            'id'         => $newId,
            'enrolment'  => $rollNo,
            'fullName'   => $fullName,
            'email'      => $email,
            'phone'      => $phone,
            'department' => $dept,
            'programme'  => $prog,
            'semester'   => $sem,
            'attendance' => $attendance,
            'cgpa'       => $cgpa,
            'status'     => 'Active',
            'avatar'     => strtoupper(substr($fullName, 0, 1) . substr($rollNo, -1))
        ];
        $students[] = $newStudent;
        saveFallbackStudents($students);
        logAuditAction('STUDENT_CREATE', 'students', $newId, "Added student $rollNo ($fullName)");

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => "Student $rollNo added successfully (JSON store).",
            'id'      => $newId
        ]);
        exit;
    }
}

// -----------------------------------------------------------------------------
// PUT: Update Student Record (UPDATE)
// -----------------------------------------------------------------------------
if ($method === 'PUT') {
    require_auth();
    if (!csrf_check()) {
        json_response(['success' => false, 'error' => 'Invalid or missing CSRF token.'], 403);
    }
    // Read raw PUT or parsed request payload
    $inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = (int)($inputData['id'] ?? $_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Student ID is required for update.']);
        exit;
    }

    $attendance = isset($inputData['attendance']) ? (float)$inputData['attendance'] : null;
    $cgpa       = isset($inputData['cgpa']) ? (float)$inputData['cgpa'] : null;
    $status     = trim($inputData['status'] ?? '');
    $phone      = trim($inputData['phone'] ?? '');

    if ($mysqli !== null) {
        $stmt = $mysqli->prepare("UPDATE students SET attendance = COALESCE(?, attendance), cgpa = COALESCE(?, cgpa), status = CASE WHEN ? != '' THEN ? ELSE status END, phone = CASE WHEN ? != '' THEN ? ELSE phone END WHERE id = ?");
        $stmt->bind_param('ddssssi', $attendance, $cgpa, $status, $status, $phone, $phone, $id);
        $stmt->execute();
        $stmt->close();
        logAuditAction('STUDENT_UPDATE', 'students', $id, "Updated student ID $id (Attendance: $attendance, CGPA: $cgpa)");

        echo json_encode(['success' => true, 'message' => "Student ID $id updated successfully."]);
        exit;
    } else {
        $students = getFallbackStudents();
        $updated = false;
        foreach ($students as &$st) {
            if ((int)$st['id'] === $id) {
                if ($attendance !== null) $st['attendance'] = $attendance;
                if ($cgpa !== null) $st['cgpa'] = $cgpa;
                if (!empty($status)) $st['status'] = $status;
                if (!empty($phone)) $st['phone'] = $phone;
                $updated = true;
                break;
            }
        }
        if ($updated) {
            saveFallbackStudents($students);
            logAuditAction('STUDENT_UPDATE', 'students', $id, "Updated student ID $id");
            echo json_encode(['success' => true, 'message' => "Student ID $id updated successfully."]);
            exit;
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Student ID not found.']);
        exit;
    }
}

// -----------------------------------------------------------------------------
// DELETE: Delete Student Record (DELETE with Confirmation)
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    require_auth();
    if (!csrf_check()) {
        json_response(['success' => false, 'error' => 'Invalid or missing CSRF token.'], 403);
    }
    $inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = (int)($inputData['id'] ?? $_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Valid Student ID is required for deletion.']);
        exit;
    }

    // Practical 11 Advanced Extension: Soft delete using status column instead of permanent delete
    $isPermanent = !empty($inputData['permanent']) || !empty($_GET['permanent']);

    if ($mysqli !== null) {
        if ($isPermanent) {
            $stmt = $mysqli->prepare("DELETE FROM students WHERE id = ?");
            $action = 'STUDENT_DELETE_PERMANENT';
            $msg = "Student record #$id permanently deleted from database.";
        } else {
            $stmt = $mysqli->prepare("UPDATE students SET status = 'Inactive' WHERE id = ?");
            $action = 'STUDENT_SOFT_DELETE';
            $msg = "Student record #$id marked as Inactive (soft deleted).";
        }
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();

        if ($affected > 0) {
            logAuditAction($action, 'students', $id, $msg);
            echo json_encode(['success' => true, 'message' => $msg, 'soft_deleted' => !$isPermanent]);
            exit;
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Student record #$id not found."]);
            exit;
        }
    } else {
        $students = getFallbackStudents();
        $found = false;
        if ($isPermanent) {
            $initCount = count($students);
            $students = array_values(array_filter($students, function ($s) use ($id) {
                return (int)$s['id'] !== $id;
            }));
            $found = (count($students) < $initCount);
            $msg = "Student record #$id permanently deleted (JSON store).";
            $action = 'STUDENT_DELETE_PERMANENT';
        } else {
            foreach ($students as &$s) {
                if ((int)$s['id'] === $id) {
                    $s['status'] = 'Inactive';
                    $found = true;
                    break;
                }
            }
            $msg = "Student record #$id marked as Inactive (JSON store).";
            $action = 'STUDENT_SOFT_DELETE';
        }

        if ($found) {
            saveFallbackStudents($students);
            logAuditAction($action, 'students', $id, $msg);
            echo json_encode(['success' => true, 'message' => $msg, 'soft_deleted' => !$isPermanent]);
            exit;
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => "Student record #$id not found."]);
        exit;
    }
}
