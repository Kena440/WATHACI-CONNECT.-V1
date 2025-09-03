# WATHACI CONNECT API V1

Backend API server for the WATHACI CONNECT platform.

## Features

- **Authentication Routes**: Session verification, token refresh
- **Profile Management**: CRUD operations for user profiles
- **User Operations**: Public user data, search, statistics
- **Marketplace**: Listings, categories, search functionality
- **Supabase Integration**: Works alongside existing Supabase setup

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase project (optional, for database operations)

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in the root `.env` file:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-anon-key
PORT=3001
```

### Running the Server

#### Development mode (with auto-reload):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

### Running from Root Directory

From the project root, you can use these commands:

- Start API server only: `npm run dev:api`
- Start both frontend and API: `npm run dev:full`
- Build both frontend and API: `npm run build:full`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Information
- `GET /api/v1` - API information and available endpoints

### Authentication
- `POST /api/v1/auth/verify-session` - Verify access token
- `GET /api/v1/auth/session` - Get session info
- `POST /api/v1/auth/refresh` - Refresh access token

### Profiles
- `GET /api/v1/profiles/:userId` - Get user profile
- `PUT /api/v1/profiles/:userId` - Update user profile
- `POST /api/v1/profiles/:userId/complete` - Mark profile as complete
- `GET /api/v1/profiles/:userId/status` - Get profile completion status

### Users
- `GET /api/v1/users/:userId/public` - Get public user data
- `GET /api/v1/users/:userId/stats` - Get user statistics
- `GET /api/v1/users` - Search users (with query parameters)

### Marketplace
- `GET /api/v1/marketplace/listings` - Get marketplace listings
- `GET /api/v1/marketplace/listings/:listingId` - Get specific listing
- `POST /api/v1/marketplace/listings` - Create new listing
- `GET /api/v1/marketplace/categories` - Get marketplace categories
- `GET /api/v1/marketplace/stats` - Get marketplace statistics

## Frontend Integration

The frontend is configured to proxy API requests to the backend server in development mode. The API client utility is available at `src/lib/api-client.ts`.

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// Get marketplace categories
const categoriesResponse = await apiClient.getMarketplaceCategories();
if (categoriesResponse.success) {
  console.log(categoriesResponse.data);
}

// Search users
const usersResponse = await apiClient.searchUsers({
  account_type: 'freelancer',
  limit: 10
});
```

## Architecture

- **Express.js** server with TypeScript/ES modules
- **Supabase** integration for authentication and database
- **CORS** enabled for frontend communication
- **RESTful API** design with consistent response format
- **Error handling** middleware
- **Development proxy** setup via Vite

## Development

The backend is designed to complement the existing Supabase setup, providing additional API endpoints while maintaining compatibility with the current frontend architecture.

### Adding New Routes

1. Create new route file in `routes/` directory
2. Import and register in `routes/index.js`
3. Follow the existing pattern for error handling and response format

### Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": any, // on success
  "error": "string", // on error
  "message": "string" // optional
}
```