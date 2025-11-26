# Juggernaut IDV Demo - Deployment Guide

## Quick Start

### Windows Users
```cmd
start.bat
```

### Mac/Linux Users
```bash
chmod +x start.sh
./start.sh
```

## Manual Deployment Steps

### 1. Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories:

```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the files with your configuration
# IMPORTANT: Change all default secrets in production!
```

### 2. Docker Deployment (Recommended)

#### Build and Start All Services
```bash
# Build images and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Service Management
```bash
# Start specific service
docker-compose up -d backend

# Restart service
docker-compose restart backend

# View service logs
docker-compose logs -f backend
```

### 3. Local Development Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

#### Backend
```bash
cd backend
npm install
npm run dev  # Development mode
npm run build && npm start  # Production mode
```

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Development mode
npm run build && npm run preview  # Production mode
```

## Production Deployment

### 1. Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Use environment-specific configs

### 2. Cloud Deployment

#### AWS Deployment
```bash
# Using ECS
ecs-cli compose up

# Using Elastic Beanstalk
eb init
eb deploy
```

#### Azure Deployment
```bash
# Using Container Instances
az container create --resource-group myResourceGroup --file docker-compose.yml

# Using App Service
az webapp up --name juggernaut-idv --runtime "NODE:18-lts"
```

#### Google Cloud Deployment
```bash
# Using Cloud Run
gcloud run deploy --source .

# Using App Engine
gcloud app deploy
```

### 3. Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get all -n juggernaut

# Scale deployment
kubectl scale deployment backend --replicas=3 -n juggernaut
```

### 4. Database Setup

#### PostgreSQL Initialization
```sql
-- Create database
CREATE DATABASE juggernaut_idv;

-- Create user
CREATE USER juggernaut_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE juggernaut_idv TO juggernaut_user;

-- Create tables (run migrations)
npm run migrate
```

#### Redis Configuration
```bash
# Set password
redis-cli CONFIG SET requirepass "your_redis_password"

# Enable persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"
redis-cli CONFIG SET appendonly yes
```

## Monitoring & Maintenance

### Health Checks
- Basic: `http://your-domain/api/health/check`
- Detailed: `http://your-domain/api/health/detailed`
- Readiness: `http://your-domain/api/health/ready`
- Liveness: `http://your-domain/api/health/live`

### Logs
```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f backend

# Export logs
docker-compose logs > logs.txt
```

### Backup
```bash
# Database backup
pg_dump -h localhost -U postgres juggernaut_idv > backup.sql

# Redis backup
redis-cli --rdb /backup/dump.rdb

# Full backup
tar -czf juggernaut-backup-$(date +%Y%m%d).tar.gz ./data ./logs
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
docker-compose down
docker-compose up -d --build

# Run migrations
npm run migrate
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Reset Docker
docker-compose down -v
docker-compose up -d --build
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Check Redis status
redis-cli ping
```

#### Permission Issues
```bash
# Fix file permissions
chmod -R 755 ./
chown -R $(whoami) ./
```

## Performance Tuning

### Backend Optimization
```javascript
// PM2 configuration (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'juggernaut-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);

-- Analyze tables
ANALYZE receipts;
ANALYZE transactions;
```

### Redis Optimization
```bash
# Set max memory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review documentation: `README.md`
- Contact support: support@juggernaut.ai

## Version Information
- Application Version: 1.0.0
- Node.js: 18+
- PostgreSQL: 15+
- Redis: 7+
- Docker: 20.10+
- Docker Compose: 2.0+