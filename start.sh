#!/bin/bash

# AI Social Media Manager - Start Script
# This script starts the full application with hot reload

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════╗"
echo "║     AI Social Media Manager v1.0         ║"
echo "║     Starting Application...               ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

# Function to kill processes on ports
cleanup_ports() {
  echo -e "${YELLOW}→ Cleaning up ports...${NC}"
  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo -e "${YELLOW}  Killing process on port $PORT (PID: $PID)${NC}"
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done
  echo -e "${GREEN}✓ Ports cleaned${NC}"
}

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}→ Shutting down...${NC}"
  cleanup_ports
  # Kill background processes
  jobs -p | xargs -r kill 2>/dev/null || true
  echo -e "${GREEN}✓ Application stopped${NC}"
  exit 0
}
trap cleanup EXIT INT TERM

# Clean up ports first
cleanup_ports

# Check PostgreSQL
echo -e "${YELLOW}→ Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}→ Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
  fi
fi

# Create database if not exists
echo -e "${YELLOW}→ Creating database...${NC}"
createdb ${DB_NAME:-ai_social_media_manager} 2>/dev/null || echo -e "${CYAN}  Database already exists${NC}"
echo -e "${GREEN}✓ Database ready${NC}"

# Install backend dependencies
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Run seed
echo -e "${YELLOW}→ Seeding database...${NC}"
npm run seed 2>&1 | tail -3
echo -e "${GREEN}✓ Database seeded${NC}"

# Start backend with hot reload (nodemon)
echo -e "${YELLOW}→ Starting backend on port ${BACKEND_PORT}...${NC}"
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 3
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Install frontend dependencies
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
cd frontend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Start frontend with hot reload (Vite)
echo -e "${YELLOW}→ Starting frontend on port ${FRONTEND_PORT}...${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${GREEN}  Application is running!                  ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${CYAN}  Frontend:  http://localhost:${FRONTEND_PORT}          ${PURPLE}║${NC}"
echo -e "${PURPLE}║${CYAN}  Backend:   http://localhost:${BACKEND_PORT}           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${YELLOW}  Login:     admin@socialmgr.com           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${YELLOW}  Password:  password123                   ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}  Hot reload enabled for both servers      ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}  Press Ctrl+C to stop                     ${PURPLE}║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Wait for both processes
wait
