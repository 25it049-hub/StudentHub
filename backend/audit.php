<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Administrative Audit Logger (audit.php)
 * Fulfills Practical 14: Traceability & Audit Logging for Administrative Actions.
 * =============================================================================
 */

require_once __DIR__ . '/db.php';

function logAuditAction(string $action, string $targetEntity, $entityId = null, string $details = ''): bool {
    $userId = $_SESSION['user_id'] ?? null;
    $ip     = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    $mysqli = getMySQLiConnection(false);
    if ($mysqli !== null) {
        $stmt = $mysqli->prepare("INSERT INTO audit_logs (user_id, action, target_entity, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $eId = (int)$entityId;
            $stmt->bind_param('ississ', $userId, $action, $targetEntity, $eId, $details, $ip);
            $res = $stmt->execute();
            $stmt->close();
            return $res;
        }
    }

    // Fallback file logging
    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);
    $logFile = $dataDir . '/audit_logs.json';

    $logs = [];
    if (file_exists($logFile)) {
        $decoded = json_decode(file_get_contents($logFile), true);
        if (is_array($decoded)) $logs = $decoded;
    }

    $logs[] = [
        'id'            => count($logs) + 1,
        'user_id'       => $userId,
        'action'        => $action,
        'target_entity' => $targetEntity,
        'entity_id'     => $entityId,
        'details'       => $details,
        'ip_address'    => $ip,
        'timestamp'     => date('Y-m-d H:i:s')
    ];

    @file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    return true;
}
