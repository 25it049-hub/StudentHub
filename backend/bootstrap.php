<?php
declare(strict_types=1);
/**
 * Shared bootstrap — session security, CSRF, JSON helpers
 */
if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', '1');
    @ini_set('session.cookie_samesite', 'Lax');
    @ini_set('session.use_only_cookies', '1');
    session_start();
}

function json_response(array $payload, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT);
    exit;
}

function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf_token'];
}

function csrf_check(): bool {
    $t = $_POST['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    return hash_equals($_SESSION['csrf_token'] ?? '', $t);
}
