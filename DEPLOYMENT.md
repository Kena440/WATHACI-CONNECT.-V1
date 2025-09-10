# Deployment Guide

## Overview
This project has been configured for proper deployment with both frontend (React/Vite) and backend (Express) components.

## Build Process

### Frontend
```bash
npm install
npm run lint      # Check code quality
npm run typecheck # TypeScript validation
npm run build     # Production build
npm test          # Run tests
```

### Backend
```bash
cd backend
npm install
npm start         # Starts server on port 3000
```

## Development
```bash
npm run dev       # Frontend dev server (port 8080)
```

## CI/CD
The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on both `main` and `V1` branches and includes:
- Dependency installation
- Linting
- Type checking
- Testing
- Building

## Key Fixed Issues
1. **Index.html corruption**: Removed duplicate HTML structure and conflicting asset references
2. **Missing TypeScript checks**: Added `typecheck` script for CI pipeline
3. **Branch configuration**: Updated CI to handle both main and V1 branches
4. **Asset management**: Added assets/ to .gitignore to prevent merge conflicts

## Notes
- V1 is currently the default branch
- Build artifacts are automatically ignored via .gitignore
- The project successfully builds and all tests pass
- Both development and production modes work correctly