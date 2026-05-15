# 🔐 SECURITY — Suknaa Security Architecture (v2)

> Security is not a feature; it is a property of every other feature.
> **v2 changes**: Added KYC variants per host category, anti-circumvention engine, dual-system access control, host risk scoring.

---

## 1. Threat Model (Top Risks)

| # | Threat | Impact | Mitigations |
|---|---|---|---|
| 1 | Account takeover via credential stuffing | High | Strong password policy, 2FA mandatory for hosts/admins, rate limiting, breach-detection (HIBP) |
| 2 | Payment fraud (fake receipts) | High | Manual review, image forensics, banking cross-reference, escrow model |
| 3 | Identity fraud (fake KYC) | High | Liveness check, manual review, reputation system, category-specific docs |
| 4 | Off-platform payment circumvention | High | **NEW v2: anti-circumvention engine** (reasons + risk scoring) + chat regex blocks + post-booking-only chat |
| 5 | Listing fraud (fake properties/hotels) | Medium | Mandatory admin approval, reverse image search, host verification |
| 6 | Booking spam / scraper abuse | Medium | Rate limiting, CAPTCHA on signup, behavior analysis |
| 7 | Database breach | Critical | Encryption at rest, principle of least privilege, no PII in logs |
| 8 | DDoS / availability attacks | Medium | Cloudflare WAF, rate limits |
| 9 | Insider threat (compromised admin) | Critical | Granular permissions, mandatory 2FA, full audit log, IP allowlist for admin panel |
| 10 | Cross-site attacks (XSS, CSRF) | High | CSP, sanitization, CSRF tokens, SameSite cookies |
| 11 | **NEW v2**: Hotel inventory manipulation (artificial scarcity for price gouging) | Medium | Audit log of all `room_units` changes, statistical anomaly detection |
| 12 | **NEW v2**: Pricing intelligence gaming (host follows AI suggestions to overcharge) | Low | Suggestions are bounded (no >40% increase); long-term reputation hits low-rating hosts |

---

## 2. Authentication

### 2.1. Password Policy
- Minimum 10 characters
- Must include uppercase, lowercase, and number
- Checked against Have I Been Pwned (HIBP) on signup and password change
- Stored as **argon2id** hash (memory: 64MB, iterations: 3, parallelism: 4)

### 2.2. Session Management
- **Access token**: JWT, 15-minute expiry, kept in memory
- **Refresh token**: opaque random 256-bit, 7-day expiry, httpOnly + Secure + SameSite=Strict cookie
- Refresh token hash stored in DB (`auth_sessions`) — server can revoke
- "Remember me" extends refresh token to 30 days

### 2.3. OTP
- 6-digit numeric, 5-minute expiry
- Maximum 5 attempts before lockout (15 minutes)
- Rate-limited: max 3 OTPs per phone per hour

### 2.4. Two-Factor Authentication
| Role | 2FA |
|---|---|
| Guest | Optional (recommended) |
| Vacation rental host | **Mandatory** before publishing |
| Hospitality Host | **Mandatory** before publishing |
| Admin | **Mandatory** before login |
| Super Admin | **Mandatory** + hardware key recommended |

Methods: TOTP (preferred) > SMS > Email (guests only).
Backup codes: 10 single-use codes, hashed in DB.

### 2.5. Login Intent (NEW v2)
After successful auth, the user's chosen "Login as Guest" or "Login as Host" intent is recorded in the session. This:
- Routes the post-login redirect (guest dashboard vs host dashboard)
- Records `users.last_login_as` for next-session default
- If "Host" but `is_host=false` → triggers "Become a Host" onboarding (KYC + category selection)

This is UX-level; Phase 2 security still depends on `is_guest` / `is_host` / `is_admin` flags for actual permission checks. Long term, operational access must move to granular permissions/capabilities because hotels, companies, and Suknaa staff need per-user customization.

### 2.6. Account Lockout
- 5 failed password attempts in 15 minutes → temporarily locked
- Progressive lockout: 15 min → 1 hour → 6 hours → 24 hours
- Email + SMS notification on lockout

---

## 3. Authorization — Roles For Bootstrapping, Permissions For Operations

### 3.1. Bootstrap Roles
A user has one or more of: `is_guest`, `is_host`, `is_admin`, `is_super_admin`.
A `host_profile` records `host_category` (`vacation_rentals` or `hospitality`; DB may still store legacy `real_estate` until M2b) and `host_subtype`.

