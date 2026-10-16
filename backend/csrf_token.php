<?php
/**
 * CSRF token issuer — returns a token bound to the current session.
 * Frontend fetches this, then includes it as `csrf_token` in form POSTs.
 */
require_once __DIR__ . '/bootstrap.php';
json_response(['success' => true, 'csrf_token' => csrf_token()]);
