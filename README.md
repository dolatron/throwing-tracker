# Throwing Tracker

A modern web application for tracking throwing workouts and velocity development programs. Built with Next.js, React, and Supabase.

## Features

- 🎯 Complete workout tracking and progression monitoring
- 📊 Calendar and list views for workout scheduling
- 🔄 Real-time synchronization with cloud storage
- 📱 Responsive design for mobile and desktop
- 🔐 Secure authentication with magic links
- 📝 Workout notes and completion tracking
- 📈 Progress visualization and statistics

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── (api)/               # API routes
│   ├── (auth)/              # Authentication pages
│   ├── (user)/              # User pages
│   └── styles/              # Global styles
├── contexts/                # React Context providers
│   ├── auth-context.tsx     # Authentication context
│   └── program-context.tsx  # Program data context
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── programs/               # Program configuration
├── types/                  # TypeScript types
└── views/                  # UI components
    ├── auth/               # Authentication components
    ├── onboarding/        # Onboarding flow
    ├── shared/            # Shared UI components
    └── workout-tracker/   # Main workout tracking UI
```

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/throwing-tracker.git
cd throwing-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

The application uses Supabase with the following main tables:

- `users` - User profiles
- `user_programs` - User-program associations
- `user_workouts` - Individual workout records
- `completed_exercises` - Exercise completion tracking

## Authentication Flow

1. User enters email
2. Magic link sent via Supabase Auth
3. User clicks link and is redirected back
4. Session created and user redirected to dashboard

## Deployment

The application is deployed on Vercel. New deployments are automatically triggered when pushing to the main branch.

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/throwing-tracker)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.