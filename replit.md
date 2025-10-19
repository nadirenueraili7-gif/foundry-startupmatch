# Foundry StartupMatch

A full-stack university startup networking platform for students to find co-founders, join projects, and showcase ventures.

## Overview

StartupMatch is a comprehensive platform designed to connect university students in the startup ecosystem. It provides tools for team formation, project collaboration, startup showcasing, direct messaging, and content moderation.

## Current State (October 19, 2025)

### Completed Features

**✅ Core Features:**
- Team Matching - Browse and create team posts to find co-founders
- Project Gigs Board - Post and discover project opportunities
- Startup Showcase - Display student ventures with detailed profiles
- User Profiles - Manage skills, interests, bio, and professional information
- Real-time Messaging - WebSocket-based direct messaging between users
- Admin Dashboard - Content approval workflow with pending/approved/rejected states

**✅ Technical Implementation:**
- Full TypeScript type safety across frontend and backend
- PostgreSQL database with 7 tables (users, sessions, teamPosts, projectGigs, startups, messages)
- Replit Auth integration for secure authentication (Google, GitHub, email/password)
- RESTful API with comprehensive CRUD endpoints
- WebSocket server for real-time notifications
- TanStack Query for data fetching and caching
- React Hook Form + Zod for form validation
- Optimistic UI updates for messaging
- Responsive design with dark mode support

**✅ Security:**
- All API endpoints protected with `isAuthenticated` middleware
- Admin-only routes verified with `isAdmin` role check
- Input validation using Zod schemas
- Unauthorized error handling with automatic redirect to login
- WebSocket used only for notifications (not data operations)

### Architecture

**Frontend:**
- React 18 with TypeScript
- Wouter for client-side routing
- TanStack Query for server state management
- Shadcn UI components with Radix primitives
- Tailwind CSS for styling
- Theme provider for dark/light mode

**Backend:**
- Express.js server
- Drizzle ORM with Neon PostgreSQL
- Replit Auth (OpenID Connect)
- WebSocket server on /ws path
- Session management with connect-pg-simple

**Database Schema:**
- `users` - User profiles with skills, interests, and role
- `sessions` - HTTP session storage
- `teamPosts` - Co-founder search posts
- `projectGigs` - Project opportunities
- `startups` - Startup showcase profiles
- `messages` - Direct messages between users

### Known Limitations & Future Enhancements

**Image Uploads:**
- **Current MVP Approach:** URL-based images only (logoUrl, heroImageUrl, profileImageUrl)
- **Workaround:** Users can upload images to free services and paste URLs:
  - [Imgur](https://imgur.com/) - Free image hosting, get direct link
  - [Cloudinary](https://cloudinary.com/) - Free tier available
  - [Replit Assets](https://docs.replit.com/) - Upload to replit project assets
- **Why URL-first for MVP:**
  - Avoids complexity of file storage management
  - No server storage/bandwidth concerns
  - Works for initial validation and user testing
  - Faster MVP delivery for market validation
- **Post-MVP Enhancement (v2):**
  - Direct file upload with multipart/form-data handling
  - Cloud storage integration (Cloudinary/S3)
  - Image optimization and resizing
  - Drag-and-drop upload UX
  - File size/type validation

**Optimizations:**
- Current WebSocket broadcasts to all clients; could be optimized for targeted delivery
- Message read receipts implemented but could show in UI
- Profile completion percentage could be added to encourage better profiles

## Development

### Running the Project

```bash
npm run dev        # Start development server (port 5000)
npm run db:push    # Push schema changes to database
```

### Environment Variables

Required secrets (managed by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Comma-separated list of allowed domains
- `ISSUER_URL` - OIDC issuer URL (default: https://replit.com/oidc)

### Project Structure

```
client/
  src/
    pages/          # Route components
    components/     # Reusable UI components
    hooks/          # Custom React hooks (useAuth)
    lib/            # Utilities (queryClient, authUtils)
    contexts/       # React contexts (ThemeProvider)

server/
  db.ts            # Database connection
  storage.ts       # DatabaseStorage implementation
  routes.ts        # API endpoints + WebSocket server
  replitAuth.ts    # Authentication setup

shared/
  schema.ts        # Database schema + TypeScript types + Zod validators
```

### Key Implementation Details

**Authentication Flow:**
1. User clicks "Get Started" on landing page
2. Redirected to `/api/login` (Replit Auth)
3. After successful auth, user record upserted to database
4. Session created and user redirected to `/` (home dashboard)
5. `useAuth` hook provides user state throughout app

**Messaging Flow:**
1. User types message and clicks Send
2. Optimistic update shows message immediately
3. POST to `/api/messages` creates message in database
4. WebSocket broadcasts `{type: "new_message"}` notification
5. All clients invalidate cache and refetch messages
6. Server response reconciles with optimistic update

**Content Approval Flow:**
1. User creates team post/project gig/startup (status: "pending")
2. Content appears in admin dashboard for review
3. Admin approves or rejects (PATCH endpoint with status update)
4. Approved content becomes visible to all users
5. Rejected content remains hidden

### Design System

Following `design_guidelines.md`:
- **Colors:** Primary (blue), Accent (coral), Success/Error/Warning
- **Typography:** Inter font family, 3 levels of text hierarchy
- **Spacing:** Consistent 2/4/6/8 padding scale
- **Components:** Shadcn UI with custom theming
- **Interactions:** hover-elevate and active-elevate-2 utilities

## User Preferences

None configured yet.

## Recent Changes

- October 19, 2025: Initial MVP implementation complete
  - Created complete database schema with 7 tables
  - Implemented all backend API endpoints with authentication
  - Built all frontend pages with responsive design
  - Integrated WebSocket for real-time messaging
  - Added optimistic updates for better UX
  - Set up admin approval workflow

## Testing Notes

### Test User Journey:
1. **Registration** - Visit landing page → Click "Get Started" → Complete Replit Auth
2. **Profile Setup** - Navigate to profile → Add skills, interests, bio
3. **Browse Opportunities** - View team posts and project gigs with search/filter
4. **Create Content** - Post a team need → Submit for admin review
5. **Messaging** - Click on user profile → Send message → Real-time delivery
6. **Admin Flow** - Admin user reviews pending content → Approve/reject

### Testing with Images:
For startup showcase testing with images:
1. Upload logo/hero image to Imgur or similar service
2. Right-click image → "Copy image address"
3. Paste URL in startup creation form
4. Ensure URL ends in .jpg, .png, or .webp for best results

### Admin Access:
- Set `isAdmin: true` in database for admin users
- Admin dashboard accessible at `/admin` route
- Only admins can approve/reject content
