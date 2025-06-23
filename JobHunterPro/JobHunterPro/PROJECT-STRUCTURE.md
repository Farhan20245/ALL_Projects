# Project File Structure

## Essential Files for VSCode Development

### Configuration Files
- `.env` - Environment variables (create from .env.example)
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration

### VSCode Integration
- `.vscode/settings.json` - Editor settings
- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Task definitions
- `.vscode/extensions.json` - Recommended extensions

### Application Structure
```
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
```

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
   - `npm run dev` - Start development
   - `node start.js` - Cross-platform startup
   - `./start.sh` - Unix startup script
   - `start.bat` - Windows startup script

4. **Database Management**
   - `npx drizzle-kit push` - Apply schema changes
   - `npx tsx scripts/seed.ts` - Add sample data
   - `npx drizzle-kit studio` - Database admin UI