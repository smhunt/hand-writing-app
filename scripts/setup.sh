#!/bin/bash

# Setup script for Handwritten Note Web App
# This script helps set up the development environment

set -e

echo "🚀 Setting up Handwritten Note Web App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/data/uploads/tmp
mkdir -p backend/data/samples
mkdir -p backend/public

# Initialize database if it doesn't exist
if [ ! -f backend/data/db.json ]; then
    echo "🗄️  Creating initial database..."
    echo '{"users":[]}' > backend/data/db.json
fi

# Copy environment variables if they don't exist
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "SESSION_SECRET=dev-secret-change-me" > backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "⚙️  Creating frontend .env file..."
    cp frontend/.env.example frontend/.env 2>/dev/null || touch frontend/.env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application with Docker:"
echo "  docker-compose up --build"
echo ""
echo "Or to run locally:"
echo "  1. cd backend && npm install && npm start"
echo "  2. cd frontend && npm install && npm start"
echo ""
echo "The app will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
