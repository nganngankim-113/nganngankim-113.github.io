#!/bin/bash
echo "============================================"
echo "  Nguyen Kim Ngan — Portfolio Website"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    echo "Then run this script again."
    exit 1
fi

echo "Starting server..."
echo ""
echo "Website will open at: http://localhost:3000"
echo "To stop: press Ctrl+C"
echo ""

# Open browser after 2 seconds
(sleep 2 && open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &

# Start server
node server.js
