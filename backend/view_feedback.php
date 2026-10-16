<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Feedback Viewer (backend/view_feedback.php)
 * Displays all student voice ratings and feedback stored in JSON & MySQL.
 * =============================================================================
 */

$jsonFile = __DIR__ . '/../data/feedback.json';
$records = [];
if (file_exists($jsonFile)) {
    $content = @file_get_contents($jsonFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $records = array_reverse($decoded); // Latest first
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Logged Student Feedback · CHARUSAT StudentHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/premium.css">
</head>
<body style="padding: 2.5rem 1.5rem; max-width: 1200px; margin: 0 auto; color: #fff; background: var(--bg-outer, #070e1c);">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
    <div>
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
        <span class="badge" style="background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Council Archive</span>
        <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Live Sync</span>
      </div>
      <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2.1rem; font-weight: 900; margin: 0 0 0.4rem;">
        Logged Student Voice &amp; Portal Feedback
      </h1>
      <p style="color: var(--muted-color); margin: 0; font-size: 0.95rem;">
        Submissions persisted dynamically into <code>data/feedback.json</code>, <code>data/feedback.csv</code>, and MySQL <code>feedback</code> table.
      </p>
    </div>
    <div style="display: flex; gap: 0.75rem;">
      <a href="../pages/feedback.html" class="btn btn--primary" style="border-radius: 100px; text-decoration: none; font-weight: 800;">&larr; Back to Feedback Form</a>
      <a href="view_inquiries.php" class="btn btn--outline" style="border-radius: 100px; text-decoration: none; font-weight: 700;">View Inquiries &rarr;</a>
    </div>
  </div>

  <div class="table-wrap" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1.25rem; padding: 1.5rem; backdrop-filter: blur(20px); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
    <table class="dash-glass-table" style="width: 100%; text-align: left; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Ref ID</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Rating</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Type</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Student Info</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Department</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Comments</th>
          <th style="padding: 1rem 0.75rem; color: #38bdf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($records)): ?>
          <tr>
            <td colspan="7" style="text-align: center; padding: 3rem; color: var(--muted-color);">
              No feedback recorded yet. Submit feedback on <code>pages/feedback.html</code> to see live records here.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($records as $r): ?>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 0.85rem 0.75rem;"><b style="color: #38bdf8; font-family: monospace;"><?= htmlspecialchars($r['ref_id']) ?></b></td>
              <td style="padding: 0.85rem 0.75rem;">
                <span style="color: #fbbf24; font-weight: 800;">
                  <?= str_repeat('★', (int)($r['rating'] ?? 5)) ?><?= str_repeat('☆', 5 - (int)($r['rating'] ?? 5)) ?>
                  (<?= (int)($r['rating'] ?? 5) ?>/5)
                </span>
              </td>
              <td style="padding: 0.85rem 0.75rem;">
                <span class="badge" style="background: rgba(255, 255, 255, 0.08); font-size: 0.72rem; text-transform: capitalize;">
                  <?= htmlspecialchars($r['feedback_type'] ?? 'suggestion') ?>
                </span>
              </td>
              <td style="padding: 0.85rem 0.75rem;">
                <b><?= htmlspecialchars($r['student_name'] ?? 'Anonymous') ?></b><br>
                <small style="color: var(--muted-color);"><?= htmlspecialchars($r['enrolment'] ?? 'N/A') ?></small>
              </td>
              <td style="padding: 0.85rem 0.75rem;">
                <span style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.8);"><?= htmlspecialchars($r['department'] ?? 'Information Technology') ?></span>
              </td>
              <td style="padding: 0.85rem 0.75rem; max-width: 320px;">
                <p style="margin: 0; font-size: 0.84rem; line-height: 1.5; color: rgba(255, 255, 255, 0.85);"><?= htmlspecialchars($r['comments'] ?? '') ?></p>
              </td>
              <td style="padding: 0.85rem 0.75rem; white-space: nowrap;">
                <small style="color: var(--muted-color); font-size: 0.78rem;"><?= htmlspecialchars($r['timestamp'] ?? '') ?></small>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
