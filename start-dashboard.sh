#!/bin/bash

echo "Starting System Control Dashboard..."
echo "=================================="

# Get host IP address
HOST_IP=$(hostname -I | awk '{print $1}')
PORT=${PORT:-3000}

echo "Host IP Address: $HOST_IP"
echo "Port: $PORT"
echo ""
echo "Dashboard will be available at:"
echo "  - Local: http://localhost:$PORT"
echo "  - Network: http://$HOST_IP:$PORT"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed!"
    echo "Please install Node.js 14+ and try again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the dashboard server
echo "Starting server..."
PORT=$PORT node server.js