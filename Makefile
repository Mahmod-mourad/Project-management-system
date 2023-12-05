.PHONY: help install dev build test lint docker-build docker-up docker-down docker-logs clean deploy

# Variables
PROJECT_NAME=erp-system
DOCKER_COMPOSE=docker-compose
DOCKER_COMPOSE_PROD=docker-compose -f docker-compose.prod.yml

# Colors
YELLOW=\033[0;33m
GREEN=\033[0;32m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(YELLOW)$(PROJECT_NAME) - Available Commands$(NC)"
	@echo "==================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Development Commands
install: ## Install dependencies
	npm install
	cd backend && npm install && cd ..
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start development servers
	@echo "$(YELLOW)Starting development environment...$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	npm run dev

dev-backend: ## Start backend development server
	cd backend && npm run start:dev

dev-frontend: ## Start frontend development server
	npm run dev

# Build Commands
build: ## Build production images
	npm run build
	cd backend && npm run build && cd ..
	@echo "$(GREEN)✓ Build completed$(NC)"

build-frontend: ## Build frontend only
	npm run build

build-backend: ## Build backend only
	cd backend && npm run build

# Linting & Testing
lint: ## Run linter
	npm run lint
	cd backend && npm run lint && cd ..

test: ## Run tests
	npm test
	cd backend && npm test && cd ..

test-watch: ## Run tests in watch mode
	npm test -- --watch

# Docker Commands
docker-build: ## Build Docker images
	docker-compose build

docker-build-prod: ## Build production Docker images
	$(DOCKER_COMPOSE_PROD) build

docker-up: ## Start Docker containers
	docker-compose up -d
	@echo "$(GREEN)✓ Docker containers started$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

docker-up-prod: ## Start production Docker containers
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "$(GREEN)✓ Production containers started$(NC)"

docker-down: ## Stop Docker containers
	docker-compose down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

docker-down-prod: ## Stop production Docker containers
	$(DOCKER_COMPOSE_PROD) down

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-logs-prod: ## Show production Docker logs
	$(DOCKER_COMPOSE_PROD) logs -f

docker-logs-backend: ## Show backend logs
	docker-compose logs -f backend

docker-logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

docker-logs-postgres: ## Show PostgreSQL logs
	docker-compose logs -f postgres

docker-shell-backend: ## Open backend container shell
	docker-compose exec backend sh

docker-shell-postgres: ## Open PostgreSQL container shell
	docker-compose exec postgres psql -U postgres erp_db

docker-shell-redis: ## Open Redis container shell
	docker-compose exec redis redis-cli

# Database Commands
db-migrate: ## Run database migrations
	docker-compose exec backend npm run migration:run

db-seed: ## Seed database with demo data
	docker-compose exec postgres psql -U postgres erp_db -f /docker-entrypoint-initdb.d/03-seed-demo-tenants.sql

db-reset: ## Reset database (WARNING: deletes all data)
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	docker-compose exec postgres psql -U postgres -d erp_db -f /docker-entrypoint-initdb.d/06-initialize-production-database.sql

db-backup: ## Backup database
	@mkdir -p ./backups
	docker-compose exec -T postgres pg_dump -U postgres erp_db | gzip > ./backups/erp_db_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "$(GREEN)✓ Database backed up$(NC)"

# Deployment Commands
deploy: ## Deploy to production
	@chmod +x ./deploy.sh
	./deploy.sh

deploy-dev: ## Deploy to development environment
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	sleep 30
	docker-compose exec -T backend npm run migration:run
	@echo "$(GREEN)✓ Development deployment completed$(NC)"

# Cleanup Commands
clean: ## Clean up build artifacts
	rm -rf node_modules .next dist coverage
	cd backend && rm -rf node_modules dist coverage && cd ..
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

clean-docker: ## Clean up Docker resources
	docker-compose down -v
	docker system prune -a --volumes -f
	@echo "$(GREEN)✓ Docker cleanup completed$(NC)"

# Utility Commands
status: ## Show service status
	docker-compose ps

health: ## Check service health
	@echo "Checking services health..."
	@curl -f http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Frontend is healthy$(NC)" || echo "✗ Frontend is down"
	@curl -f http://localhost:3001/health > /dev/null && echo "$(GREEN)✓ Backend is healthy$(NC)" || echo "✗ Backend is down"
	@docker-compose exec -T postgres pg_isready -U postgres > /dev/null && echo "$(GREEN)✓ PostgreSQL is healthy$(NC)" || echo "✗ PostgreSQL is down"
	@docker-compose exec -T redis redis-cli ping > /dev/null && echo "$(GREEN)✓ Redis is healthy$(NC)" || echo "✗ Redis is down"

format: ## Format code
	npx prettier --write .
	cd backend && npx prettier --write src && cd ..

# Development utilities
shell: ## Open project shell
	bash

version: ## Show version information
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
