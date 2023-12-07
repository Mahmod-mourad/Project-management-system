# ERP System - Enterprise Resource Planning Platform

A production-ready, enterprise-grade ERP system designed to manage resources for companies of all sizes. Built with modern technologies and following best practices for scalability, security, and maintainability.

## Features

- **Multi-Tenant Architecture**: Complete data isolation and customization per customer
- **Companies Management**: Organize and manage multiple company profiles
- **Invoicing System**: Complete invoice generation, tracking, and payment management
- **Inventory Management**: Real-time stock tracking, alerts, and supplier management
- **Sales Module**: Transaction management with multiple payment methods
- **User Management**: Role-based access control (RBAC)
- **HR Management**: Employee tracking, attendance, and payroll management
- **Reports & Analytics**: Comprehensive dashboards and customizable reports
- **Real-Time Notifications**: WebSocket-based instant updates
- **SaaS Subscriptions**: Flexible subscription plans and usage tracking

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with automatic batching
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - High-quality React components
- **Socket.IO** - Real-time communication

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe backend
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage
- **Supabase** - Backend-as-a-Service with RLS

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Reverse proxy

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or Docker)
- Redis 7+ (or Docker)
- Supabase account

### Development

```bash
# Clone repository
git clone <repo-url>
cd erp-system

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment variables
cp .env.example .env.local
cp backend/.env.example backend/.env

# Run development servers
npm run dev              # Frontend on localhost:3000
# In another terminal
cd backend && npm run start:dev  # Backend on localhost:3001
```

### Docker Deployment

```bash
# Configure environment
cp .env.production .env

# Build and run
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migration:run

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

## Project Structure

```
erp-system/
├── app/                 # Next.js pages and layouts
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── scripts/            # Database and setup scripts
├── backend/            # NestJS backend application
├── .github/workflows/  # CI/CD pipelines
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Frontend Docker image
└── README.md          # This file
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure documentation.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (backend/.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=erp_db
REDIS_HOST=localhost
REDIS_PORT=6379
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
JWT_SECRET=your_secret_key
```

See `.env.example` and `backend/.env.example` for complete configurations.

## Database

### Initialize Database

```bash
# Run SQL scripts in order
psql -U postgres -d erp_db -f scripts/01-create-multi-tenant-schema.sql
psql -U postgres -d erp_db -f scripts/02-add-tenant-id-to-existing-tables.sql
psql -U postgres -d erp_db -f scripts/03-seed-demo-tenants.sql
psql -U postgres -d erp_db -f scripts/04-create-backend-tables.sql
psql -U postgres -d erp_db -f scripts/05-create-notifications-table.sql
psql -U postgres -d erp_db -f scripts/06-initialize-production-database.sql
```

Or use the auto-initialization in Docker Compose.

## API Documentation

Backend API is documented using OpenAPI/Swagger. Access it at:
```
http://localhost:3001/api-docs
```

## Authentication

- **Method**: JWT with Supabase Auth
- **Endpoints**:
  - `POST /api/auth/login` - Login
  - `POST /api/auth/register` - Register
  - `POST /api/auth/logout` - Logout
  - `GET /api/auth/profile` - Get current user

## Modules

### Companies
Manage company information, addresses, and documents.

### Invoices
Create, send, and track invoices with customizable templates.

### Inventory
Track product stock, set reorder points, and manage suppliers.

### Sales
Record sales transactions with multiple payment methods.

### Users
Manage system users with role-based access control.

### HR
Track employees, attendance, and performance metrics.

### Reports
Generate detailed analytics and custom reports.

### Subscriptions
Manage SaaS subscription plans and usage.

## Security

- Row-Level Security (RLS) on database tables
- JWT token-based authentication
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- HTTPS/SSL support

## Performance

- Redis caching layer
- Database query optimization
- Image optimization
- Code splitting
- Lazy loading
- CDN-ready architecture

## Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run e2e
```

## Deployment

### Production Build

```bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```

### Cloud Deployment

Supports deployment to:
- AWS (EC2, ECS, Fargate)
- Google Cloud (Compute Engine, Cloud Run)
- Azure (VMs, Container Instances)
- DigitalOcean
- Vercel (frontend only)
- Railway
- Render

See [SETUP.md](./SETUP.md) for detailed deployment guides.

## Monitoring & Logs

### Docker Logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Application Logs
Logs are written to:
- Frontend: Browser console & application logs
- Backend: `backend/logs/`

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000/3001
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check PostgreSQL connection
psql -U postgres -h localhost -d erp_db -c "SELECT 1"
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@company.com
- Documentation: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) and [SETUP.md](./SETUP.md)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI analytics
- [ ] Blockchain integration for invoices
- [ ] Multi-language support
- [ ] Advanced scheduling system
- [ ] Inventory forecasting
- [ ] Enhanced reporting engine

---

Built with by Professional Development Team
