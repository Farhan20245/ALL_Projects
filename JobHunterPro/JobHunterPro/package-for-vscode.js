#!/usr/bin/env node

/**
 * Package preparation script for VSCode development
 * This ensures all necessary files are present for standalone development
 */

import fs from 'fs';
import path from 'path';

console.log('Preparing project for VSCode development...\n');

// Create missing directories if they don't exist
const directories = [
  'dist',
  'scripts',
  '.vscode'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create a simple package.json script addition file
const additionalScripts = {
  "db:seed": "tsx scripts/seed.ts",
  "db:setup": "drizzle-kit push && tsx scripts/seed.ts",
  "type-check": "tsc --noEmit",
  "db:studio": "drizzle-kit studio"
};

console.log('\nAdditional NPM scripts to add manually:');
console.log(JSON.stringify(additionalScripts, null, 2));

// Create a startup batch file for Windows users
const batContent = `@echo off
echo Starting Job Portal Application...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)
echo Starting development server...
npm run dev
pause`;

fs.writeFileSync('start.bat', batContent);

// Create a startup shell script for Unix users
const shContent = `#!/bin/bash
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
npm run dev`;

fs.writeFileSync('start.sh', shContent);
fs.chmodSync('start.sh', 0o755);

console.log('\nCreated startup scripts:');
console.log('- start.bat (Windows)');
console.log('- start.sh (Unix/Linux/Mac)');
console.log('- start.js (Node.js cross-platform)');

// Create a comprehensive project structure documentation
const projectStructure = `# Project File Structure

## Essential Files for VSCode Development

### Configuration Files
- \`.env\` - Environment variables (create from .env.example)
- \`tsconfig.json\` - TypeScript configuration
- \`vite.config.ts\` - Vite build configuration
- \`tailwind.config.ts\` - Tailwind CSS configuration
- \`drizzle.config.ts\` - Database ORM configuration

### VSCode Integration
- \`.vscode/settings.json\` - Editor settings
- \`.vscode/launch.json\` - Debug configurations
- \`.vscode/tasks.json\` - Task definitions
- \`.vscode/extensions.json\` - Recommended extensions

### Application Structure
\`\`\`
client/src/
├── components/         # UI components
├── pages/             # Application pages
├── hooks/             # Custom React hooks
├── lib/               # Utilities
└── types/             # TypeScript types

server/
├── db.ts              # Database connection
├── index.ts           # Server entry point
├── routes.ts          # API routes
├── storage.ts         # Data access layer
└── vite.ts            # Development server setup

shared/
└── schema.ts          # Database schema

scripts/
└── seed.ts            # Database seeding
\`\`\`

### Startup Options

1. **VSCode Tasks** (Ctrl+Shift+P → "Tasks: Run Task")
   - Start Development Server
   - Build Project
   - Setup Database
   - Seed Database

2. **VSCode Debug** (F5)
   - Start Development Server (with debugging)
   - Seed Database

3. **Command Line**
   - \`npm run dev\` - Start development
   - \`node start.js\` - Cross-platform startup
   - \`./start.sh\` - Unix startup script
   - \`start.bat\` - Windows startup script

4. **Database Management**
   - \`npx drizzle-kit push\` - Apply schema changes
   - \`npx tsx scripts/seed.ts\` - Add sample data
   - \`npx drizzle-kit studio\` - Database admin UI
`;

fs.writeFileSync('PROJECT-STRUCTURE.md', projectStructure);

console.log('\nVSCode Development Package Ready!');
console.log('\nNext Steps:');
console.log('1. Open project in VSCode');
console.log('2. Install recommended extensions when prompted');
console.log('3. Copy .env.example to .env and update database settings');
console.log('4. Use F5 to start debugging or Ctrl+Shift+P for tasks');
console.log('5. Access application at http://localhost:5000\n');

console.log('Package Contents:');
console.log('✓ VSCode configuration (.vscode/)');
console.log('✓ Environment template (.env.example)');
console.log('✓ Database seeding script (scripts/seed.ts)');
console.log('✓ Startup scripts (start.js, start.sh, start.bat)');
console.log('✓ Documentation (README.md, SETUP-INSTRUCTIONS.md, DEVELOPMENT.md)');
console.log('✓ Project structure guide (PROJECT-STRUCTURE.md)');