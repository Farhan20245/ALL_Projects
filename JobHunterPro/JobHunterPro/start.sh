#!/bin/bash
echo "Starting Job Portal Application..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi
echo "Starting development server..."
npm run dev