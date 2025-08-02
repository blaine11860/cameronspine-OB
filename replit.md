# MaternalCare - Pregnancy Tracking Application

## Overview

MaternalCare is a full-stack pregnancy tracking application that enables expectant mothers to monitor their pregnancy journey through personalized timeline visualization, symptom logging, and mood monitoring. The application provides a comprehensive dashboard for tracking pregnancy milestones, logging daily symptoms and moods, and visualizing progress throughout the pregnancy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile devices and desktop layouts

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL session store for persistent user sessions
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful endpoints with proper error handling and request/response validation

### Database Schema Design
- **Users Table**: Stores user authentication data (required for Replit Auth integration)
- **Pregnancy Profiles**: Tracks pregnancy details including due date, current week, and baby information
- **Symptom Logs**: Records daily symptoms with severity levels and detailed notes
- **Mood Logs**: Captures daily mood tracking with emoji-based mood selection
- **Weight Logs**: Monitors weight progression throughout pregnancy
- **Pregnancy Milestones**: Tracks important pregnancy events and appointments
- **Sessions Table**: Manages user authentication sessions (required for Replit Auth)

### Data Validation and Type Safety
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend
- **Runtime Validation**: Zod schemas for validating API requests and responses
- **Type Generation**: Drizzle generates TypeScript types from database schema
- **Form Validation**: Client-side validation using React Hook Form with Zod resolvers

### Authentication Flow
- **OAuth Integration**: Replit OAuth with OIDC for secure authentication
- **Session Persistence**: PostgreSQL-backed session storage with configurable TTL
- **Route Protection**: Authentication middleware protecting sensitive API endpoints
- **User Context**: React context for managing authentication state across components

## External Dependencies

### Database and Infrastructure
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL for scalable data storage
- **Drizzle Kit**: Database migration and schema management tool
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication Services
- **Replit Auth**: OAuth provider using OpenID Connect for user authentication
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **Memoizee**: Caching for OIDC configuration to improve performance

### Frontend Libraries
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting library
- **React Query**: Server state management and caching solution

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Deployment and Development
- **Replit Platform**: Cloud-based development and hosting environment
- **Environment Variables**: Configuration management for database URLs and secrets
- **Session Secrets**: Secure session management with configurable secret keys