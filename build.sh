#!/bin/bash
echo "============================================"
echo "  Build Portfolio Data"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install from: https://nodejs.org"
    exit 1
fi

echo "Scanning portfolio folders..."
echo ""
node build-portfolio.js
echo ""
echo "============================================"
echo "  Done! You can now open index.html directly"
echo "  or deploy to GitHub Pages / Netlify."
echo "============================================"
read -p "Press Enter to close..."
