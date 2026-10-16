<?php
/**
 * =============================================================================
 * CHARUSAT StudentHub — Inquiries Viewer (view_inquiries.php)
 * Fulfills Practical 7 Extension: Display Stored CSV / JSON Records on Webpage
 * =============================================================================
 */

$jsonFile = __DIR__ . '/../data/contacts.json';
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
  <title>Logged Student Inquiries · CHARUSAT StudentHub</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/premium.css">
</head>
<body style="padding: 2.5rem 1.5rem; max-width: 1100px; margin: 0 auto; color: #fff;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <div>
      <h1 style="font-family: 'Manrope', sans-serif; font-size: 2rem; margin: 0 0 0.4rem;">
        Stored Contact &amp; Inquiry Submissions (Practical 7)
      </h1>
      <p style="color: var(--muted-color); margin: 0;">
        Persisted dynamically from server-side PHP validation into <code>data/contacts.json</code> and <code>data/contacts.csv</code>.
      </p>
    </div>
    <a href="../pages/contact.html" class="btn btn--primary" style="border-radius: 100px; text-decoration: none;">&larr; Back to Contact Page</a>
  </div>

  <div class="table-wrap">
    <table class="dash-glass-table" style="width: 100%;">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Submitted At</th>
          <th>Student Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Subject / Message</th>
          <th>IP Address</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($records)): ?>
          <tr>
            <td colspan="7" style="text-align: center; padding: 3rem; color: var(--muted-color);">
              No submissions recorded yet. Submit the contact form on <code>pages/contact.html</code> to see live records here.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($records as $r): ?>
            <tr>
              <td><b style="color: #38bdf8; font-family: monospace;"><?= htmlspecialchars($r['ticket_id']) ?></b></td>
              <td><small style="color: var(--muted-color);"><?= htmlspecialchars($r['timestamp']) ?></small></td>
              <td><b><?= htmlspecialchars($r['full_name']) ?></b></td>
              <td><a href="mailto:<?= htmlspecialchars($r['email']) ?>" style="color: #38bdf8; text-decoration: none;"><?= htmlspecialchars($r['email']) ?></a></td>
              <td><?= htmlspecialchars($r['phone'] ?: 'N/A') ?></td>
              <td>
                <b><?= htmlspecialchars($r['subject']) ?></b><br>
                <small style="color: var(--muted-color);"><?= htmlspecialchars($r['message']) ?></small>
              </td>
              <td><code><?= htmlspecialchars($r['ip_address']) ?></code></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
