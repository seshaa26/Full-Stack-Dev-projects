# DevXGen — Deployment Guide

> Complete guide to deploying DevXGen to production

---

## Architecture Overview

```
┌─────────────────┐     HTTPS      ┌──────────────────────────────────────┐
│                 │  ────────────►  │  Oracle Cloud VM                     │
│   Vercel        │                 │  ┌───────────┐    ┌──────────────┐  │
│   (Frontend)    │                 │  │  Nginx    │───►│  Node.js API │  │
│   devxgen.in    │                 │  │  :80/:443 │    │  :5000       │  │
│                 │                 │  └───────────┘    └──────┬───────┘  │
└─────────────────┘                 │                          │          │
                                    │                  ┌───────▼───────┐  │
                                    │                  │  Socket.IO    │  │
                                    │                  │  (WebSocket)  │  │
                                    └──────────────────┴───────────────┴──┘
                                                       │
                                             ┌─────────▼─────────┐
                                             │  MongoDB Atlas     │
                                             │  (Database)        │
                                             └───────────────────┘
                                                       │
                                             ┌─────────▼─────────┐
                                             │  AWS S3            │
                                             │  (Media uploads)   │
                                             └───────────────────┘
```

---

## Prerequisites

### 1. Oracle Cloud VM

1. Sign up at [Oracle Cloud](https://cloud.oracle.com) (Always Free tier includes a VM)
2. Create a **Compute Instance**:
   - Shape: `VM.Standard.A1.Flex` (1 OCPU, 6 GB RAM — free tier)
   - OS: **Ubuntu 22.04** (or latest LTS)
   - Download the SSH key pair during creation
3. Note down the **Public IP Address**

### 2. Domain DNS

Configure DNS records for your domain (`devxgen.in`):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `<Vercel IP>` | 300 |
| CNAME | `www` | `cname.vercel-dns.com` | 300 |
| A | `api` | `<Oracle VM Public IP>` | 300 |

> [!NOTE]
> Vercel provides the exact DNS values when you add a custom domain in the dashboard.

### 3. MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free **M0 cluster** (if not already done)
3. Configure **Network Access**: Add `0.0.0.0/0` or your Oracle VM's IP
4. Create a database user and copy the connection string

### 4. Google OAuth 2.0

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID**
3. Add **Authorized JavaScript Origins**:
   - `https://devxgen.in`
   - `http://localhost:5173` (for dev)
4. Add **Authorized Redirect URIs**:
   - `https://devxgen.in`
   - `http://localhost:5173` (for dev)

### 5. AWS S3

1. Create an S3 bucket: `devxgen-uploads`
2. Configure CORS on the bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedOrigins": ["https://devxgen.in", "http://localhost:5173"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
3. Create an IAM user with `AmazonS3FullAccess` (or a scoped policy)
4. Copy the **Access Key ID** and **Secret Access Key**

---

## Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub/GitLab repository
4. Set the **Root Directory** to `client`

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 3: Set Environment Variables

In Vercel → Project Settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.devxgen.in/api` |
| `VITE_GOOGLE_CLIENT_ID` | `<your Google Client ID>` |
| `VITE_SOCKET_URL` | `https://api.devxgen.in` |

### Step 4: Add Custom Domain

1. In Vercel → Project Settings → **Domains**
2. Add `devxgen.in` and `www.devxgen.in`
3. Follow the DNS configuration instructions provided by Vercel

### Step 5: Deploy

Click **Deploy**. Vercel will build and deploy automatically. Future pushes to `main` will auto-deploy.

---

## Backend Deployment (Oracle Cloud VM)

### Step 1: SSH Into Your VM

```bash
ssh -i ~/path/to/private-key ubuntu@<VM_PUBLIC_IP>
```

### Step 2: Initial Setup (First Time Only)

```bash
# Clone the repository
git clone https://github.com/<your-username>/devxgen.git
cd devxgen

# Run first-time setup (installs Docker, configures firewall, obtains SSL cert)
bash server/deploy.sh --first-run
```

> [!IMPORTANT]
> Before running `--first-run`, ensure your DNS A record for `api.devxgen.in` is already pointing to your VM's IP. Certbot needs this to verify domain ownership.

### Step 3: Configure Environment Variables

```bash
# Copy the template
cp server/.env.production server/.env

# Edit with your real values
nano server/.env
```

Fill in all the values:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://realuser:realpass@cluster.mongodb.net/devxgen?retryWrites=true&w=majority
JWT_SECRET=<generate with: openssl rand -base64 64>
GOOGLE_CLIENT_ID=<your-real-google-client-id>
AWS_ACCESS_KEY_ID=<your-real-aws-key>
AWS_SECRET_ACCESS_KEY=<your-real-aws-secret>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=devxgen-uploads
CLIENT_URL=https://devxgen.in
```

### Step 4: Deploy

```bash
bash server/deploy.sh
```

This will:
1. Pull latest code from Git
2. Build Docker images
3. Start the API + Nginx + Certbot containers
4. Run a health check to confirm everything is up

### Step 5: Verify

```bash
# Health check
curl https://api.devxgen.in/api/health

# Check container status
docker compose ps

# View logs
docker compose logs -f api
```

---

## Oracle Cloud Firewall (Ingress Rules)

> [!WARNING]
> Oracle Cloud has **two layers** of firewall: the OS-level `iptables` (handled by `deploy.sh`) and the **VCN Security List** (must be done in the Oracle Cloud Console).

1. Go to Oracle Cloud Console → Networking → Virtual Cloud Networks
2. Click on your VCN → Security Lists → Default Security List
3. Add **Ingress Rules**:

| Source CIDR | Protocol | Destination Port | Description |
|-------------|----------|-------------------|-------------|
| `0.0.0.0/0` | TCP | 80 | HTTP |
| `0.0.0.0/0` | TCP | 443 | HTTPS |

---

## Subsequent Deployments

After the initial setup, future deployments are simple:

```bash
ssh -i ~/key ubuntu@<VM_PUBLIC_IP>
cd devxgen
bash server/deploy.sh
```

Or just:
```bash
ssh -i ~/key ubuntu@<VM_PUBLIC_IP> "cd devxgen && bash server/deploy.sh"
```

---

## Useful Docker Commands

```bash
# View running containers
docker compose ps

# Tail logs (all services)
docker compose logs -f

# Tail only API logs
docker compose logs -f api

# Restart API without rebuilding
docker compose restart api

# Rebuild and restart everything
docker compose up -d --build

# Stop everything
docker compose down

# Remove everything including volumes
docker compose down -v
```

---

## SSL Certificate Renewal

Certificates auto-renew via the Certbot container and a cron job. To manually renew:

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

---

## Troubleshooting

### API returns 502 Bad Gateway
- Check if the API container is running: `docker compose ps`
- Check API logs: `docker compose logs api`
- Common cause: MongoDB connection failure (check `MONGO_URI`)

### CORS Errors in Browser
- Verify `CLIENT_URL` in `server/.env` matches your frontend URL exactly (including `https://`)
- Check browser console for the specific error message

### WebSocket Connection Fails
- Ensure the Nginx config has the WebSocket upgrade headers
- Verify `VITE_SOCKET_URL` in Vercel env vars points to `https://api.devxgen.in`
- Check if port 443 is open in Oracle Cloud Security List

### SSL Certificate Issues
- Ensure DNS A record for `api.devxgen.in` points to your VM IP
- Check Certbot logs: `docker compose logs certbot`
- If cert is expired: `docker compose run --rm certbot renew`

### Health Check Fails
```bash
# Test directly on the VM
curl http://localhost:5000/api/health

# If that works but HTTPS doesn't, it's an Nginx/SSL issue
docker compose logs nginx
```

---

## Post-Deployment Checklist

- [ ] `https://devxgen.in` loads the frontend
- [ ] `https://api.devxgen.in/api/health` returns `{ "status": "ok" }`
- [ ] Google OAuth sign-in works
- [ ] Posts can be created
- [ ] Image uploads to S3 work
- [ ] Real-time notifications (WebSocket) work
- [ ] Comments load correctly
- [ ] Mobile responsive layout works
