# GetaGig Web

Next.js frontend for the GetaGig platform. This app is the main web client for musicians, organizers, and admins to manage profiles, gigs, applications, messaging, and notifications.

## Key Capabilities

- Authentication flows (signup, login, password reset)
- Musician and organizer dashboard experiences
- Gig browsing and management
- Application workflows
- Media upload and profile management
- Real-time messaging and notification UX

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Axios for API integration
- Socket.IO client for real-time features
- React Hook Form + Zod for form handling and validation

## Prerequisites

- Node.js 18+
- npm
- Running `getagig-backend` API

## Environment Variables

Create `.env.local` in `getagig-web/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5050
```

If not set, the app defaults to `http://localhost:5050` in several API helpers.

## Install And Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

- `npm run dev`: Start the Next.js development server
- `npm run build`: Create a production build
- `npm run start`: Run the production server
- `npm run lint`: Run ESLint checks
- `npm test`: Run Jest test suites
- `npm run test:watch`: Run Jest in watch mode

## Project Structure (High Level)

- `app/(auth)`: Authentication pages and related components
- `app/musician`: Musician-facing pages
- `app/organizer`: Organizer-facing pages
- `app/admin`: Admin-facing pages
- `app/messages`, `app/notifications`: Communication features
- `lib/api`: API clients and endpoint wrappers
