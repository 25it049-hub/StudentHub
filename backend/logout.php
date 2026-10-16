<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Secure Session Logout (logout.php)
 * Fulfills Practical 10: Secure Session Destruction and Cookie Invalidation.
 * =============================================================================
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Unset all session variables
$_SESSION = [];

// 2. Clear session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

// 3. Clear remember-me cookie if present
if (isset($_COOKIE['studenthub_remember'])) {
    setcookie('studenthub_remember', '', time() - 42000, '/');
}

// 4. Destroy the session
session_destroy();

// 5. Handle AJAX/Fetch vs Standard Browser Redirect
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success'      => true,
        'message'      => 'Session successfully terminated.',
        'redirect_url' => '../pages/login.html?logged_out=1'
    ]);
    exit;
}

header('Location: ../pages/login.html?logged_out=1');
exit;
