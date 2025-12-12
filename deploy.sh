#!/bin/bash

# RTG Smart Report - Quick Deploy Script
# This script builds and deploys the app to Firebase

echo "🚀 Starting deployment process..."
echo ""

# Navigate to project directory
cd "/Users/adiltawzer/Documents/Tawzer AppLabs 2025/Webapp2025/RTG Smart Report"

# Build the application
echo "📦 Building application..."
# Explicitly load env vars (ignoring comments)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    
    # Deploy to Firebase
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo "🌐 Your app is live at: https://yooryka.web.app"
        echo ""
        echo "📝 Next steps:"
        echo "1. Open https://yooryka.web.app in your browser"
        echo "2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)"
        echo "3. Navigate to an RTG and click 'Contrôle Revêtement'"
        echo "4. Check the browser console (F12) for any debug messages"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
