# Job Portal Application

## Overview

This is a full-stack job portal application built with React frontend and Express.js backend. The application allows job seekers to find and apply for jobs, employers to post job listings, and administrators to manage the platform. It features a modern UI built with Tailwind CSS and shadcn/ui components, with PostgreSQL database managed through Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with custom design system
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **State Management**: TanStack Query for server state, React Context for global state
- **Routing**: Wouter (lightweight client-side routing)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for JSON parsing and CORS
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with type-safe queries
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **File Uploads**: Multer for handling file uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Design
The application uses a comprehensive PostgreSQL schema with the following main entities:
- **Users**: Supports multiple roles (job_seeker, employer, admin)
- **Companies**: Company profiles linked to employer users
- **Jobs**: Job listings with detailed requirements and benefits
- **Applications**: Job applications linking users to jobs
- **Resumes**: User resume storage and management
- **Portfolios**: Portfolio projects for job seekers
- **Saved Jobs**: User's saved job listings
- **Interviews**: Interview scheduling and management
- **Skill Tests**: Technical assessments for candidates

## Key Components

### Authentication System
- JWT token-based authentication stored in localStorage
- Role-based access control (admin, employer, job_seeker)
- Protected routes with authentication middleware
- Password hashing with bcrypt

### Job Management
- Advanced job search with filters (location, experience, salary, etc.)
- Job posting workflow for employers
- Application tracking system
- Job approval process for administrators

### User Experience Features
- Responsive design with mobile-first approach
- Dark/light theme support
- Toast notifications for user feedback
- File upload capabilities for resumes and portfolio items
- Real-time search and filtering

### Admin Dashboard
- Platform statistics and analytics
- Job approval/rejection workflow
- User management capabilities
- System monitoring tools

## Data Flow

1. **User Registration/Login**: Users register with role selection, credentials are validated and JWT tokens are issued
2. **Job Search**: Users can search and filter jobs, with real-time updates from the database
3. **Job Application**: Authenticated users can apply for jobs, with application tracking
4. **Employer Workflow**: Employers can post jobs, manage applications, and schedule interviews
5. **Admin Operations**: Administrators can approve jobs, manage users, and view platform analytics

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI primitives for accessibility
- **clsx & tailwind-merge**: Utility for conditional CSS classes
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **multer**: File upload handling
- **express-session**: Session management

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **drizzle-kit**: Database migration and schema management tools

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with TypeScript execution via tsx
- **Database**: PostgreSQL 16 (provisioned automatically in Replit)
- **Development Server**: Vite dev server with HMR on port 5000
- **File Watching**: Automatic restart on server file changes

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Static Assets**: Served by Express in production mode
- **Database**: PostgreSQL with connection pooling for performance

### Configuration
- **Environment Variables**: DATABASE_URL for database connection, JWT_SECRET for authentication
- **File Uploads**: Local file storage in `uploads/` directory
- **Session Storage**: PostgreSQL-backed session store for scalability

## Changelog

Changelog:
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.