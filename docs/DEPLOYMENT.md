# 🚀 DEPLOYMENT — Suknaa Infrastructure & Operations (v2.1)

> How we get code from Mohammad's machine to production. How we keep it running. How we recover when things break.
> **v2.1 changes**: Switched VPS provider from Hetzner to **Hostinger VPS** (matching Mohammad's existing hosting account). Backup strategy adjusted to Backblaze B2 + Hostinger Snapshots.

---

## 0. Hosting Provider: Hostinger VPS

### 0.1. Why Hostinger?
- Mohammad already has a Hostinger account (familiar dashboard)
- Arabic support available
- Competitive pricing
- KVM virtualization (full root control)
- Free snapshot backups
- Datacenter options in Europe (good latency to Syria)

### 0.2. Plan Selection

| Plan | Specs | Monthly | Best For |
|---|---|---|---|
| KVM 1 | 1 vCPU, 4GB RAM, 50GB | ~$5 | Phase 0 only |
| **KVM 2** | 2 vCPU, 8GB RAM, 100GB | ~$7 | **Phase 0-3 (Recommended start)** |
| **KVM 4** | 4 vCPU, 16GB RAM, 200GB | ~$10 | **Phase 4-launch (Recommended)** |
| KVM 8 | 8 vCPU, 32GB RAM, 400GB | ~$18 | Post-launch growth |

### 0.3. Critical Setup Choices on Hostinger
When provisioning the VPS:
1. **OS**: Ubuntu 24.04 LTS (NOT NodeJS App template — choose plain Ubuntu)
2. **Datacenter**: **Frankfurt** or **Amsterdam** (best latency to Syria; avoid USA/Asia)
3. **Hostname**: `suknaa-prod` (or similar — easy to identify)
4. **SSH Key**: Add your public key during setup; never use password auth
5. **Snapshot**: Enable automatic weekly snapshots (free)

### 0.4. Upgrade Path
Hostinger allows in-place plan upgrades (no migration needed):
- Start with KVM 2 (~$7/month) for Phase 0-3
- Upgrade to KVM 4 (~$10/month) before Phase 4 (Hospitality + heavy DB use)
- Upgrade to KVM 8 if traffic warrants (probably 6+ months post-launch)

---

## 1. Production Topology (Phase 1)

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   Cloudflare    │  ← DNS, WAF, CDN, DDoS
              │   (Free Plan)   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Hostinger VPS   │  ← KVM 4: 4 vCPU, 16GB RAM, 200GB SSD, Ubuntu 24.04
              │   suknaa.com    │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ Nginx   │   │ Docker   │   │ Restic   │
   │ (host)  │   │ Compose  │   │ Backups  │
   └─────────┘   └────┬─────┘   └────┬─────┘
                      │              │
        ┌─────────────┼──────────────┴──────────┐
        │             │              │           │
        ▼             ▼              ▼           ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ web     │  │  admin   │  │   api    │  │  chat    │
   │ Next.js │  │ Next.js  │  │ NestJS   │  │ Socket.io│
   └─────────┘  └──────────┘  └──────────┘  └──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
          ┌──────────┐        ┌──────────┐        ┌──────────┐
          │ Postgres │        │  Redis   │        │  MinIO   │
          │  + GIS   │        │          │        │          │
          └──────────┘        └──────────┘        └──────────┘
```

All on **one VPS for Phase 1**. Scaling-out plan in `ARCHITECTURE.md` Section 9.

---

## 2. Server Provisioning

### 2.1. Initial Setup (one-time, manual)

```bash
# 1. Provision Hostinger VPS (KVM 2 or KVM 4) with Ubuntu 24.04 LTS
#    - Datacenter: Frankfurt or Amsterdam (best latency to Syria)
#    - OS: Ubuntu 24.04 LTS (NOT NodeJS App template — we want plain VPS)
# 2. SSH in as root with key auth (no password login ever)
ssh root@<server_ip>

# 3. Update + essentials
apt update && apt upgrade -y
apt install -y ufw fail2ban git curl wget vim htop ncdu
apt install -y nginx certbot python3-certbot-nginx
apt install -y docker.io docker-compose-v2

# 4. Create deploy user (never use root for deployments)
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# 5. Disable root SSH login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# 6. Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 7. Fail2ban (default config protects SSH)
systemctl enable --now fail2ban

# 8. Swap (8GB swap on 8GB RAM box, helps with build spikes)
fallocate -l 8G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 9. Timezone
timedatectl set-timezone Asia/Damascus
```

### 2.2. SSH Hardening Checklist
- [ ] Root login disabled
- [ ] Password auth disabled (key-only)
- [ ] SSH on default port 22 (use Cloudflare tunnel later if needed)
- [ ] Fail2ban active on SSHD jail
- [ ] Only Mohammad's public key in `authorized_keys` (initially)

---

## 3. Domain & DNS

### 3.1. DNS Records (in Cloudflare)
| Type | Name | Value | Proxied |
|---|---|---|---|
| A | `suknaa.com` | `<server_ip>` | ✅ |
| A | `www.suknaa.com` | `<server_ip>` | ✅ |
| A | `api.suknaa.com` | `<server_ip>` | ✅ |
| A | `admin.suknaa.com` | `<server_ip>` | ✅ |
| A | `cdn.suknaa.com` | `<server_ip>` | ✅ |
| A | `chat.suknaa.com` | `<server_ip>` | ⚠️ Off (WebSockets — see note) |
| A | `staging.suknaa.com` | `<staging_ip>` | ✅ |
| A | `status.suknaa.com` | `<server_ip>` | ✅ |
| MX | `suknaa.com` | (email provider, e.g., Brevo) | — |
| TXT | `suknaa.com` | SPF, DMARC, DKIM records | — |

> **WebSocket note**: Cloudflare's free plan supports WebSockets but can have aggressive timeouts. If chat issues arise, either upgrade to Pro or move `chat.suknaa.com` to grey-cloud (DNS only).

### 3.2. Cloudflare Settings
- SSL/TLS mode: **Full (strict)** — requires valid cert on origin
- Always Use HTTPS: **On**
- Min TLS Version: **1.2**
- Automatic HTTPS Rewrites: **On**
- HSTS: **Enabled** (max-age 1 year, includeSubDomains)
- WAF: **On** with sensible rules
- Bot Fight Mode: **On**
- Browser Integrity Check: **On**
- Rate Limiting: configure rules per `SECURITY.md`

---

## 4. SSL Certificates

Wildcard certificate via Let's Encrypt + DNS-01 challenge (so subdomains are covered):

```bash
# Install Cloudflare DNS plugin
apt install python3-certbot-dns-cloudflare

# Create credentials file
cat > /root/.cloudflare.ini <<EOF
dns_cloudflare_api_token = <CLOUDFLARE_API_TOKEN>
EOF
chmod 600 /root/.cloudflare.ini

# Issue wildcard cert
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.cloudflare.ini \
  -d suknaa.com -d '*.suknaa.com' \
  --email admin@suknaa.com \
  --agree-tos --non-interactive

# Auto-renewal (already in Certbot's systemd timer)
systemctl status certbot.timer
```

Renewal hook to reload Nginx:
```bash
echo 'systemctl reload nginx' > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

---

## 5. Nginx Configuration

### 5.1. Structure
```
/etc/nginx/
├── nginx.conf                  # Main config (worker tuning, gzip, etc.)
├── sites-available/
│   ├── suknaa.conf             # Public site
│   ├── api.conf
│   ├── admin.conf
│   ├── cdn.conf
│   └── chat.conf
└── sites-enabled/              # symlinks to enabled configs
```

### 5.2. Sample: `suknaa.conf`
```nginx
# /etc/nginx/sites-available/suknaa.conf

# Redirect www → apex
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.suknaa.com;
    ssl_certificate /etc/letsencrypt/live/suknaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suknaa.com/privkey.pem;
    return 301 https://suknaa.com$request_uri;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name suknaa.com;
    return 301 https://suknaa.com$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name suknaa.com;

    ssl_certificate /etc/letsencrypt/live/suknaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suknaa.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;

    # Rate limit (defined in nginx.conf http block)
    limit_req zone=general burst=50 nodelay;

    # Body size for image uploads handled at API server
    client_max_body_size 1m;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy to Next.js public app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

### 5.3. Sample: `api.conf` (with stricter rate limits)
```nginx
server {
    listen 443 ssl http2;
    server_name api.suknaa.com;

    ssl_certificate /etc/letsencrypt/live/suknaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suknaa.com/privkey.pem;

    # Common rate limit
    limit_req zone=api burst=20 nodelay;

    # Bigger body for image uploads via API
    client_max_body_size 15m;

    # CORS (handled in NestJS, but stripped here for clarity)

    # Stricter limit for auth endpoints
    location /v1/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://127.0.0.1:4000;
        # ... proxy headers same as above
    }

    # Webhook endpoints (allow higher rate, IP-allowlist enforced in app)
    location /v1/webhooks/ {
        limit_req zone=webhooks burst=100 nodelay;
        proxy_pass http://127.0.0.1:4000;
    }

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }
}
```

### 5.4. Rate Limit Zones (in `nginx.conf` http block)
```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=200r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=webhooks:10m rate=1000r/m;
```

### 5.5. `chat.conf` (WebSocket-aware)
```nginx
server {
    listen 443 ssl http2;
    server_name chat.suknaa.com;

    ssl_certificate /etc/letsencrypt/live/suknaa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suknaa.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;        # long for WS
        proxy_send_timeout 3600s;
    }
}
```

---

## 6. Docker Compose

### 6.1. Production: `docker-compose.prod.yml`
```yaml
version: '3.9'

