# Development Setup Guide

This guide will help you set up the Zero-Code Builder platform for development and deployment.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional, for deployment)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/youlyank/Devbox.git
cd Devbox
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Configuration
ZAI_API_KEY="your-z-ai-api-key-here"

# Stripe Configuration (for billing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Docker Configuration
DOCKER_HOST="unix:///var/run/docker.sock"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Application Configuration
NODE_ENV="development"
PORT=3000
```

### 4. Database Setup
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
Devbox/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── ai/           # AI-related APIs
│   │   │   ├── billing/      # Stripe billing
│   │   │   ├── projects/     # Project management
│   │   │   ├── users/        # User management
│   │   │   └── ...
│   │   ├── dashboard/         # Hosting dashboard
│   │   └── page.tsx          # Main application
│   ├── components/
│   │   ├── ai/               # AI co-builder
│   │   ├── builder/          # Visual builder
│   │   ├── examples/         # Demo workflows
│   │   ├── simulation/       # Workflow simulator
│   │   └── ui/               # shadcn/ui components
│   ├── types/                 # TypeScript definitions
│   └── lib/                  # Utilities and database
├── prisma/
│   └── schema.prisma         # Database schema
├── docs/                     # Documentation
├── docker-compose.yml        # Docker configuration
├── Dockerfile               # Container build
├── nginx.conf               # Reverse proxy config
└── README.md                # Main documentation
```

## 🔧 Development Features

### AI Co-Builder
- Natural language to visual blocks
- Contextual suggestions
- Real-time block generation

### Workflow Simulator
- Browser-based execution
- Step-by-step logging
- Performance metrics

### Real-time Collaboration
- WebSocket-based synchronization
- Multi-user editing
- Presence indicators

### Version Control
- Auto-save revisions
- Semantic versioning
- Change tracking

### Billing Integration
- Stripe payment processing
- Subscription management
- Usage tracking

## 🧪 Testing

### Run Linter
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Build Test
```bash
npm run build
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build and run all services
docker-compose up -d

# Production with monitoring
docker-compose --profile production up -d

# Example deployed project
docker-compose --profile example up -d
```

### Environment-Specific Configurations

#### Development
- SQLite database
- Local file storage
- Debug logging enabled

#### Production
- PostgreSQL database
- Cloud storage (AWS S3)
- Structured logging
- SSL/TLS enabled

## 📊 Monitoring

### Development Monitoring
- Console logs
- Dev tools integration
- Error tracking

### Production Monitoring
- Prometheus metrics
- Grafana dashboards
- Alert notifications
- Performance monitoring

## 🔐 Security

### Authentication
- NextAuth.js integration
- JWT tokens
- Session management

### API Security
- Rate limiting
- Input validation
- CORS configuration
- HTTPS enforcement

### Data Protection
- Encryption at rest
- Secure headers
- SQL injection prevention
- XSS protection

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request
5. Code review
6. Merge to main

### Code Standards
- TypeScript strict mode
- ESLint compliance
- Prettier formatting
- Conventional commits

### Git Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

#### Port Conflicts
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Docker Issues
```bash
# Clean Docker containers
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

#### AI API Issues
- Check ZAI_API_KEY in .env
- Verify API quota limits
- Check network connectivity

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database queries
DEBUG=prisma:query npm run dev
```

## 📚 API Documentation

### Core Endpoints

#### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

#### AI
- `POST /api/ai/cobuilder` - AI co-builder
- `POST /api/ai/generate` - Generate suggestions
- `POST /api/llm` - Multi-model router

#### Billing
- `POST /api/billing/create-session` - Stripe checkout
- `POST /api/billing/webhook` - Stripe webhooks

#### Deployments
- `POST /api/deployments` - Create deployment
- `GET /api/deployments` - List deployments

### Authentication
All API endpoints require authentication except:
- `POST /api/users` - Create user
- `GET /api/subscriptions` - List tiers

## 🚀 Production Deployment

### Environment Setup
1. Configure production environment variables
2. Set up PostgreSQL database
3. Configure Redis for caching
4. Set up Stripe production keys
5. Configure domain and SSL

### Deployment Steps
1. Build application: `npm run build`
2. Set up Docker containers
3. Configure Nginx reverse proxy
4. Set up monitoring
5. Test all functionality

### Monitoring Setup
1. Configure Prometheus metrics
2. Set up Grafana dashboards
3. Configure alerting rules
4. Set up log aggregation

## 📞 Support

### Documentation
- README.md - Overview and quick start
- API documentation - Endpoint details
- Component docs - UI components

### Community
- GitHub Issues - Bug reports and features
- Discussions - Community support
- Wiki - Additional documentation

### Getting Help
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with details
4. Join community discussions

---

Happy coding! 🚀