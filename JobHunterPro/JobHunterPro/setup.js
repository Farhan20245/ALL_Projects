#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Job Portal for local development...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobportal

# Session Configuration  
SESSION_SECRET=your-very-secure-session-secret-key-change-this-in-production

# Environment
NODE_ENV=development

# Database Connection Details
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=jobportal
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
  console.log('⚠️  Please update the database credentials in .env file\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Setup database
console.log('🗄️  Setting up database...');
try {
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('✅ Database schema created\n');
} catch (error) {
  console.log('⚠️  Database setup failed. Make sure PostgreSQL is running and credentials are correct.');
  console.log('   You can run "npx drizzle-kit push" manually after fixing the connection.\n');
}

// Seed database
console.log('🌱 Seeding database with sample data...');
try {
  execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database seeded with sample data\n');
} catch (error) {
  console.log('⚠️  Database seeding failed. You can run "npx tsx scripts/seed.ts" manually.\n');
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('1. Update database credentials in .env file if needed');
console.log('2. Start the development server: npm run dev');
console.log('3. Open http://localhost:5000 in your browser\n');
console.log('VSCode Integration:');
console.log('- Use Ctrl+Shift+P and run "Tasks: Run Task" → "Start Development Server"');
console.log('- Or use F5 to start debugging');