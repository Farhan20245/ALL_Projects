# Local Development Setup Instructions

## Prerequisites

Before running this project locally, ensure you have:

1. **Node.js** (version 18 or higher)
   - Download from https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (version 12 or higher)
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

3. **Git** (for version control)
   - Download from https://git-scm.com/

## Quick Setup

1. **Extract the project** to your desired directory

2. **Open in VSCode**
   ```bash
   code job-portal
   ```

3. **Run the automated setup**
   ```bash
   node setup.js
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5000`

## Manual Setup (if automated setup fails)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobportal
SESSION_SECRET=your-very-secure-session-secret-key
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=jobportal
```

### 3. Database Setup
```bash
# Create database schema
npx drizzle-kit push

# Seed with sample data
npx tsx scripts/seed.ts
```

### 4. Start Development
```bash
npm run dev
```

## VSCode Integration

This project includes VSCode configuration for optimal development:

### Available Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- **Start Development Server** - Launches the app
- **Build Project** - Creates production build
- **Setup Database** - Initializes database schema
- **Seed Database** - Adds sample data
- **Type Check** - Validates TypeScript

### Debugging (F5)
- **Start Development Server** - Debug mode with breakpoints
- **Seed Database** - Debug database seeding

### Recommended Extensions
The project will suggest installing helpful VSCode extensions automatically.

## Project Structure

```
job-portal/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Backend Express app
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data layer
│   └── index.ts           # Server entry
├── shared/                # Shared types
│   └── schema.ts          # Database schema
├── scripts/               # Utility scripts
│   └── seed.ts            # Database seeding
└── .vscode/               # VSCode configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npx drizzle-kit push` - Update database schema
- `npx drizzle-kit studio` - Open database admin
- `npx tsx scripts/seed.ts` - Seed database

## Demo Features

The application includes:

- **Landing Page** with job listings and company showcase
- **Demo Authentication** (Job Seeker, Employer, Admin buttons)
- **Advanced Search** with filters and sorting
- **Role-based Dashboards** for different user types
- **Job Application System** with status tracking
- **Company Profiles** with detailed information
- **Responsive Design** for all screen sizes

## Sample Data

The seeded database includes:
- 3 sample companies (TechCorp Solutions, DataFlow Analytics, Green Energy Systems)
- 6 job listings with realistic requirements and salaries
- 3 demo user accounts for testing different roles

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify credentials in `.env` file
3. Check if database exists: `psql -h localhost -U postgres -l`

### Port Already in Use
Change the port in `server/index.ts` if 5000 is occupied.

### TypeScript Errors
Run type checking: `npm run check`

### Missing Dependencies
Reinstall: `rm -rf node_modules package-lock.json && npm install`

## Production Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start: `npm run start`

For cloud deployment, ensure environment variables are properly configured.