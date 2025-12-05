# Locoface

## Overview
Locoface is a web application that transforms photos into cute chibi kawaii stickers using AI.

**Domain:** https://locoface.com

## Tech Stack
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase
- **AI:** OpenAI API
- **Animation:** Framer Motion
- **Image Processing:** Sharp

## Project Structure
```
src/
├── app/           # Next.js App Router pages and API routes
│   ├── api/       # API endpoints
│   ├── download/  # Download page
│   ├── layout.tsx # Root layout with metadata
│   ├── page.tsx   # Home page
│   └── globals.css
├── components/    # React components
├── lib/           # Library configurations (Supabase, etc.)
└── utils/         # Utility functions
```

## Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Environment Variables
See `env.example` for required environment variables.

## Database
Supabase schema is defined in `supabase_schema.sql`.
