# Security Policy

## 1. Supported versions

Only the `rebuild/v1` branch is actively maintained. Security patches are
applied to `rebuild/v1` and released as patch versions.

## 2. Reporting a vulnerability

Please disclose security vulnerabilities responsibly. Contact
arsam@arsamadineh.ir with details. Do not submit vulnerabilities through public
issues or pull requests.

## 3. Security design

- **No secrets:** Zero secrets, API keys, or credentials are embedded in code or
  committed to the repository (Rule R11).
- **No trackers or cookies:** The platform sets no cookies and embeds no
  third-party trackers (Rule R11).
- **RFC 9457 errors:** All error responses use
  `application/problem+json` (Rule R11).
- **Security headers:** `X-Content-Type-Options: nosniff`,
  `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy`, and `X-Frame-Options` are set on all responses.
- **Embed CSP:** The embed endpoint serves `Content-Security-Policy:
  frame-ancestors *` only on the embed path.
- **Rate limiting:** GCRA rate limiter with IETF `RateLimit`/`RateLimit-Policy`
  and legacy `X-RateLimit-*` headers protects against abuse.

## 4. Data safety

Legacy data is immutable (`data/legacy/`, read-only, SHA-256 verified). No
record is ever deleted; quarantined records move to `data/quarantine/` with a
machine-readable reason code (Rule R5).
