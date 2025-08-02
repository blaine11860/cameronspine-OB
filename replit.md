# Moore Maternal Care - Pregnancy Tracking Application

## Overview

Moore Maternal Care is a comprehensive clinical pregnancy tracking platform that enables expectant mothers, clinicians, and healthcare providers to monitor pregnancy journeys through advanced features including educational content delivery, community forums, secure messaging, and clinical-grade data tracking. The platform supports both patient self-monitoring and professional clinical oversight with features designed for high-risk pregnancy management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (February 2025)

✓ **Authentication System Completely Removed:**
  - Eliminated all authentication requirements from frontend and backend
  - Converted to demo mode with mock user data for ease of use
  - Removed Replit Auth, Supabase Auth, and all session management
  - All pages now accessible without login requirements
  - Mock user profiles and pregnancy data for demonstration purposes

✓ **Advanced Symptom Tracking System Implemented:**
  - JSONB-based symptom logging with 1-5 severity scale and mood integration (1-10)
  - Clinical analytics with symptom frequency analysis and trend tracking
  - Comprehensive symptom management interface with common symptom quick-add
  - Sample data demonstrating clinical JSONB structure

✓ **Secure Data Sharing Platform Added:**
  - Token-based secure sharing system for healthcare provider access
  - Configurable expiration periods (1 day to 1 month) with automatic cleanup
  - Public summary viewer with clinical analytics and symptom history
  - Privacy-focused design with revokable access tokens

✓ **Real-Time Communication Infrastructure Added:**
  - Socket.IO integration with mock user support
  - Direct messaging between patients and healthcare providers
  - Emergency consultation requests with automated clinician alerts
  - Real-time typing indicators and message read receipts
  - Emergency message flagging for urgent medical communications

✓ **External Appointment Scheduling Integration:**
  - "Schedule Appointment" buttons added throughout platform
  - Direct links to https://mooreobgyn.com/ for seamless booking
  - Prominent placement in navigation bars across all pages
  - Dedicated appointment section on home dashboard

✓ **Multilingual Support for English, Spanish, and French:**
  - Complete internationalization system using React context
  - Translation files for all user-facing content in three languages
  - Language selector component in navigation for easy switching
  - Persistent language preference stored in localStorage
  - Full translation coverage for navigation, forms, and content

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

### Database Schema Design (Updated: August 2025)
- **Users Table**: Enhanced with clinician flags, phone numbers, profile completion status, and display names
- **Pregnancy Profiles**: Tracks pregnancy details with high-risk flags stored as JSONB for flexible clinical data
- **Symptom Logs**: JSONB-based symptom tracking with severity mapping and integrated mood scoring (1-10 scale)
- **Educational Contents**: Week-based educational materials with readability levels (low/medium/high) and tag systems
- **Forum Threads & Posts**: Community discussion platform with moderation flags and threaded conversations
- **Messages**: Secure direct messaging between users with read receipts and content moderation
- **Shared Summaries**: Secure token-based sharing system for pregnancy data with healthcare providers
- **Sessions Table**: Manages user authentication sessions (required for Replit Auth)

### Data Validation and Type Safety
- **Shared Schema**: Common TypeScript types and Zod schemas shared between frontend and backend
- **Runtime Validation**: Zod schemas for validating API requests and responses
- **Type Generation**: Drizzle generates TypeScript types from database schema
- **Form Validation**: Client-side validation using React Hook Form with Zod resolvers

### Demo Mode (Updated: February 2025)
- **No Authentication Required**: Complete removal of all authentication systems
- **Mock User Data**: Demo user profiles and pregnancy data for immediate access
- **Open Access**: All features accessible without login or registration
- **Sample Data**: Realistic mock data for symptoms, mood tracking, and messaging

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