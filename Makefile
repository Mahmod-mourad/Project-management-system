.PHONY: help install dev dev-backend dev-frontend build test lint typecheck db-apply docker-build docker-up docker-down docker-logs clean

# Everything here runs a command that exists.
#
# The previous version drove the whole project with npm in a pnpm workspace,
# opened shells into a PostgreSQL and a Redis container that nothing connected
# to, seeded from SQL files that could not run, called a migration:run script
# that is not in either package.json, and health-checked a /health endpoint the
# API does not serve.

PNPM=pnpm

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-16s %s\n", $$1, $$2}'

install: ## Install every workspace dependency
	$(PNPM) install

dev: ## Start the frontend (http://localhost:3000)
	$(PNPM) dev

dev-backend: ## Start the API in watch mode (http://localhost:3001)
	$(PNPM) --filter erp-backend start:dev

dev-frontend: ## Same as dev
	$(PNPM) dev

build: ## Build both applications
	$(PNPM) build
	$(PNPM) --filter erp-backend build

test: ## Run both test suites
	$(PNPM) test:ci
	$(PNPM) --filter erp-backend test

lint: ## Lint both packages
	$(PNPM) lint
	$(PNPM) --filter erp-backend lint

typecheck: ## Type-check the frontend
	$(PNPM) exec tsc --noEmit

db-apply: ## Apply scripts/ in order to $(DATABASE_URL)
	@test -n "$(DATABASE_URL)" || (echo "Set DATABASE_URL first, e.g. postgresql://postgres:postgres@127.0.0.1:54322/postgres"; exit 1)
	@for f in scripts/*.sql; do echo "  $$f"; psql "$(DATABASE_URL)" -v ON_ERROR_STOP=1 -q -f "$$f" || exit 1; done
	@echo "Schema applied."

docker-build: ## Build both images
	docker compose build

docker-up: ## Start both applications
	docker compose up -d
	@echo "Frontend: http://localhost:3000"
	@echo "API:      http://localhost:3001/api/v1"
	@echo "API docs: http://localhost:3001/api/docs"

docker-down: ## Stop them
	docker compose down

docker-logs: ## Follow the logs
	docker compose logs -f

clean: ## Remove build output and installed packages
	rm -rf node_modules .next coverage backend/node_modules backend/dist backend/coverage
