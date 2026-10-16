<?php
/**
 * CHARUSAT StudentHub — Database & System Diagnostics
 * Access via browser: http://<domain>/backend/test_db.php
 */
@ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$diag = [
    'time'           => date('Y-m-d H:i:s'),
    'php_version'    => PHP_VERSION,
    'configured_env' => [
        'host' => DB_HOST,
        'port' => DB_PORT,
        'user' => DB_USER,
        'name' => DB_NAME,
        'pass_length' => strlen(DB_PASS)
    ],
    'mysqli'         => [
        'connected' => false,
        'error'     => null
    ],
    'pdo'            => [
        'connected' => false,
        'error'     => null
    ]
];

// Test MySQLi
mysqli_report(MYSQLI_REPORT_OFF);
try {
    $m = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, (int)DB_PORT);
    if ($m->connect_error) {
        $diag['mysqli']['error'] = $m->connect_error;
    } else {
        $diag['mysqli']['connected'] = true;
        $diag['mysqli']['server_info'] = $m->server_info;
        
        // Count users table
        $res = $m->query("SELECT COUNT(*) AS c FROM users");
        if ($res) {
            $diag['mysqli']['users_count'] = (int)($res->fetch_assoc()['c'] ?? 0);
        }
        $m->close();
    }
} catch (Throwable $e) {
    $diag['mysqli']['error'] = $e->getMessage();
}

// Test PDO
try {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $diag['pdo']['connected'] = true;
} catch (Throwable $e) {
    $diag['pdo']['error'] = $e->getMessage();
}

if (function_exists('ob_get_length') && ob_get_length()) ob_clean();
echo json_encode($diag, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
