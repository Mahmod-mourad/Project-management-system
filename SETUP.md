# ERP System - Complete Setup Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Docker Setup](#docker-setup)
3. [Production Deployment](#production-deployment)
4. [Database Setup](#database-setup)
5. [Supabase Integration](#supabase-integration)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
```bash
# Check Node.js version (need 20+)
node --version

# Install npm dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Environment Configuration

1. **Frontend Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. **Backend Configuration**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=erp_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_key

# JWT
JWT_SECRET=your_secure_random_string

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Database Setup (Local PostgreSQL)

```bash
# Create database
createdb -U postgres erp_db

# Run migrations
cd scripts
psql -U postgres -d erp_db -f 01-create-multi-tenant-schema.sql
psql -U postgres -d erp_db -f 02-add-tenant-id-to-existing-tables.sql
psql -U postgres -d erp_db -f 03-seed-demo-tenants.sql
psql -U postgres -d erp_db -f 04-create-backend-tables.sql
psql -U postgres -d erp_db -f 05-create-notifications-table.sql
psql -U postgres -d erp_db -f 06-initialize-production-database.sql
```

### Run Development Servers

**Terminal 1 - Frontend**
```bash
npm run dev
# Frontend will run on http://localhost:3000
```

**Terminal 2 - Backend**
```bash
cd backend
npm run start:dev
# Backend will run on http://localhost:3001
```

**Terminal 3 - Database (if using local PostgreSQL)**
```bash
# Make sure PostgreSQL service is running
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start
```

---

## Docker Setup

### Quick Start with Docker Compose

1. **Configure Environment**
```bash
cp .env.production .env
```

Edit `.env`:
```env
DB_PASSWORD=your_secure_password
DB_NAME=erp_db
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
JWT_SECRET=your_secure_random_string
```

2. **Build and Run**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

3. **Initialize Database**
```bash
# Wait for postgres to be ready (about 10 seconds)
docker-compose exec postgres pg_isready -U postgres

# Run migrations
docker-compose exec postgres psql -U postgres -d erp_db -f /docker-entrypoint-initdb.d/01-create-multi-tenant-schema.sql
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Individual Docker Container Operations

```bash
# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres

# Execute command in container
docker-compose exec backend npm run migration:run
docker-compose exec postgres psql -U postgres erp_db

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

---

## Production Deployment

### Server Requirements

**Minimum**
- 2 vCPU
- 4 GB RAM
- 20 GB storage
- Ubuntu 20.04 LTS or similar

**Recommended**
- 4 vCPU
- 8 GB RAM
- 100 GB SSD storage
- Ubuntu 22.04 LTS

### Pre-deployment Checklist

- [ ] DNS configured (yourdomain.com)
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Server firewall configured
- [ ] SSH access verified
- [ ] Backups configured
- [ ] Monitoring set up

### Deploy to Linux Server

1. **Connect to Server**
```bash
ssh user@your-server-ip
```

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

3. **Clone Repository**
```bash
cd /opt
sudo git clone <repo-url> erp-system
cd erp-system
sudo chown -R $USER:$USER .
```

4. **Configure Environment**
```bash
cp .env.production .env

# Edit with production values
nano .env
```

5. **Configure SSL/TLS**
```bash
# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificate path for Nginx config
# Typically: /etc/letsencrypt/live/yourdomain.com/
```

6. **Configure Nginx**
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/erp

# Add reverse proxy configuration (see nginx.conf in repo)
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Start Services**
```bash
# Build Docker images
docker-compose build

# Start containers
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migration:run

# Verify logs
docker-compose logs -f
```

8. **Setup Auto-restart**
```bash
# Create systemd service
sudo nano /etc/systemd/system/docker-erp.service

# Add:
[Unit]
Description=ERP System Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/erp-system
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
Restart=always

[Install]
WantedBy=multi-user.target

# Enable service
sudo systemctl enable docker-erp
sudo systemctl start docker-erp
```

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.medium (minimum)
   - Storage: 50GB EBS
   - Security group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect and Setup**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
# Follow steps from "Deploy to Linux Server" above
```

3. **Create RDS Database (Optional)**
   - Engine: PostgreSQL 16
   - Instance: db.t3.small
   - Storage: 100GB
   - Multi-AZ: Yes for production
   - Backup retention: 30 days

4. **Update Backend Environment**
```bash
# Update .env with RDS endpoint
DB_HOST=your-rds-endpoint.amazonaws.com
```

### Kubernetes Deployment

1. **Create Kubernetes Manifests**
```bash
mkdir -p k8s/
# Create deployment, service, configmap, secret files
```

2. **Deploy**
```bash
kubectl apply -f k8s/

# Verify
kubectl get pods
kubectl get services
```

---

## Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create new project
   - Copy Project URL and API keys

2. **Enable Row Level Security**
   - Go to Authentication → Policies
   - Enable RLS on all tables
   - Configure policies for multi-tenancy

3. **Configure Replication**
   - Enable logical replication for real-time features
   - Enable publication on necessary tables

### Backup Strategy

**Local Backups**
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Full backup
docker-compose exec -T postgres pg_dump -U postgres erp_db | \
  gzip > $BACKUP_DIR/erp_db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

**Cloud Backups**
```bash
# Upload to AWS S3
aws s3 sync /backups/postgresql s3://your-bucket/backups/ --delete
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Reverse proxy
    location / {
        proxy_pass http://frontend:3000;
    }

    location /api {
        proxy_pass http://backend:3001;
    }
}
```

---

## Monitoring & Logs

### Docker Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### System Monitoring

```bash
# Install monitoring tools
docker-compose exec backend npm install --save pm2

# Monitor with PM2
pm2 start ecosystem.config.js
pm2 logs
```

### Application Performance Monitoring (APM)

```bash
# Install APM client
cd backend
npm install @elastic/apm-node

# Configure in main.ts
const apm = require('@elastic/apm-node').start()
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database Connection Error**
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d erp_db -c "SELECT 1"

# In Docker
docker-compose exec postgres psql -U postgres -d erp_db -c "SELECT 1"
```

**Docker Compose Issues**
```bash
# Rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**Out of Memory**
```bash
# Check disk space
df -h

# Clean Docker
docker system prune -a
docker volume prune
```

### Get Help

1. Check logs: `docker-compose logs -f`
2. Check health: `docker-compose ps`
3. Open issue on GitHub
4. Contact support: support@company.com

---

## Performance Tuning

### PostgreSQL

```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Increase work memory
ALTER SYSTEM SET work_mem = '16MB';

-- Create indexes
CREATE INDEX idx_tenant_id ON users(tenant_id);
CREATE INDEX idx_created_at ON invoices(created_at);
```

### Redis

```bash
# Configure Redis memory
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Docker Compose

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

That's it! Your ERP system is ready for production. For more help, refer to the main [README.md](./README.md).
