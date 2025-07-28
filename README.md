# Glow Temperature Tracker

A full-stack web application for tracking and monitoring water temperature data across beaches and regions in the Greater Toronto Area (GTA). This mobile-optimized platform enables users to contribute, analyze, and visualize water temperature data while learning about environmental patterns.

## Project Overview

### Purpose

The Glow Temperature Tracker aims to create a community-driven platform for monitoring water temperatures across GTA beaches. By combining user-contributed data with historical records, we provide valuable insights into water temperature patterns and trends.

### Key Features

- Mobile-optimized interface for easy data contribution
- Interactive map with color-coded temperature visualization
- Historical data analysis and comparison tools
- User authentication and personal data tracking
- Educational content about water temperature patterns
- Bulk data upload capability
- Regional trend analysis

## Installation

### Prerequisites

- Node.js
- npm or yarn
- Supabase account

### Setup Steps

1. Clone the repository:

```bash
git clone [repository-url]
cd glow-temperature-tracker
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Configure environment variables:

Create `.env` in the server directory:

```
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=email@example.com
```

Create `.env.local` in the client directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=email@example.com
```

4. Start the development servers:

```bash
# Start backend server
cd server
npm run dev

# Start frontend server (in a new terminal)
cd client
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Project Structure

```
glow-temperature-tracker/
├── client/               # Next.js frontend application
│   ├── app/               # App router pages and components
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions and shared logic
│   ├── public/            # Static assets
│   └── styles/            # Global styles
│
├── server/               # Express.js backend application
│   └── app/
│       ├── controllers/   # Route controllers
│       ├── middleware/    # Custom middleware
│       ├── models/        # Data models
│       └── routes/        # API routes
│
└── docs/                 # Project documentation and deliverables
```

## Authentication

The application includes example authentication pages and components:

- `/auth/login` - User login page
- `/auth/register` - New user registration
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset form

Authentication is handled using Supabase Auth, providing:

- Email/password authentication
- Session management
- Protected routes
- User profile management

## Development Workflow

### Branching Strategy

We follow a simplified Git Flow approach:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features and enhancements
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Branch Naming Convention

- Features: `feat/description-of-feature`
- Bug fixes: `bugfix/description-of-bug`
- Hotfixes: `hotfix/description-of-fix`

### Commit Conventions

We follow the Conventional Commits specification for our commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `refactor:` - A code change to restructure code w/o changing app behaviour
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Miscellaneous commits

Format: `<type>: <description>`

Examples:

```
feat: add Google OAuth login
fix: correct temperature data display
docs: update installation instructions
```

### Ticketing

We use GitHub Issues for project management:

- Feature requests
- Bug reports
- Task tracking
- Documentation updates

Issue labels:

- `improvement` - New features
- `bug` - Bug reports
- `documentation` - Documentation updates
- `help wanted` - Extra attention needed

## Contributing

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update the README.md with details of changes if needed
3. Update the documentation if you're changing functionality
4. The PR will be merged once you have the sign-off of at least one other developer

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Write clear commit messages
- Keep functions small and focused
- Add comments for complex logic

## Authors

Mohamed Ibrahim

Haseeb Afzal

Zohair Syed

Ousman Jikineh

Adeeb Nawshad
