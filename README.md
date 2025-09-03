# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Recent Updates

- ✅ **Merged V1 and main branches** - Successfully integrated enhanced backend structure from V1 with main branch functionality
- ✅ **Enhanced Backend Architecture** - Added Express.js structured backend with middleware for validation and sanitization
- ✅ **Preserved Frontend Application** - Maintained comprehensive React/TypeScript frontend with full component library
- ✅ **Integrated Authentication** - Combined password hashing functionality with structured validation middleware
- ✅ Added typecheck script for TypeScript validation  
- ✅ Preserved modular component architecture with extracted variants

## Backend API Endpoints

The merged backend now provides:

- `POST /users` - Create user with validation (name, email required)
- `POST /auth/hash` - Hash passwords with salt (password minimum 8 characters)

All endpoints include input validation and sanitization middleware.

## Testing

Lighthouse and automated accessibility checks are available via npm scripts.

```bash
# Run all tests using Node.js native test runner
npm test

# Run accessibility tests using Node.js native test runner
npm run test:accessibility

# Run lighthouse tests using Node.js native test runner
npm run test:lighthouse

# Run Jest tests (when Jest issues are resolved)
npm run test:jest
```

Make sure project dependencies are installed before executing the test commands.
