#!/bin/bash

# Clean script - removes all generated files and data

echo "🧹 Cleaning up project..."

# Remove node_modules
if [ -d "backend/node_modules" ]; then
    echo "  Removing backend/node_modules..."
    rm -rf backend/node_modules
fi

if [ -d "frontend/node_modules" ]; then
    echo "  Removing frontend/node_modules..."
    rm -rf frontend/node_modules
fi

# Remove database (keeps structure but empties users)
if [ -f "backend/data/db.json" ]; then
    echo "  Resetting database..."
    echo '{"users":[]}' > backend/data/db.json
fi

# Remove uploaded files (but keep directories)
if [ -d "backend/data/uploads" ]; then
    echo "  Removing uploaded files..."
    find backend/data/uploads -type f ! -name '.gitkeep' -delete
fi

# Remove Docker images and containers
read -p "Remove Docker images and containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  Stopping containers..."
    docker-compose down 2>/dev/null || true

    echo "  Removing images..."
    docker rmi handwritten-app-backend:latest 2>/dev/null || true
    docker rmi handwritten-app-frontend:latest 2>/dev/null || true
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
