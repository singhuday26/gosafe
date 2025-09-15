# GoSafe Feature Documentation System

This directory contains the feature documentation system for the GoSafe platform. The system provides a comprehensive view of each feature with detailed documentation, examples, and interactive demos.

## Structure

1. Feature Catalog (`features.ts`)

   - Single source of truth for all feature documentation
   - Includes feature metadata, descriptions, and related content
   - Structured data for easy maintenance and updates

2. Dashboard Integration

   - Interactive feature grid on the Authority Dashboard
   - Each feature card links to detailed documentation
   - Quick preview functionality for rapid browsing

3. Feature Info Pages
   - Dynamic routes for each feature (`/feature/:id`)
   - Comprehensive documentation with sections:
     - Overview
     - How it works
     - Demo steps
     - API references
     - FAQs

## Content Guidelines

When adding new features:

1. Add feature entry to `FEATURES` array in `features.ts`
2. Include all required sections:

   - Clear title and short description
   - Detailed overview
   - Step-by-step demo instructions
   - API endpoints if applicable
   - Common FAQs

3. Follow accessibility guidelines:
   - Proper heading hierarchy
   - ARIA labels where needed
   - Keyboard navigation support

## Development

To add a new feature:

1. Add feature data to `features.ts`
2. Test rendering in dashboard
3. Verify info page content
4. Run accessibility checks
5. Add relevant tests

## Testing

Run tests with:

```bash
npm test
```

See `DashboardButtons.test.tsx` for component test examples.
