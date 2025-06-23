# Job Portal Web Application

A comprehensive full-stack job portal built with React, Express, TypeScript, and PostgreSQL. Features role-based access for Job Seekers, Employers, and Admins with advanced search capabilities.

## Features

- **Job Search & Filtering**: Advanced search with filters for location, job type, experience level, and salary
- **Role-Based Access**: Separate dashboards for Job Seekers, Employers, and Admins
- **Company Profiles**: Detailed company information and job listings
- **Application Management**: Track job applications and their status
- **Bookmarking**: Save favorite job listings
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Demo login system for testing
- **UI Components**: Radix UI, Shadcn/ui

## Prerequisites

- Node.js (version 18 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd job-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/jobportal
   SESSION_SECRET=your-session-secret-key-here
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Push the schema to your database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
job-portal/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── index.html
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── package.json
```

## Demo Accounts

The application includes demo login functionality for testing:

- **Job Seeker**: Access job search, applications, and bookmarks
- **Employer**: Manage company profiles and job postings
- **Admin**: System administration and analytics

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with role-based access
- **Companies**: Company profiles and information
- **Jobs**: Job listings with detailed requirements
- **Applications**: Job applications and status tracking
- **Bookmarks**: Saved job listings for users

## Development

### Adding New Features

1. Update the database schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update the storage interface in `server/storage.ts`
4. Add API routes in `server/routes.ts`
5. Create frontend components and pages

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session management
- `NODE_ENV`: Environment (development/production)

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set up production environment variables

3. Start the production server:
   ```bash
   npm run start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.