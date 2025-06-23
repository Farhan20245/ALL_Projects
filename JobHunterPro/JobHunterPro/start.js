#!/usr/bin/env node

/**
 * Standalone starter script for Job Portal
 * This script can run the application without any external dependencies
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Job Portal Application...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('Dependencies not found. Installing...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code === 0) {
      startApplication();
    } else {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startApplication();
}

function startApplication() {
  // Check for .env file
  if (!fs.existsSync('.env')) {
    console.log('Creating default .env file...');
    const envContent = `DATABASE_URL=postgresql://postgres:password@localhost:5432/jobportal
SESSION_SECRET=development-secret-key-change-in-production
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=jobportal
`;
    fs.writeFileSync('.env', envContent);
    console.log('Created .env file with default settings');
    console.log('Update database credentials if needed\n');
  }

  // Start the development server
  console.log('Starting development server...');
  console.log('Server will be available at: http://localhost:5000\n');
  
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}