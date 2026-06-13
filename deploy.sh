#!/bin/bash

set -e

# Deployment script for Aegyo Arena

# Check for required tools
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but not installed.  Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed.  Aborting."; exit 1; }

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[DEPLOY] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Validate environment
validate_env() {
    log "Validating environment..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    REQUIRED_NODE_VERSION="v22"
    
    if [[ "$NODE_VERSION" < "$REQUIRED_NODE_VERSION" ]]; then
        error "Node.js version must be $REQUIRED_NODE_VERSION or higher. Current: $NODE_VERSION"
        exit 1
    fi
    
    # Check for .env file
    if [ ! -f .env ]; then
        error "No .env file found. Please copy .env.example to .env and configure."
        exit 1
    fi
}

# Install dependencies
install_deps() {
    log "Installing dependencies..."
    npm ci
}

# Database setup
setup_database() {
    log "Setting up database..."
    npx prisma generate
    npx prisma migrate deploy
    npx prisma db seed
}

# Build application
build_app() {
    log "Building application..."
    npm run build
}

# Main deployment function
main() {
    validate_env
    install_deps
    setup_database
    build_app
    
    log "Deployment completed successfully! 🎉"
    log "Start the application with: npm run start"
}

# Run main deployment function
main