# EPRA Learning Platform - Deployment Guide

## Overview

This guide covers deploying the secure EPRA Learning Platform with backend API, database persistence, and frontend integration.

## Architecture Summary

### Security Improvements ✅
- **API Keys**: Moved from localStorage to secure server-side environment variables
- **Authentication**: JWT-based with refresh tokens and automatic rotation
- **Input Validation**: Server-side sanitization and validation for all endpoints
- **Rate Limiting**: Per-user and per-endpoint limits with usage tracking
- **Database**: PostgreSQL with proper schema and indexing
- **CORS**: Configured for production domains only

### Components
- **Frontend**: Updated HTML/JS with secure API client
- **Backend**: Node.js/Express API with security middleware
- **Database**: PostgreSQL with user management and progress tracking
- **AI Services**: Secure proxy for Claude and Perplexity APIs

## Deployment Steps

### 1. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# Create production database
createdb epra_production

# Run schema
psql -d epra_production -f backend/database/schema.sql

# Verify tables created
psql -d epra_production -c "\dt"
```

### 2. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env
```

**Configure `.env` for production:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/epra_production

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-64-chars-minimum
REFRESH_TOKEN_SECRET=your-super-secure-refresh-secret-64-chars-minimum
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# API Keys (server-side only - never expose to frontend)
CLAUDE_API_KEY=sk-ant-api03-your-claude-key
CLAUDE_PROJECT_ID=your-claude-project-id
PERPLEXITY_API_KEY=pplx-your-perplexity-key

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
GLOBAL_RATE_LIMIT=1000
AUTH_RATE_LIMIT=5
AI_RATE_LIMIT=20

# Logging
LOG_LEVEL=info
```

### 3. Frontend Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:3001/api`
- **Production**: Uses `/api` (same origin)

No additional frontend configuration needed.

### 4. Start Services

```bash
# Start backend server
cd backend
npm start

# Serve frontend (choose one method below)
```

### 5. Frontend Serving Options

#### Option A: Static File Server (Recommended)
```bash
# Using Node.js serve
npx serve . -p 3000

# Using Python
python -m http.server 3000

# Using nginx (see nginx config below)
```

#### Option B: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend static files
    location / {
        root /path/to/epra-simplified;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL/HTTPS Configuration

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Production Checklist

### Security ✅
- [ ] API keys configured server-side only
- [ ] JWT secrets are cryptographically secure (64+ chars)
- [ ] Database credentials are secure
- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error messages don't expose sensitive info

### Performance ✅
- [ ] Database connection pooling configured
- [ ] API response compression enabled
- [ ] Static file caching configured
- [ ] Database indexes created
- [ ] Logging configured for production

### Monitoring ✅
- [ ] Health check endpoint (`/health`) responding
- [ ] Error logging configured
- [ ] API usage tracking active
- [ ] Database monitoring setup
- [ ] Backup strategy implemented

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### Log Monitoring
```bash
# View backend logs
tail -f backend/logs/combined.log

# Error logs
tail -f backend/logs/error.log
```

### Database Maintenance
```sql
-- Check database health
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables 
WHERE schemaname = 'public';

-- User statistics
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN is_active THEN 1 END) as active_users
FROM users;

-- API usage summary
SELECT provider, COUNT(*) as requests, SUM(tokens_used) as total_tokens
FROM api_usage 
WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY provider;
```

## User Migration

### From Legacy Version

Users with existing localStorage data will need to:
1. Register for a new account
2. Previous chat history stored in localStorage will remain available until they clear browser data
3. Learning progress can be manually recreated through the new system

### Data Export (if needed)
```javascript
// Run in browser console to export localStorage data
const data = {
  chatHistory: localStorage.getItem('epra_chat_history'),
  progress: localStorage.getItem('epra_progress'),
  settings: localStorage.getItem('epra_settings')
};
console.log(JSON.stringify(data, null, 2));
```

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump epra_production > backups/epra_backup_$DATE.sql
find backups/ -name "*.sql" -mtime +7 -delete
```

### Application Backups
```bash
# Backup configuration and logs
tar -czf backups/app_backup_$(date +%Y%m%d).tar.gz \
  backend/.env \
  backend/logs/ \
  frontend/
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check browser console for specific error
   - Ensure frontend and backend are on expected domains

2. **Authentication Fails**
   - Check JWT secrets are consistent
   - Verify token expiration settings
   - Clear browser localStorage if upgrading from legacy version

3. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists and schema is loaded

4. **API Rate Limiting**
   - Check user usage in database
   - Adjust rate limits in `.env` if needed
   - Monitor API usage patterns

### Debug Mode

Enable debug logging:
```bash
# In backend/.env
LOG_LEVEL=debug
NODE_ENV=development

# Restart backend
npm run dev
```

## Success Verification

After deployment, verify:

1. **Frontend loads** at your domain
2. **User registration** works
3. **Authentication** persists across page reloads
4. **Chat functionality** works with AI responses
5. **Learning progress** saves and loads
6. **API usage tracking** is recording data
7. **Rate limiting** is protecting endpoints

The platform should now be running securely with all critical security issues addressed! 🎉