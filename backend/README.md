# EPRA Backend API

Secure backend API for the EPRA Learning Platform with JWT authentication, database persistence, and AI proxy services.

## Architecture

### Security Features ✅
- JWT-based authentication with refresh tokens
- API key management server-side only
- Input validation and sanitization
- Rate limiting per user and endpoint
- CORS protection
- Helmet security headers
- SQL injection protection

### Database Schema
- PostgreSQL with proper indexing
- User management with roles
- Learning progress tracking
- Chat session persistence
- API usage monitoring
- User settings storage

### API Services
- Claude AI proxy with usage tracking
- Perplexity search integration
- Secure credential management
- Error handling and logging

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Claude API key
- Perplexity API key (optional)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup:**
```bash
# Create database
createdb epra_db

# Run migrations
psql -d epra_db -f database/schema.sql
```

4. **Start development server:**
```bash
npm run dev
```

### Environment Variables

Required variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/epra_db

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret
REFRESH_TOKEN_SECRET=your-super-secure-refresh-secret

# API Keys (server-side only)
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_PROJECT_ID=your-claude-project-id
PERPLEXITY_API_KEY=your-perplexity-api-key

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke tokens)
- `GET /api/auth/verify` - Verify token

### AI Services
- `POST /api/ai/chat` - Claude AI chat (secured)
- `POST /api/ai/search` - Perplexity search (secured)
- `GET /api/ai/health` - Service status

### Chat Management
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions` - Get user sessions
- `GET /api/chat/sessions/:id/messages` - Get messages
- `POST /api/chat/sessions/:id/messages` - Add message
- `DELETE /api/chat/sessions/:id` - Delete session

### Learning Progress
- `GET /api/learning/progress` - Get user progress
- `POST /api/learning/progress` - Update progress
- `GET /api/learning/stats` - Get user statistics
- `GET /api/learning/leaderboard` - Get leaderboard

### User Management
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/settings` - Get user settings
- `PATCH /api/users/settings` - Update settings
- `POST /api/users/change-password` - Change password
- `GET /api/users/usage` - Get API usage stats

## Security Considerations

### API Key Protection
- API keys stored server-side only
- Never exposed to frontend
- Environment variable configuration
- Secure proxy pattern

### Authentication
- JWT with short expiration (24h)
- Refresh tokens with longer expiration (7d)
- Automatic token rotation
- Secure logout with token revocation

### Input Validation
- Request sanitization
- SQL injection prevention
- XSS protection
- File upload validation

### Rate Limiting
- Global rate limits
- Per-user usage tracking
- API-specific limits
- Cost monitoring

## Deployment

### Production Environment

1. **Database:**
```bash
# Set up production PostgreSQL
# Run schema.sql
# Configure connection pooling
```

2. **Environment:**
```bash
NODE_ENV=production
DATABASE_URL=your-production-db-url
FRONTEND_URL=https://your-domain.com
```

3. **Security:**
```bash
# Generate secure JWT secrets
# Configure HTTPS
# Set up proper CORS origins
# Enable production logging
```

4. **Monitoring:**
```bash
# Set up health checks
# Configure error tracking
# Monitor API usage
# Database performance monitoring
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Monitoring & Logging

### Health Checks
- `/health` endpoint for service monitoring
- Database connection status
- API service availability

### Logging
- Winston logger with rotation
- Error tracking and alerting
- API usage monitoring
- Performance metrics

### Usage Tracking
- Per-user API consumption
- Cost tracking per provider
- Rate limit monitoring
- Performance analytics

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Database Migrations
```bash
node src/database/migrate.js
```

### Code Quality
```bash
npm run lint
npm run format
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection string
   - Check database exists

2. **JWT Token Errors**
   - Verify JWT secrets are set
   - Check token expiration
   - Ensure consistent secret across restarts

3. **API Key Issues**
   - Verify Claude/Perplexity keys
   - Check API quota limits
   - Monitor usage tracking

4. **Rate Limiting**
   - Check user usage limits
   - Verify rate limit configuration
   - Monitor API request patterns

### Support
For issues or questions, check the application logs and refer to the error messages for specific guidance.