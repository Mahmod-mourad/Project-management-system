# ERP System - Project Structure

## Overview
Professional-grade ERP (Enterprise Resource Planning) system built with Next.js, NestJS, and Supabase. Multi-tenant architecture supporting 1M+ companies.

## Directory Structure

```
erp-system/
├── # Frontend (Next.js 16)
├── app/                          # Next.js app router
│   ├── page.tsx                 # Home/Dashboard
│   ├── layout.tsx               # Root layout
│   ├── login/                   # Login pages
│   ├── profile/                 # User profile
│   ├── companies/               # Company management
│   ├── invoices/                # Invoicing system
│   ├── inventory/               # Stock management
│   ├── sales/                   # Sales module
│   ├── users/                   # User management
│   ├── hr/                      # HR management
│   ├── reports/                 # Analytics & reports
│   ├── settings/                # System settings
│   ├── subscription/            # Subscription management
│   ├── admin/tenants/           # Admin tenant management
│   └── api/                     # API routes
│
├── components/                   # Reusable React components
│   ├── auth/                    # Authentication components
│   │   ├── auth-provider.tsx
│   │   ├── login-form.tsx
│   │   ├── protected-route.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── dashboard-layout.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── ...
│   ├── dashboard/               # Dashboard components
│   ├── companies/               # Company management UI
│   ├── invoices/                # Invoice UI
│   ├── inventory/               # Inventory UI
│   ├── sales/                   # Sales UI
│   ├── users/                   # User management UI
│   ├── hr/                      # HR UI
│   ├── reports/                 # Reporting UI
│   ├── subscription/            # Subscription UI
│   ├── tenant/                  # Tenant switching
│   ├── ui/                      # shadcn/ui components
│   └── profile/                 # Profile components
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-projects.ts         # Projects hook
│   ├── use-tasks.ts            # Tasks hook
│   ├── use-notifications.ts    # Notifications hook
│   ├── use-socket.ts           # WebSocket hook
│   ├── use-realtime-data.ts    # Real-time data hook
│   ├── use-supabase.ts         # Supabase hook
│   └── use-mobile.ts           # Mobile detection
│
├── lib/                          # Utility functions
│   ├── api-client.ts           # API client
│   ├── data-integration.ts     # Data integration
│   ├── tenant-context.tsx      # Tenant context
│   ├── utils.ts                # Utility functions
│   └── supabase/               # Supabase utilities
│
├── public/                       # Static assets
│   └── professional-avatar.png
│
├── styles/                       # Global styles
│   └── globals.css
│
├── scripts/                      # Database & setup scripts
│   ├── 01-create-multi-tenant-schema.sql
│   ├── 02-add-tenant-id-to-existing-tables.sql
│   ├── 03-seed-demo-tenants.sql
│   ├── 04-create-backend-tables.sql
│   ├── 05-create-notifications-table.sql
│   └── 06-initialize-production-database.sql
│
├── # Backend (NestJS)
├── backend/
│   ├── src/
│   │   ├── main.ts             # Entry point
│   │   ├── app.module.ts       # Root module
│   │   │
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── supabase.strategy.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   │
│   │   ├── user/                # User module
│   │   │   ├── user.module.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── tenant/              # Multi-tenancy
│   │   │   ├── tenant.module.ts
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── project/             # Project management
│   │   │   ├── project.module.ts
│   │   │   ├── project.service.ts
│   │   │   ├── project.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── task/                # Task management
│   │   │   ├── task.module.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── notification/        # Real-time notifications
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.gateway.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── supabase/            # Supabase integration
│   │   │   ├── supabase.module.ts
│   │   │   └── supabase.service.ts
│   │   │
│   │   ├── common/              # Common utilities
│   │   │   ├── decorators/
│   │   │   │   └── tenant.decorator.ts
│   │   │   ├── guards/
│   │   │   │   └── tenant.guard.ts
│   │   │   ├── interceptors/
│   │   │   ├── filters/
│   │   │   ├── pipes/
│   │   │   └── services/
│   │   │
│   │   └── config/              # Configuration
│   │       ├── database.config.ts
│   │       └── jwt.config.ts
│   │
│   ├── dist/                    # Built output
│   ├── test/                    # Tests
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── README.md
│
├── # Configuration Files
├── .env.example                  # Example environment variables
├── .env.production              # Production environment
├── .dockerignore
├── Dockerfile                    # Frontend Docker
├── docker-compose.yml           # Docker Compose configuration
├── next.config.mjs              # Next.js config
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json
├── pnpm-lock.yaml
│
├── # Documentation & CI/CD
├── README.md                     # Project documentation
├── SETUP.md                     # Setup guide
├── .github/
│   └── workflows/
│       ├── build.yml            # Build pipeline
│       ├── test.yml             # Test pipeline
│       └── deploy.yml           # Deployment pipeline
│
└── nginx.conf                    # Nginx reverse proxy config

```

## Key Features

### 1. Multi-Tenant Architecture
- Complete data isolation per tenant
- Row-Level Security (RLS) on all tables
- Tenant context management

### 2. Modules
- **Companies**: Full company management
- **Invoices**: Complete invoicing system
- **Inventory**: Stock tracking and management
- **Sales**: Sales transactions
- **Users**: User management
- **HR**: Employee management & attendance
- **Reports**: Analytics & reports
- **Subscriptions**: SaaS subscription management

### 3. Technology Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Real-time**: WebSockets (Socket.IO)
- **Containerization**: Docker & Docker Compose

### 4. Security
- JWT Authentication
- Row-Level Security (RLS)
- CORS Protection
- Rate Limiting
- Input Validation

### 5. Scalability
- Microservices-ready architecture
- Redis caching
- Database connection pooling
- Horizontal scaling with Docker Swarm/Kubernetes

## Environment Variables

See `.env.example` for frontend and `backend/.env.example` for backend.

## Getting Started

1. **Development**:
   ```bash
   npm install
   npm run dev
   ```

2. **Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Database Setup**:
   ```bash
   # Run migration scripts
   psql -U postgres -d erp_db -f scripts/06-initialize-production-database.sql
   ```

## Deployment

See `SETUP.md` for detailed deployment instructions including:
- Docker deployment
- Kubernetes setup
- CI/CD pipeline
- SSL/TLS configuration
- Database backup strategy

## Database Schema

All database schemas are defined in the `scripts/` directory and are automatically applied on startup.

## API Documentation

Backend API documentation available at `http://localhost:3001/docs` (when running with Swagger).

## Contributing

See `CONTRIBUTING.md` for guidelines.

## License

Proprietary - All rights reserved