services:
  postgres:
    image: postgis/postgis:16-3.4
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "127.0.0.1:9000:9000"      # API
      - "127.0.0.1:9001:9001"      # Console (only via SSH tunnel)

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "127.0.0.1:4000:4000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]

  chat:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.chat
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      - redis
      - postgres
    ports:
      - "127.0.0.1:4001:4001"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      - api
    ports:
      - "127.0.0.1:3000:3000"

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      - api
    ports:
      - "127.0.0.1:3001:3001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 6.2. Local development: `docker-compose.yml`
Same services, but:
- Bind ports to `0.0.0.0` for local access
- Mount source as volumes for hot reload
- Use weaker secrets (loaded from `.env.local`)
- No restart policies

---

## 7. Environment Variables

### 7.1. `.env.production` Template
```bash
# Node
NODE_ENV=production

# App URLs
APP_URL_WEB=https://suknaa.com
APP_URL_API=https://api.suknaa.com
APP_URL_ADMIN=https://admin.suknaa.com
APP_URL_CDN=https://cdn.suknaa.com

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=suknaa_prod
POSTGRES_USER=suknaa
POSTGRES_PASSWORD=<long-random-string>
DATABASE_URL=postgresql://suknaa:${POSTGRES_PASSWORD}@postgres:5432/suknaa_prod

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<long-random-string>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=suknaa
MINIO_ROOT_PASSWORD=<long-random-string>
MINIO_BUCKET_PROPERTIES=properties
MINIO_BUCKET_PROPERTY_SPACES=property-spaces
MINIO_BUCKET_HOTELS=hotels
MINIO_BUCKET_ROOM_TYPES=room-types
MINIO_BUCKET_KYC=kyc
MINIO_BUCKET_AVATARS=avatars

# JWT
JWT_ACCESS_SECRET=<256-bit-base64>
JWT_REFRESH_SECRET=<256-bit-base64>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption (for app-level encrypted columns)
APP_ENCRYPTION_KEY=<256-bit-base64>

# SMS provider (e.g., Vonage)
SMS_PROVIDER=vonage
SMS_API_KEY=...
SMS_API_SECRET=...
SMS_FROM=Suknaa

# Email provider (e.g., Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=no-reply@suknaa.com

# Payment providers
SHAM_CASH_MERCHANT_ID=...
SHAM_CASH_API_KEY=...
SHAM_CASH_WEBHOOK_SECRET=...

MTN_CASH_MERCHANT_ID=...
MTN_CASH_API_KEY=...
MTN_CASH_WEBHOOK_SECRET=...

# (International gateway TBD)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Currency
EXCHANGE_RATE_SOURCE_URL=https://sp-today.com/...
EXCHANGE_RATE_API_KEY=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

### 7.2. Secrets Hygiene
- `.env.production` lives **only** on the server, mode 600, owner deploy
- Never committed to git (`.gitignore` enforces)
- Rotation tracked in encrypted note (Mohammad's password manager)

---

## 8. Deployment Workflow

### 8.1. Branching
- `main` → production
- `develop` → staging
- `feature/*` → individual work, PR'd to `develop`
- Hotfixes: branch from `main`, PR to `main` AND `develop`

### 8.2. CI/CD via GitHub Actions

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SSH and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /home/deploy/suknaa
            git pull origin main
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d --no-deps api chat web admin
            docker system prune -f
```

### 8.3. Database Migrations
**Never** auto-run in CI. Always:
1. Connect to server via SSH
2. Take a fresh DB backup
3. Run migration: `docker compose exec api pnpm prisma migrate deploy`
4. Verify with smoke test

### 8.4. Zero-Downtime Deploys
- API + chat are stateless → can rolling-restart
- Web + admin are SSR → user might see brief 502 during restart
- For Phase 1: brief downtime acceptable; revisit if traffic warrants
- Migrations: must be backward-compatible (Section 13 of `DATABASE_SCHEMA.md`)

---

## 9. Backups

### 9.1. Strategy
- **Daily**: PostgreSQL `pg_dump` → encrypted with restic → Backblaze B2 (recommended) or Hostinger Object Storage
- **Daily**: MinIO sync to off-site backup storage
- **Weekly**: Full system snapshot via **Hostinger Snapshot feature** (free with VPS plans)
- **Retention**: 30 daily + 12 weekly + 12 monthly (about 1 year of backups)

> **Why Backblaze B2 for off-site backup?**
> - $6/month for 1TB (very cheap)
> - S3-compatible API (works with restic + MinIO mc client)
> - Located outside your VPS datacenter (true off-site)
> - Alternative: Hostinger Object Storage if you prefer keeping everything with one vendor

### 9.2. Cron Jobs
```bash
# /etc/cron.d/suknaa-backups
# Daily DB backup at 03:00 Damascus time
0 3 * * * deploy /home/deploy/suknaa/infrastructure/scripts/backup-db.sh
# Daily MinIO sync at 03:30
30 3 * * * deploy /home/deploy/suknaa/infrastructure/scripts/backup-minio.sh
# Currency rate sync at 09:00
0 9 * * * deploy /home/deploy/suknaa/infrastructure/scripts/sync-currency.sh
# Auto-withdrawals on Thursdays at 02:00
0 2 * * 4 deploy /home/deploy/suknaa/infrastructure/scripts/auto-withdraw-weekly.sh
# Auto-withdrawals on last day of month at 02:00
0 2 28-31 * * deploy [ "$(date +\%d -d tomorrow)" = "01" ] && /home/deploy/suknaa/infrastructure/scripts/auto-withdraw-monthly.sh
# NEW v2: Market demand snapshot computation (daily at 04:00)
0 4 * * * deploy /home/deploy/suknaa/infrastructure/scripts/compute-market-snapshots.sh
# NEW v2: Pricing suggestions generator (daily at 05:00, after market snapshots)
0 5 * * * deploy /home/deploy/suknaa/infrastructure/scripts/generate-pricing-suggestions.sh
# NEW v2: Host risk score recomputation (daily at 06:00)
0 6 * * * deploy /home/deploy/suknaa/infrastructure/scripts/recompute-risk-scores.sh
# NEW v2: Price alerts trigger check (every 6 hours)
0 */6 * * * deploy /home/deploy/suknaa/infrastructure/scripts/check-price-alerts.sh
# NEW v2: Cleanup expired comparison sessions (daily at 02:00)
0 2 * * * deploy /home/deploy/suknaa/infrastructure/scripts/cleanup-comparisons.sh
```

### 9.3. `backup-db.sh` (Sample)
```bash
#!/bin/bash
set -euo pipefail
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/suknaa_${TIMESTAMP}.sql.gz"

