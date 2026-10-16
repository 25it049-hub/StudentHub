<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Auth Middleware & Session Timeout (auth_check.php)
 * Fulfills Practical 10 & 14: Restrict Dashboard Access, Session Timeout Check,
 * and Role Verification.
 * =============================================================================
 */

if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', '1');
    @session_start();
}

define('SESSION_TIMEOUT_SECONDS', 900); // 15 Minutes Inactivity Timeout

/**
 * Validates session activity and handles timeout
 */
function checkSessionStatus(): array {
    if (empty($_SESSION['user_id'])) {
        return [
            'authenticated' => false,
            'reason'        => 'unauthenticated',
            'message'       => 'No active session found.'
        ];
    }

    // Check Inactivity Timeout
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT_SECONDS)) {
        session_unset();
        session_destroy();
        return [
            'authenticated' => false,
            'reason'        => 'timeout',
            'message'       => 'Your session has expired due to 15 minutes of inactivity. Please sign in again.'
        ];
    }

    // Refresh last activity timestamp
    $_SESSION['last_activity'] = time();

    return [
        'authenticated' => true,
        'user_id'       => $_SESSION['user_id'],
        'roll_no'       => $_SESSION['roll_no'] ?? '',
        'email'         => $_SESSION['email'] ?? '',
        'role'          => $_SESSION['role'] ?? 'student',
        'expires_in'    => SESSION_TIMEOUT_SECONDS
    ];
}

/**
 * Enforces role restriction (returns false / exits if unauthorized)
 */
function requireRole(string $requiredRole, bool $isApi = true): bool {
    $status = checkSessionStatus();

    if (!$status['authenticated']) {
        if ($isApi) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error'   => $status['message'],
                'reason'  => $status['reason']
            ]);
            exit;
        } else {
            header('Location: ../pages/login.html?expired=1');
            exit;
        }
    }

    if ($status['role'] !== $requiredRole) {
        if ($isApi) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error'   => 'Access Forbidden: Insufficient permissions for role ' . $requiredRole
            ]);
            exit;
        } else {
            header('Location: ../pages/dashboard.html?forbidden=1');
            exit;
        }
    }

    return true;
}

// Standalone endpoint: returns session status as JSON for frontend checks
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'auth_check.php') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(checkSessionStatus());
}