These flags are acceptable for Phase 2 foundation. They are not enough for the full product. Starting with dashboard/admin/financial tooling, Suknaa should use:
- Permission templates for common jobs, such as owner, front desk, accounting, support, KYC reviewer, finance approver
- Per-user permission overrides
- Organization/company membership for hotels, vacation rental operators, and Suknaa internal teams
- Invitation flow for hotel/company owners to add staff
- Full audit logs for permission changes and sensitive actions

High-risk financial capabilities must be separate permissions, not implied by a broad role. Examples: `pricing.rules.manage`, `commission.override`, `service_fee.override`, `tax_rules.approve`, `tax_rules.override`, `discount_codes.manage`, `refunds.process`, `wallet.adjust`.

### 3.2. Permission Matrix (sample, updated for v2)

| Action | Guest | Host (Vacation rentals) | Host (Hotel) | Admin | SuperAdmin |
|---|---|---|---|---|---|
| Browse all listings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book a stay (listing or room) | ✅ | ✅ | ✅ | ✅ | ✅ |
| List a vacation rental | ❌ | ✅ (KYC'd) | ❌ | ❌ | ❌ |
| List a hotel | ❌ | ❌ | ✅ (KYC'd) | ❌ | ❌ |
| Manage own listings | ❌ | ✅ (own) | ✅ (own) | ❌ | ❌ |
| Toggle commission passthrough | ❌ | ✅ (own, no active bookings) | ✅ (own, no active bookings) | ❌ | ❌ |
| Reduce availability | ❌ | ✅ (own + reason) | ✅ (own + reason) | ❌ | ❌ |
| Approve listing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve KYC | ❌ | ❌ | ❌ | ✅ | ✅ |
| Process refund | ❌ | ❌ | ❌ | ✅ | ✅ |
| Override commission rate | ❌ | ❌ | ❌ | Permissioned | Permissioned |
| Override service fee | ❌ | ❌ | ❌ | Permissioned | Permissioned |
| Approve/override tax rules | ❌ | ❌ | ❌ | Permissioned | Permissioned |
| Manage discount/coupon rules | ❌ | ❌ | ❌ | Permissioned | Permissioned |
| Create admin account | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manual wallet adjustment | ❌ | ❌ | ❌ | ❌ | ✅ |
| Anti-circumvention review | ❌ | ❌ | ❌ | ✅ | ✅ |
| View any user's full profile | ❌ | ❌ | ❌ | ✅ | ✅ |

### 3.3. Object-Level Permissions
- A vacation rental host **cannot** create a hotel (returns `WRONG_HOST_CATEGORY`)
- A hotel host **cannot** create a vacation rental listing (same)
- A user with both categories registered (rare but allowed) can do both
- Hosts only see/edit their own vacation rentals + hotels
- Guests only see their own bookings; hosts only see bookings for their listings
- Hotel/company staff only see objects owned by their organization unless explicitly granted broader access
- Suknaa staff only get the capabilities needed for their job; broad admin access is not the default

Enforced in service layer (not just controller).

---

## 4. KYC (Know Your Customer) — Updated for v2

### 4.1. Document Requirements by Host Type

#### 4.1.1. Vacation rentals — Individual host
- National ID (Syrian) or Passport: front + back
- Selfie holding the ID (proof of liveness)
- **Legal control of the stay unit** (ownership proof OR notarized rental authorization to sublet for short stays)

#### 4.1.2. Vacation rentals — `vacation_rental_operator` host (مشغّل بيوت عطلات)
- ID + selfie of the authorized representative
- **Commercial registration certificate** of the operator
- Tax ID
- Authorization letter (if rep is not the legal owner)

#### 4.1.3. Hospitality — Hotel Company Host
- ID + selfie of the company representative
- **Commercial registration certificate** of the hotel/company
- Tax ID
- Authorization letter (if rep is not the legal owner)
- **Hotel operating license** (issued by Ministry of Tourism or equivalent)

### 4.2. Optional for Guests
- Encouraged but not required
- Verified guests get a "Verified Guest" badge
- Some hosts may set "Verified Guests Only" filter on their listings

### 4.3. Verification Process
1. User uploads documents (encrypted in transit + at rest in MinIO)
2. Submission queued in `kyc_submissions`
3. Admin reviews:
   - ID validity
   - Selfie matches ID photo
   - Ownership/license documents legitimate
   - **For hospitality**: Hotel license cross-checked with public registry if available
4. Approve or Reject (with reason)
5. User notified via email + SMS

### 4.4. KYC Refresh
- KYC expires after 2 years
- User notified 30 days before expiry
- Cannot publish new listings or withdraw if expired

### 4.5. Document Storage
- Encrypted at rest (MinIO server-side encryption)
- Access logged in audit log (every view of a KYC document recorded)
- Auto-deleted after 7 years post-account-deletion (legal retention)

---

## 5. Off-Platform Communication Prevention

### 5.1. Where Contact Info Is Blocked

| Surface | Blocking Method |
|---|---|
| Listing/hotel descriptions | Regex on submit + admin manual review |
| Listing/hotel titles | Regex on submit |
| Profile bios | Regex on submit |
| Pre-booking messages | **Disabled entirely** — no chat before booking confirmed |
| Post-booking chat | Regex with warnings + admin flag |
| Reviews | Regex on submit |

### 5.2. Patterns Blocked
Maintained in a single config file:
- Phone numbers (Syrian: 09XX, international: +country)
- Email addresses
- Social handles (@username, IG/Telegram/WhatsApp)
- URLs (http://, www., .com, .sy)
- Common evasion: "zero nine" → digits, "@gmail dot com", spaces between digits

### 5.3. Enforcement
- **Pre-booking listings/profiles**: hard block — submission rejected
- **Post-booking chat**: soft block — message goes through but flagged; user gets warning toast
- Tracked in `host_risk_signals.blocked_messages_30d`
- 3 strikes → temporary suspension → permanent ban

---

## 6. Anti-Circumvention Engine (NEW v2 — CRITICAL)

This protects revenue and trust. Detailed system below.

### 6.1. The Threat Pattern
A host has 5 hotel rooms. They get a guest interested but want to book "directly" (Sham Cash to host's personal wallet, no commission). To pretend the room is unavailable on Suknaa, the host marks 2 rooms as "blocked" in the inventory. Suknaa shows "3 of 5 available" and never sees the off-platform booking.

### 6.2. Detection Approach: Forced Reasons + Risk Scoring

#### 6.2.1. Forced Reasons
Every time a host reduces inventory (blocks a room or whole vacation rental), they MUST select a reason:

| Reason Code | Description | Risk Weight |
|---|---|---|
| `maintenance` | Renovation, repairs | Low (1) |
| `personal_use` | Owner using it | Low (2) |
| `rented_offline` | Rented to a known party off-Suknaa | **High (10)** |
| `long_term_rental` | Multi-month tenant | Medium (3) |
| `renovation` | Major renovation | Low (1) |
| `other` | Free text required | Medium (4) |

> **Why include `rented_offline` as an option?** Honesty is rewarded. If a host self-reports it, we accept it (with monitoring). If they hide it, we punish heavily. This funnels honest behavior.

#### 6.2.2. Risk Score Calculation
For each `availability_reduction_event`, compute:
```
event_score = reason_weight × log(1 + days_affected) × log(1 + units_blocked)
```

Per-host risk score (rolling 90 days):
```
host_risk_score = sum(event_scores in last 90 days)
                + (cancellation_rate × 20)
                + (blocked_messages_30d × 5)
                + (low_review_count × 2)
```

Capped at 100. Stored in `host_risk_signals.risk_score`.

#### 6.2.3. Risk Tiers and Consequences

| Tier | Score | Consequence |
|---|---|---|
| Low | 0–25 | Normal operations |
| Medium | 26–50 | Higher commission percentage on next renewal cycle (e.g., 12% → 14%); more frequent admin spot-checks |
| High | 51–75 | Mandatory admin chat before next listing approval; cannot enable commission passthrough |
| Critical | 76–100 | Account review; temporary listing freeze; possible suspension |

### 6.3. Statistical Anomaly Detection
Daily cron job flags hosts whose:
- Inventory reduction rate is in the top 5% of their category
- Cancellation rate is > 2× the category average
- Reduction events frequently coincide with high-engagement listings (lots of views/inquiries → suddenly "unavailable")

Flagged events appear in admin queue (`triggered_admin_review = true`).

### 6.4. Admin Review Workflow
1. Admin sees flagged event with full context (host history, reduction pattern, recent listings activity)
2. Admin can:
   - **Clear** — false positive, no action
   - **Warn** — internal note + warning email to host
   - **Penalize** — apply commission increase / disable passthrough
   - **Suspend** — temporary or permanent
3. Decision logged in `availability_reduction_events.admin_decision` and `audit_logs`

### 6.5. Host Communication
Hosts can see their own risk tier in their dashboard (transparency builds trust). They cannot see the exact score (avoid gaming).

### 6.6. The Light Touch Principle
The system isn't punishing legitimate use — it's tracking *patterns*. A host with 1 maintenance event in 6 months is fine. A host with 15 "rented_offline" events in a month is not.

False positives cost trust. **Tune the scoring conservatively at first** (e.g., set "high" threshold at 75 instead of 50 for the first 3 months). Use admin review as the safety net.

---

## 7. Web Application Security

### 7.1. HTTP Security Headers (Nginx + Next.js middleware)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' cdn.suknaa.com data:; ... (strict)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

### 7.2. CSRF Protection
- All state-changing endpoints require CSRF token
- Token in httpOnly cookie + custom header (`X-CSRF-Token`)
- SameSite=Strict on session cookies

### 7.3. XSS Protection
- React's default escaping (never `dangerouslySetInnerHTML` without DOMPurify)
- Property/hotel descriptions: stored as plain text, rendered with line breaks
- Admin can format with allow-listed HTML tags (DOMPurify config)

### 7.4. SQL Injection
- All queries via Prisma (parameterized)
- Raw queries only for PostGIS spatial queries, always parameterized
- No string concatenation into SQL — ever

### 7.5. File Upload Security
- File type validated by **content** (magic bytes), not extension
- Allowed: JPEG, PNG, WebP, AVIF (images); PDF (KYC docs)
- Maximum size: 10MB per file
- Filenames sanitized: random UUID, no user-provided names
- Images processed via sharp (re-encoded, EXIF stripped)
- Virus scanning: ClamAV on KYC documents

### 7.6. Rate Limiting (Nginx + app-level)
| Endpoint | Limit |
|---|---|
| `/auth/login` | 5/min per IP |
| `/auth/signup` | 3/min per IP |
| `/auth/otp/request` | 3/hour per phone |
| `/auth/otp/verify` | 5/min per OTP |
| Search endpoints | 60/min per IP |
| Other GET | 200/min per IP |
| Other POST/PUT/DELETE | 60/min per IP |
| Webhooks | 1000/min per IP (allowlisted) |
| **NEW v2**: Availability reduction endpoints | 10/hour per host (prevents script-driven inventory manipulation) |

---

## 8. Data Protection

### 8.1. Encryption
- **At rest**: PostgreSQL with disk encryption (LUKS); MinIO with server-side encryption
- **In transit**: TLS 1.3 only, strong ciphers, HSTS preload
- **Sensitive fields** (bank details, TOTP secrets): app-level encryption with `pgcrypto`, key in environment

### 8.2. PII Handling
- Phone numbers stored normalized (E.164)
- Emails stored lowercased
- Last 4 digits of phone may appear in UI; full phone never returned to other users
- Property addresses revealed only after booking confirmed (P2P)
- Hotel addresses always visible (B2B norm)
- IP addresses logged in `audit_logs`, retained 90 days, then anonymized

### 8.3. PII Redaction in Logs
- App logs scrub: passwords, tokens, full card numbers, full phone numbers
- Configurable middleware ensures no `password`, `token`, `secret` keys leak

### 8.4. Data Subject Rights
- **Export**: user can download all their data as JSON
- **Delete**: user can request account deletion; financial records retained but PII anonymized

---

## 9. Admin Panel Security

### 9.1. Network Isolation
- `admin.suknaa.com` behind IP allowlist (Cloudflare Access or Nginx)
- Allowlist configurable from a separate "infra" repo (changes need review)

### 9.2. Mandatory Hardening for Admins
- 2FA required (TOTP, no SMS for admins)
- Sessions expire after 1 hour of inactivity
- Re-authentication required for sensitive actions (refunds, KYC approval, manual wallet adjustment, anti-circumvention decisions)
- Cannot use the same browser as their personal Suknaa user account (browser fingerprint check)

### 9.3. Audit Trail
Every admin action writes to `audit_logs` with: admin user ID, action type, target entity, before/after state (JSON diff), IP address, user agent, timestamp.

Audit logs are append-only (no UPDATE/DELETE permission for any role, including super admin).

---

## 10. Operational Security

### 10.1. Secrets Management
- All secrets in `.env` files, never in git
- Production `.env` lives only on production server, owned root, mode 600
- Rotation schedule: JWT signing key annually; DB password annually; provider webhook secrets when supported

### 10.2. Backups
- **Daily**: PostgreSQL `pg_dump` → encrypted with restic → Backblaze B2
- **Weekly**: full system snapshot
- **Encryption**: GPG with strong passphrase
- **Retention**: 30 daily + 12 weekly + 12 monthly
- **Restore drill**: monthly on staging

### 10.3. Monitoring & Alerting
- **Uptime Kuma**: external probes for all subdomains
- **Grafana + Prometheus**: app + DB metrics
- **Loki**: centralized logs
- Alerts: Email (always), Telegram (P1), SMS (P0)
- **NEW v2 alerts**: anti-circumvention queue >5 pending; pricing-suggestion accept rate <10% (system needs tuning)

### 10.4. Incident Response
A simple runbook in `docs/INCIDENT_RESPONSE.md`:
1. Identify severity (P0/P1/P2)
2. Communicate via status page within 30 min for P0
3. Assemble responders
4. Mitigate
5. Post-mortem within 7 days

---

## 11. Compliance

### 11.1. Legal Considerations (research with Syrian lawyer)
- Tax obligations on commission revenue
- Consumer protection requirements
- KYC retention periods
- Tourism / hospitality regulations
- Money handling licenses (does Suknaa need a license to hold escrow?)

### 11.2. Terms of Service & Privacy Policy
- Both in Arabic and English
- Clear language (no legalese)
- Drafted with legal counsel before public launch
- Versioned — changes require re-acceptance for active users

---

## 12. Security Checklist Per Phase

### Phase 0–1
- [ ] HTTPS everywhere
- [ ] HSTS enabled
- [ ] Security headers configured

### Phase 2 (Auth)
- [ ] argon2id for passwords
- [ ] Rate limiting on auth endpoints
- [ ] OTP flow with attempt limits
- [ ] 2FA implementation
- [ ] HIBP integration
- [ ] Session management with revoke

### Phase 3 (Vacation rentals)
- [ ] Image upload virus scanning + EXIF strip
- [ ] PostGIS queries parameterized
- [ ] File type validation by content

### Phase 4 (Hospitality)
- [ ] Per-room-unit lock prevention against race conditions
- [ ] Hotel KYC requires extra documents

### Phase 5 (Bookings + Payments)
- [ ] Webhook signature verification
- [ ] Idempotency middleware
- [ ] DB advisory locks on booking creation
- [ ] Audit log on every wallet mutation
- [ ] Commission passthrough math has unit tests covering edge cases

### Phase 6 (Chat)
- [ ] Contact-info regex blocking
- [ ] Message content moderation
- [ ] Rate limiting on messages

### Phase 7 (Admin)
- [ ] IP allowlist
- [ ] Mandatory 2FA
- [ ] Re-auth for sensitive actions
- [ ] Append-only audit log

### Phase 8 (Smart Features)
- [ ] **NEW v2**: Anti-circumvention scoring algorithm reviewed for false positives
- [ ] **NEW v2**: Pricing suggestions bounded (max ±40% change)
- [ ] **NEW v2**: Scarcity nudges only fire on real data

### Phase 9 (Pre-Launch)
- [ ] Penetration test (internal or external)
- [ ] Dependency audit
- [ ] Backup restore drill
- [ ] Incident response runbook
- [ ] Legal review of terms

---

## 13. Things We're Explicitly NOT Doing

| Not Doing | Why |
|---|---|
| Storing card numbers ourselves (PCI-DSS scope) | Use a processor that takes the burden |
| Building our own SMS gateway | Use established providers |
| Custom encryption algorithms | Use battle-tested libs |
| Security through obscurity | Endpoints predictable; security in auth/authz |
| Trusting client-side validation | All validation re-done server-side |
| **NEW v2**: Auto-banning hosts on risk score | Always require admin review — reputation damage from false bans is catastrophic |
| **NEW v2**: Showing exact risk score to hosts | Could be gamed; only show tier |
