<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Events RESTful JSON API & Poster Upload (api/events.php)
 * Fulfills Practical 12 & Practical 13: Event Management CRUD with Validated
 * Poster Upload (file type, size limit) & AJAX/Fetch CRUD without Page Reload.
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

if ($method === 'POST') {
    if (isset($_POST['_method'])) $method = strtoupper($_POST['_method']);
    else if (isset($_POST['action']) && $_POST['action'] === 'delete') $method = 'DELETE';
    else if (isset($_POST['action']) && $_POST['action'] === 'update') $method = 'PUT';
}

$mysqli = getMySQLiConnection(false);

function getFallbackEvents(): array {
    $f = __DIR__ . '/../data/events.json';
    if (file_exists($f)) {
        $dec = json_decode(file_get_contents($f), true);
        if (is_array($dec)) return $dec;
    }
    return [];
}

function saveFallbackEvents(array $list): void {
    $f = __DIR__ . '/../data/events.json';
    @file_put_contents($f, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// -----------------------------------------------------------------------------
// GET: List Events or Get Single Event
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $id       = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $category = trim($_GET['category'] ?? 'all');
    $search   = trim($_GET['q'] ?? $_GET['search'] ?? '');

    if ($mysqli !== null) {
        $sql = "SELECT * FROM events WHERE 1=1";
        $params = [];
        $types = '';

        if ($id > 0) {
            $sql .= " AND id = ?";
            $params[] = $id;
            $types .= 'i';
        } else {
            if ($category !== 'all' && !empty($category)) {
                $sql .= " AND category = ?";
                $params[] = $category;
                $types .= 's';
            }
            if (!empty($search)) {
                $sql .= " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
                $term = "%$search%";
                $params[] = $term; $params[] = $term; $params[] = $term;
                $types .= 'sss';
            }
            $sql .= " ORDER BY event_date ASC";
        }

        $stmt = $mysqli->prepare($sql);
        if ($params) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($id > 0) {
            $evt = $res->fetch_assoc();
            $stmt->close();
            if ($evt) {
                echo json_encode(['success' => true, 'data' => $evt]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Event not found.']);
            }
            exit;
        }

        $events = [];
        while ($row = $res->fetch_assoc()) $events[] = $row;
        $stmt->close();

        echo json_encode([
            'success' => true,
            'source'  => 'MySQL Database',
            'total'   => count($events),
            'data'    => $events
        ]);
        exit;
    } else {
        // Fallback JSON store
        $events = getFallbackEvents();
        if ($id > 0) {
            foreach ($events as $e) {
                if (($e['id'] ?? 0) == $id || ($e['id'] ?? '') === "EVT-2026-" . sprintf('%03d', $id)) {
                    echo json_encode(['success' => true, 'data' => $e]);
                    exit;
                }
            }
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Event not found.']);
            exit;
        }

        if ($category !== 'all' && !empty($category)) {
            $events = array_values(array_filter($events, function ($e) use ($category) {
                return strcasecmp($e['category'] ?? '', $category) === 0;
            }));
        }
        if (!empty($search)) {
            $events = array_values(array_filter($events, function ($e) use ($search) {
                $pool = strtolower(($e['title'] ?? '') . ' ' . ($e['description'] ?? ''));
                return strpos($pool, strtolower($search)) !== false;
            }));
        }

        echo json_encode([
            'success' => true,
            'source'  => 'JSON Datastore (Simulation)',
            'total'   => count($events),
            'data'    => $events
        ]);
        exit;
    }
}

// -----------------------------------------------------------------------------
// POST: Add Event with Validated Poster Upload (Practical 12)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    require_auth();
    if (!csrf_check()) {
        json_response(['success' => false, 'error' => 'Invalid or missing CSRF token.'], 403);
    }
    $title       = trim($_POST['title'] ?? '');
    $category    = trim($_POST['category'] ?? 'tech');
    $catLabel    = trim($_POST['category_label'] ?? ucfirst($category));
    $date        = trim($_POST['event_date'] ?? date('Y-m-d', strtotime('+7 days')));
    $time        = trim($_POST['event_time'] ?? '10:00 AM - 04:00 PM');
    $location    = trim($_POST['location'] ?? 'Central Auditorium, CSPIT');
    $description = trim($_POST['description'] ?? '');
    $seatsTotal  = (int)($_POST['seats_total'] ?? 100);
    $fee         = trim($_POST['fee'] ?? 'Free');
    $organizer   = trim($_POST['organizer'] ?? 'Student Activities Committee');

    if (empty($title) || empty($description)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Event title and description are required.']);
        exit;
    }

    // File Upload Handling with Strict Validation (Practical 12 requirement)
    $posterUrl = null;
    if (isset($_FILES['poster']) && $_FILES['poster']['error'] !== UPLOAD_ERR_NO_FILE) {
        $file = $_FILES['poster'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'File upload error code: ' . $file['error']]);
            exit;
        }

        // Validate File Size: Max 2MB (2 * 1024 * 1024 bytes)
        $maxBytes = 2 * 1024 * 1024;
        if ($file['size'] > $maxBytes) {
            http_response_code(413); // Payload Too Large
            echo json_encode(['success' => false, 'error' => 'Poster image size must not exceed 2MB.']);
            exit;
        }

        // Validate File MIME Type
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!in_array($mime, $allowedMimes)) {
            http_response_code(415); // Unsupported Media Type
            echo json_encode(['success' => false, 'error' => 'Invalid file format. Only JPEG, PNG, and WebP posters are allowed.']);
            exit;
        }

        // Safe Filename Generation
        $extension = ($mime === 'image/png') ? 'png' : (($mime === 'image/webp') ? 'webp' : 'jpg');
        $uploadDir = __DIR__ . '/../uploads/events';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $filename = 'poster_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        $targetPath = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $posterUrl = 'uploads/events/' . $filename;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save uploaded poster to disk.']);
            exit;
        }
    }

    if ($mysqli !== null) {
        $stmt = $mysqli->prepare("INSERT INTO events (title, category, category_label, event_date, event_time, location, description, poster_url, seats_total, seats_left, fee, organizer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Registration Open')");
        $stmt->bind_param('ssssssssiiss', $title, $category, $catLabel, $date, $time, $location, $description, $posterUrl, $seatsTotal, $seatsTotal, $fee, $organizer);
        if ($stmt->execute()) {
            $newId = $mysqli->insert_id;
            $stmt->close();
            logAuditAction('EVENT_CREATE', 'events', $newId, "Created event '$title' ($category)");

            http_response_code(201);
            echo json_encode([
                'success'    => true,
                'message'    => "Event '$title' created successfully.",
                'id'         => $newId,
                'poster_url' => $posterUrl
            ]);
            exit;
        }
    } else {
        $events = getFallbackEvents();
        $newId = 'EVT-2026-' . sprintf('%03d', count($events) + 1);
        $newEvent = [
            'id'            => $newId,
            'title'         => $title,
            'category'      => $category,
            'categoryLabel' => $catLabel,
            'date'          => $date,
            'displayDate'   => strtoupper(date('d M', strtotime($date))),
            'time'          => $time,
            'location'      => $location,
            'description'   => $description,
            'poster_url'    => $posterUrl,
            'seatsTotal'    => $seatsTotal,
            'seatsLeft'     => $seatsTotal,
            'fee'           => $fee,
            'organizer'     => $organizer,
            'status'        => 'Registration Open'
        ];
        $events[] = $newEvent;
        saveFallbackEvents($events);
        logAuditAction('EVENT_CREATE', 'events', count($events), "Created event '$title'");

        http_response_code(201);
        echo json_encode([
            'success'    => true,
            'message'    => "Event '$title' created successfully (JSON store).",
            'id'         => $newId,
            'poster_url' => $posterUrl
        ]);
        exit;
    }
}

// -----------------------------------------------------------------------------
// DELETE: Delete Event
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    require_auth();
    if (!csrf_check()) {
        json_response(['success' => false, 'error' => 'Invalid or missing CSRF token.'], 403);
    }
    $inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = $inputData['id'] ?? $_GET['id'] ?? 0;

    if ($mysqli !== null) {
        $intId = (int)$id;
        $stmt = $mysqli->prepare("DELETE FROM events WHERE id = ?");
        $stmt->bind_param('i', $intId);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();

        if ($affected > 0) {
            logAuditAction('EVENT_DELETE', 'events', $intId, "Deleted event #$id");
            echo json_encode(['success' => true, 'message' => "Event #$id deleted successfully."]);
            exit;
        }
    } else {
        $events = getFallbackEvents();
        $initCount = count($events);
        $events = array_values(array_filter($events, function ($e) use ($id) {
            return ($e['id'] != $id);
        }));

        if (count($events) < $initCount) {
            saveFallbackEvents($events);
            logAuditAction('EVENT_DELETE', 'events', $id, "Deleted event #$id");
            echo json_encode(['success' => true, 'message' => "Event #$id deleted successfully."]);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'error' => "Event #$id not found."]);
    exit;
}