# Dump
docker compose -f /home/deploy/suknaa/docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "${BACKUP_FILE}"

# Push to restic
restic -r sftp:storagebox:/backups backup "${BACKUP_FILE}"

# Cleanup old local copy
rm "${BACKUP_FILE}"

# Apply retention policy
restic -r sftp:storagebox:/backups forget --keep-daily 30 --keep-weekly 12 --keep-monthly 12 --prune
```

### 9.4. Restore Drill (Monthly)
- 1st Monday of each month: restore latest backup to staging
- Smoke-test: log in, browse properties, view a booking
- If restore fails: P0 incident, fix backup pipeline immediately

---

## 10. Monitoring

### 10.1. Stack (all self-hosted)
- **Uptime Kuma** (`status.suknaa.com`): external probe every 60s on every endpoint
- **Prometheus**: scrape app metrics
- **Grafana**: dashboards
- **Loki**: log aggregation
- **Promtail**: log shipping from Docker → Loki

### 10.2. Key Dashboards
- **System**: CPU, RAM, disk, network per host
- **Postgres**: connections, slow queries, table bloat
- **Redis**: memory usage, hit rate, queue depth
- **API**: request rate, p50/p95/p99 latency, error rate per endpoint
- **Business**: bookings/hour, revenue/day, signups/day, KYC queue depth, withdrawal queue depth

### 10.3. Alerting
| Alert | Threshold | Channel |
|---|---|---|
| Site down (any subdomain) | 2 min | SMS + Email + Telegram |
| API error rate > 5% | 5 min | Telegram + Email |
| DB connections > 80% pool | 5 min | Telegram |
| Disk > 80% | once | Telegram + Email |
| Disk > 90% | once | SMS + Email |
| Backup failed | once | SMS + Email |
| Withdrawal queue > 10 pending | 1 hour | Email |
| Manual payment queue > 5 pending | 1 hour | Email |

---

## 11. Logging

### 11.1. What Gets Logged
- **API access logs** (Nginx): all requests with status, duration, IP, UA
- **App logs** (NestJS): structured JSON via Pino
- **Postgres logs**: slow queries (>500ms), errors
- **Audit log table**: every admin action, every wallet mutation (already in DB, see SECURITY.md)

### 11.2. PII in Logs
**Never** log: passwords, tokens, full card numbers, full phone numbers (last 4 OK), full email (domain OK).

### 11.3. Retention
- App logs in Loki: 30 days
- Nginx access logs: 7 days (rotated, compressed)
- DB audit logs: 7 years (legal)

---

## 12. Disaster Recovery

### 12.1. Scenarios

| Scenario | RTO | RPO | Recovery Plan |
|---|---|---|---|
| Single service crash | 5 min | 0 | Docker auto-restart |
| VPS failure | 4 hours | 24 hours | Provision new VPS, restore from backup, update DNS |
| Database corruption | 4 hours | 24 hours | Restore latest backup |
| Hostinger data center down | 8 hours | 24 hours | Migrate to second VPS provider (Hetzner researched as backup) |
| All backups lost | Catastrophic | Total loss | Multi-region backup mitigates (Backblaze B2 is in different DC) |

> RTO = Recovery Time Objective; RPO = Recovery Point Objective

### 12.2. DR Runbook (high-level)
1. Confirm primary is unrecoverable
2. Provision new VPS (same specs)
3. Run server provisioning script
4. Pull latest code from git
5. Restore latest DB backup via restic
6. Restore MinIO data
7. Configure environment (copy `.env.production` from password manager)
8. Start docker compose
9. Update Cloudflare DNS to new IP
10. Smoke test
11. Communicate via status page

---

## 13. Cost Estimate (Phase 1)

| Item | Cost / month |
|---|---|
| Hostinger VPS KVM 4 (4 vCPU, 16GB RAM) | ~$10 |
| Backblaze B2 backup storage (~100GB initial) | ~$1 |
| Domain (suknaa.com) | ~$1 |
| Cloudflare | $0 (free tier) |
| SMS (low volume initially) | ~$10 |
| Email (Brevo Free up to 300/day, then ~$25) | $0–$25 |
| **Total** | **~$22–$47** |

> **Note**: KVM 2 (~$7/month) is enough for Phases 0-3. Upgrade to KVM 4 before launch when traffic and DB grow. Hostinger lets you upgrade in-place without downtime.

Scale-out trigger: when one of these is consistently > 70% utilized:
- VPS CPU
- VPS RAM
- VPS disk
- DB connections
- API p95 latency

---

## 14. Local Development Setup (for Mohammad)

```bash
# Clone repo
git clone git@github.com:<user>/suknaa.git
cd suknaa

# Install pnpm
npm install -g pnpm

# Install deps
pnpm install

# Copy env template
cp .env.example .env.local
# Edit .env.local with local values

# Start infra
docker compose up -d postgres redis minio

# Run migrations
pnpm --filter api prisma migrate dev

# Seed data
pnpm --filter api db:seed

# Start all apps in dev mode
pnpm dev
# Web at http://localhost:3000
# Admin at http://localhost:3001
# API at http://localhost:4000
# API docs at http://localhost:4000/api/docs
```

---

## 15. What Cursor / Antigravity Should Know

- Always run `pnpm install` if `package.json` changes
- Never commit `.env*` files (gitignored)
- Migrations are created with `pnpm --filter api prisma migrate dev --name <description>`
- Tests run with `pnpm test` (whole monorepo) or `pnpm --filter <pkg> test`
- Lint with `pnpm lint`; many issues auto-fix with `pnpm lint:fix`
- Build before commit: `pnpm build` (Turborepo caches, fast)
- Cursor rules in `.cursorrules` should be referenced before generating code
