# Development Guide

## Architecture Overview

This is a full-stack TypeScript application with:
- **Frontend**: React with Vite, Tailwind CSS, and Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Demo system for role-based testing

## File Structure

```
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── ApplicationModal.tsx
│   │   ├── Header.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobFilters.tsx
│   │   └── SearchBar.tsx
│   ├── pages/              # Application pages
│   │   ├── admin-dashboard.tsx
│   │   ├── company-profile.tsx
│   │   ├── employer-dashboard.tsx
│   │   ├── home.tsx
│   │   ├── job-detail.tsx
│   │   ├── job-seeker-dashboard.tsx
│   │   ├── landing.tsx
│   │   └── not-found.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── use-toast.ts
│   ├── lib/                # Utility functions
│   │   ├── authUtils.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── types/              # TypeScript definitions
│       └── index.ts
├── server/
│   ├── db.ts              # Database connection setup
│   ├── index.ts           # Express server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   ├── vite.ts            # Vite integration for development
│   └── replitAuth.ts      # Authentication middleware
├── shared/
│   └── schema.ts          # Database schema and types
└── scripts/
    └── seed.ts            # Database seeding script
```

## Database Schema

### Core Tables
- **users**: User accounts with authentication info
- **companies**: Company profiles and details
- **jobs**: Job listings with requirements and benefits
- **applications**: Job applications with status tracking
- **bookmarks**: User saved jobs
- **messages**: Internal messaging system
- **sessions**: Session storage for authentication

### Key Relationships
- Users can be job seekers, employers, or admins
- Companies have multiple jobs
- Jobs belong to companies and are posted by users
- Applications link users to jobs
- Bookmarks allow users to save jobs

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Demo login (Job Seeker)
- `GET /api/login/employer` - Demo login (Employer)
- `GET /api/login/admin` - Demo login (Admin)
- `GET /api/logout` - Logout

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)

### Companies
- `GET /api/companies` - List companies
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company (Employer only)
- `PUT /api/companies/:id` - Update company (Employer only)

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/user/:userId` - User's applications
- `GET /api/applications/job/:jobId` - Job applications (Employer only)
- `PUT /api/applications/:id/status` - Update application status

### Bookmarks
- `POST /api/bookmarks` - Bookmark job
- `DELETE /api/bookmarks/:jobId` - Remove bookmark
- `GET /api/bookmarks/user/:userId` - User's bookmarks

## Component Architecture

### Page Components
Each page component handles:
- Authentication state checking
- Data fetching with React Query
- Role-based content rendering
- User interactions and form submissions

### UI Components
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Type-safe props with TypeScript
- Consistent design system

### State Management
- React Query for server state
- React hooks for local state
- Context for authentication
- Form state with React Hook Form

## Development Workflow

### Adding New Features

1. **Database Changes**
   ```bash
   # Update schema.ts
   # Push changes to database
   npx drizzle-kit push
   ```

2. **Backend Changes**
   ```bash
   # Update storage interface
   # Add API routes
   # Test with curl or Postman
   ```

3. **Frontend Changes**
   ```bash
   # Create/update components
   # Add pages if needed
   # Update routing
   ```

### Testing Features

1. **Database Operations**
   ```bash
   # Open database studio
   npx drizzle-kit studio
   ```

2. **API Testing**
   ```bash
   # Test endpoints
   curl http://localhost:5000/api/jobs
   ```

3. **Frontend Testing**
   - Use demo login buttons
   - Test different user roles
   - Verify responsive design

## Styling Guidelines

### Tailwind Classes
- Use semantic color classes: `text-primary`, `bg-secondary`
- Responsive design: `md:`, `lg:`, `xl:` prefixes
- Dark mode support: `dark:` prefix

### Component Patterns
- Consistent spacing with Tailwind spacing scale
- Use design tokens for colors and typography
- Follow accessibility guidelines

## Environment Configuration

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/jobportal
SESSION_SECRET=development-secret
```

### Production
```env
NODE_ENV=production
DATABASE_URL=production-database-url
SESSION_SECRET=secure-random-secret
```

## Deployment Considerations

### Build Process
1. Frontend builds to `dist/` directory
2. Backend compiles with esbuild
3. Assets are served statically in production

### Environment Variables
- Database connection string
- Session secret for security
- Any API keys for external services

### Database Migrations
- Use `drizzle-kit push` for schema changes
- Backup database before major changes
- Test migrations in staging environment

## Performance Optimization

### Frontend
- Code splitting with dynamic imports
- Image optimization
- Bundle analysis with build tools

### Backend
- Database query optimization
- Caching strategies
- Connection pooling

### Database
- Proper indexing on search fields
- Query optimization
- Connection management

## Security Considerations

### Authentication
- Secure session management
- Password hashing (if implementing custom auth)
- CSRF protection

### Data Validation
- Input sanitization
- Type checking with Zod schemas
- SQL injection prevention with ORM

### API Security
- Rate limiting
- Input validation
- Error handling without information leakage