#!/bin/bash

# ERP System Deployment Script
# This script handles deployment to production servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME}"
DOCKER_PASSWORD="${DOCKER_PASSWORD}"
SERVER_HOST="${SERVER_HOST}"
SERVER_USER="${SERVER_USER:-ubuntu}"
DEPLOY_PATH="/opt/erp-system"

echo -e "${YELLOW}ERP System Deployment Script${NC}"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Load environment
if [ ! -f .env.production ]; then
    print_error ".env.production file not found"
    exit 1
fi

print_status "Environment file found"

# Build Docker images
print_info "Building Docker images..."

docker-compose -f docker-compose.prod.yml build --no-cache

print_status "Docker images built successfully"

# Login to Docker registry (if credentials provided)
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    print_info "Logging in to Docker registry..."
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    print_status "Docker registry login successful"
fi

# Tag and push images (if registry provided)
if [ -n "$DOCKER_REGISTRY" ] && [ "$DOCKER_REGISTRY" != "docker.io" ]; then
    print_info "Tagging and pushing images to registry..."
    
    docker tag erp-frontend:latest "$DOCKER_REGISTRY/erp-frontend:latest"
    docker tag erp-backend:latest "$DOCKER_REGISTRY/erp-backend:latest"
    
    docker push "$DOCKER_REGISTRY/erp-frontend:latest"
    docker push "$DOCKER_REGISTRY/erp-backend:latest"
    
    print_status "Images pushed to registry"
fi

# Deploy to remote server
if [ -n "$SERVER_HOST" ]; then
    print_info "Deploying to remote server: $SERVER_HOST..."
    
    # Copy files to server
    scp -r .github "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/.github"
    scp docker-compose.prod.yml "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"
    scp .env.production "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/.env"
    scp nginx.conf "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"
    
    print_status "Files copied to server"
    
    # Execute deployment on remote server
    ssh "$SERVER_USER@$SERVER_HOST" << 'DEPLOY_COMMANDS'
        cd /opt/erp-system
        
        # Stop old containers
        docker-compose -f docker-compose.prod.yml down
        
        # Pull latest images
        docker-compose -f docker-compose.prod.yml pull
        
        # Start new containers
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to be healthy
        sleep 30
        
        # Run migrations
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run
        
        # Check status
        docker-compose -f docker-compose.prod.yml ps
DEPLOY_COMMANDS
    
    print_status "Remote deployment completed"
else
    print_info "No remote server configured, deploying locally..."
    
    # Stop old containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    print_status "Local deployment started"
    
    # Wait for services
    sleep 30
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run || true
    
    # Show status
    docker-compose -f docker-compose.prod.yml ps
fi

# Verify deployment
print_info "Verifying deployment..."

if curl -f http://localhost/health &> /dev/null; then
    print_status "Application is healthy"
else
    print_error "Application health check failed"
    exit 1
fi

print_status "Deployment completed successfully!"
echo ""
echo -e "${GREEN}=================================="
echo "ERP System is now running!"
echo "=================================${NC}"
echo ""
echo "Access the application:"
echo "  Frontend: https://yourdomain.com"
echo "  Backend API: https://yourdomain.com/api"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
