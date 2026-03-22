# Facelook - Social Media App

## Overview
A social media frontend application built with React, TypeScript, Vite, and Tailwind CSS. Originally created in Lovable, migrated to Replit.

## Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v6
- **State/Data**: TanStack React Query
- **Animations**: Framer Motion
- **Audio**: Howler.js

## Project Structure
- `src/` - Main source code
  - `pages/` - Route-level page components (Index, NotFound, feed, profile, settings, layout)
  - `components/` - Reusable UI components (ui/, NavLink, etc.)
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `data/` - Static/mock data
- `public/` - Static assets

## Development
Run with: `npm run dev` (port 5000)

## Deployment
Static site — build with `npm run build`, output in `dist/`.

## Notes
- Removed `lovable-tagger` dev plugin from vite.config.ts (not needed on Replit)
- Vite server configured for `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
