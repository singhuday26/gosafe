# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GoSafe is a comprehensive tourism safety platform built for SIH 2025, integrating blockchain technology, real-time emergency services, and AI-powered chatbots. The platform serves three primary user roles: tourists, authorities, and administrators.

**Technology Stack:**
- React 18.3 with TypeScript
- Vite for build tooling
- Supabase for backend services and authentication
- shadcn/ui + Tailwind CSS for UI components
- React Query for state management and caching
- Mapbox GL for mapping functionality
- Mock blockchain implementation for digital ID management

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview

# Run tests
npm test
```

## Architecture Overview

### Core Application Structure

**Route-Based Architecture:**
- `/` - Landing page (Index)
- `/auth` - Authentication flows
- `/tourist` - Tourist dashboard (protected)
- `/authority` - Authority dashboard (protected) 
- `/admin` - Admin dashboard (protected)

**Key Architectural Components:**

1. **Authentication System** (`src/contexts/AuthContext.tsx`)
   - Role-based access control (tourist, authority, admin)
   - Supabase auth integration with profile management
   - Persistent session handling with automatic role resolution

2. **Blockchain Service** (`src/lib/blockchain.ts`)
   - Mock blockchain implementation for demo purposes
   - Digital Tourist ID generation and validation
   - SOS alert creation with blockchain hash verification
   - Geo-fencing and safety score calculations

3. **Feature System** (`src/data/features.ts`)
   - Centralized feature catalog with structured documentation
   - Dynamic routing for feature info pages (`/feature/:id`)
   - Comprehensive feature metadata including APIs, FAQs, and demo steps

4. **Real-time Infrastructure**
   - WebSocket integration for live SOS alerts
   - Multi-channel notification system (SMS, email, push, socket)
   - Geographic-based alert escalation

### Component Organization

**UI Components** (`src/components/ui/`):
- Complete shadcn/ui component library
- Consistent design system with Tailwind CSS
- Optimized image component for performance

**Application Components** (`src/components/`):
- `ChatBot.tsx` & `ChatBotWrapper.tsx` - AI assistance integration
- `DashboardButtons.tsx` - Feature navigation grid
- `MapComponent.tsx` - Mapbox GL integration for location services
- `ProtectedRoute.tsx` - Role-based route protection
- `LanguageSelector.tsx` - i18n support

### Data Architecture

**Supabase Integration**:
- Type-safe database client (`src/integrations/supabase/`)
- User profiles with role management
- Real-time subscriptions for emergency alerts

**Mock Systems**:
- Blockchain service for digital ID and SOS verification
- Geo-fence detection with safety zone mapping
- AI-powered safety scoring algorithms

## Key Development Patterns

### Adding New Features

1. **Feature Definition**: Add to `FEATURES` array in `src/data/features.ts`
2. **Required Sections**:
   - Overview with bullet points
   - "How it works" explanation
   - Demo steps for testing
   - API endpoints (if applicable)
   - FAQs for common questions

3. **Integration Points**:
   - Dashboard grid automatically displays new features
   - Dynamic routing creates `/feature/:id` pages
   - Follow accessibility guidelines (proper headings, ARIA labels)

### Authentication & Role Management

**Role Hierarchy**: tourist < authority < admin

**Pattern for Protected Routes**:
```tsx
<ProtectedRoute requiredRole="authority">
  <ComponentName />
</ProtectedRoute>
```

**Role Resolution Order**:
1. User metadata (immediate access)
2. Profiles table (authoritative source)
3. Default fallback ('tourist')

### Testing Strategy

- Component tests in `src/__tests__/`
- Test setup configured with Jest
- Example: `DashboardButtons.test.tsx` for component testing patterns
- Run with `npm test`

### Supabase Configuration

**Edge Functions** (configured in `supabase/config.toml`):
- `ai-chat` - ChatBot backend
- `blockchain-operations` - Digital ID operations
- `emergency-notifications` - SOS alert processing

**Project ID**: `bleswtkoafdljurmythi`

### Build Optimizations

**Vite Configuration**:
- Code splitting: vendor, UI components, and Mapbox chunks
- Alias: `@/` maps to `src/`
- Server runs on `::` (all interfaces) port 8080
- Terser minification with 1MB chunk size warning limit

**Performance Optimizations**:
- React Query with 5-minute stale time
- Lazy loading for all route components
- Asset inlining up to 4KB
- Optimized dependencies bundling

## Emergency System Architecture

**SOS Alert Flow**:
1. Tourist triggers SOS (button, shake, voice)
2. System captures: GPS, battery, network, landmarks, optional audio
3. Blockchain hash generation for alert verification
4. Multi-channel notifications (WebSocket, SMS, email, push)
5. Geographic escalation (rangers vs city police)
6. Real-time status updates to authority dashboards

**Geo-fence Integration**:
- Safety zones with different alert priorities
- Automatic escalation based on location risk level
- Integration with local emergency services

## Internationalization

- i18next configuration in `src/i18n/index.ts`
- Language selector component available
- Ready for multi-language support expansion

## Development Environment Notes

- Uses Lovable platform integration for AI-assisted development
- Component tagging enabled in development mode
- Supports both local development and Lovable cloud editing
- Environment variables handled through Supabase configuration