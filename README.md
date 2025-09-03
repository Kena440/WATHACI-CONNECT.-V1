# WATHACI CONNECT V1

A React + TypeScript + Vite application with integrated backend API server.

## Features

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Radix UI components with shadcn/ui
- React Router for navigation
- Supabase integration for authentication and data
- React Query for state management

### Backend API
- Express.js server with TypeScript/ES modules
- RESTful API endpoints
- Supabase integration
- CORS enabled for frontend communication
- Comprehensive error handling

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase project (optional)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

#### Run frontend only:
```bash
npm run dev
```

#### Run backend API only:
```bash
npm run dev:api
```

#### Run both frontend and backend:
```bash
npm run dev:full
```

The frontend will be available at http://localhost:8080
The backend API will be available at http://localhost:3001

### Building

#### Build frontend only:
```bash
npm run build
```

#### Build both frontend and backend:
```bash
npm run build:full
```

## Backend API Integration

The project now includes a complete backend API server that works alongside the existing Supabase setup. The backend provides additional endpoints for:

- **Authentication**: Session verification, token refresh
- **Profiles**: CRUD operations for user profiles  
- **Users**: Public user data, search, statistics
- **Marketplace**: Listings, categories, search functionality

### API Endpoints

- `GET /health` - Server health check
- `GET /api/v1` - API information
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/profiles/*` - Profile management
- `/api/v1/users/*` - User operations
- `/api/v1/marketplace/*` - Marketplace functionality

### Testing the Integration

Visit `/api-test` in the application to see a live demonstration of the frontend-backend integration.

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and API client
│   ├── pages/             # Page components
│   └── ...
├── server/                # Backend API server
│   ├── routes/            # API route handlers
│   ├── config/            # Configuration files
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── dist/                  # Built frontend assets
└── ...
```

## Environment Variables

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-anon-key
PORT=3001  # Backend server port
```

## Testing

```bash
npm run test:jest          # Run Jest tests
npm run test:accessibility # Run accessibility tests
```

## Contributing

This project uses ESLint for code quality and Jest for testing. Make sure to run tests before committing changes.
