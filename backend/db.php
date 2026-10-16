<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Database Connectivity Engine (db.php)
 * Supports both PDO and MySQLi connections with prepared statements.
 * Fulfills Practical 8: MySQL Connection, Exception Handling, & Diagnostics.
 * =============================================================================
 */

// Suppress PHP warnings from corrupting JSON responses
@ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Auto-load .env configuration if present in project root
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile) && is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v, " \t\n\r\0\x0B\"'");
        $_ENV[$k] = $v;
        $_SERVER[$k] = $v;
        if (function_exists('putenv')) {
            @putenv("$k=$v");
        }
    }
}

// Configuration (Supports .env, system env vars, Docker, or standard defaults)
define('DB_HOST', $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? (function_exists('getenv') && getenv('DB_HOST') ? getenv('DB_HOST') : '127.0.0.1'));
define('DB_PORT', $_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? (function_exists('getenv') && getenv('DB_PORT') ? getenv('DB_PORT') : '3306'));
define('DB_USER', $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? (function_exists('getenv') && getenv('DB_USER') ? getenv('DB_USER') : 'root'));
define('DB_PASS', $_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? (function_exists('getenv') && getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''));
define('DB_NAME', $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? (function_exists('getenv') && getenv('DB_NAME') ? getenv('DB_NAME') : 'studenthub'));
define('DB_CHARSET', 'utf8mb4');

/**
 * Returns a PDO database instance with prepared statement configuration.
 *
 * @param bool $throwException If false, returns null when connection fails
 * @return PDO|null
 */
function getPDOConnection(bool $throwException = false): ?PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        if ($throwException) {
            throw $e;
        }
        return null;
    }
}

/**
 * Returns a MySQLi connection instance (used in Practicals 9 and 11).
 *
 * @param bool $throwException If false, returns null when connection fails
 * @return mysqli|null
 */
function getMySQLiConnection(bool $throwException = false): ?mysqli {
    static $mysqli = null;
    if ($mysqli !== null) {
        return $mysqli;
    }

    mysqli_report(MYSQLI_REPORT_OFF);
    try {
        $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, (int)DB_PORT);
        if ($conn->connect_error) {
            if ($throwException) {
                throw new Exception('MySQLi Connection Error: ' . $conn->connect_error);
            }
            return null;
        }
        $conn->set_charset(DB_CHARSET);
        $mysqli = $conn;
        return $mysqli;
    } catch (Throwable $e) {
        if ($throwException) {
            throw $e;
        }
        return null;
    }
}

/**
 * Diagnostic health check helper
 */
function checkDatabaseHealth(): array {
    $pdo = getPDOConnection(false);
    if ($pdo !== null) {
        return [
            'status'     => 'online',
            'driver'     => 'PDO MySQL',
            'host'       => DB_HOST . ':' . DB_PORT,
            'database'   => DB_NAME,
            'message'    => 'Connected successfully to MySQL server.'
        ];
    }

    return [
        'status'     => 'offline',
        'driver'     => 'None',
        'host'       => DB_HOST . ':' . DB_PORT,
        'database'   => DB_NAME,
        'message'    => 'Cannot connect to MySQL. Ensure MySQL is running in XAMPP Control Panel.',
        'help'       => 'Open XAMPP Control Panel -> Click Start next to MySQL -> Import database/schema.sql in phpMyAdmin.'
    ];
}

// Standalone execution test (e.g. php backend/db.php)
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    echo "CHARUSAT StudentHub Database Health Diagnostic:\n";
    $health = checkDatabaseHealth();
    echo json_encode($health, JSON_PRETTY_PRINT) . "\n";
}
