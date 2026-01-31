#!/bin/bash

# Hookshot Build Script
# Creates a single binary with embedded frontend

set -e  # Exit on error

echo "🚀 Building Hookshot..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build frontend
echo "📦 Step 1/3: Building frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Build frontend
echo "Building React app..."
npm run build

# Verify build output
if [ ! -f "dist/index.html" ]; then
    echo "❌ Frontend build failed: dist/index.html not found"
    exit 1
fi

echo "${GREEN}✅ Frontend built successfully${NC}"
cd ..
echo ""

# Step 2: Build Rust backend (with embedded frontend)
echo "🦀 Step 2/3: Building Rust backend..."
cargo build --release

echo "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Step 3: Verify and report
echo "📋 Step 3/3: Verifying build..."

BINARY_PATH="target/release/hookshot"
if [ ! -f "$BINARY_PATH" ]; then
    echo "❌ Binary not found at $BINARY_PATH"
    exit 1
fi

# Get binary size
BINARY_SIZE=$(ls -lh "$BINARY_PATH" | awk '{print $5}')

echo "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Binary location: $BINARY_PATH"
echo "📏 Binary size: $BINARY_SIZE"
echo ""
echo "To run:"
echo "  ./target/release/hookshot"
echo ""
echo "To deploy:"
echo "  cp target/release/hookshot /usr/local/bin/"
echo "  # or"
echo "  docker build -t hookshot ."
