# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Package Management

This project includes a `.npmrc` configuration file that ensures reliable package registry access. The configuration includes:
- Primary npm registry: https://registry.npmjs.org/
- Retry and timeout settings for better reliability
- Cache preferences to optimize installation speed

If you encounter package installation issues, the `.npmrc` file should resolve most registry blocking problems.

## Testing

Lighthouse and automated accessibility checks are available via npm scripts.

```bash
# Run accessibility tests powered by jest-axe
npm run test:accessibility

# Generate a Lighthouse report (requires a running dev server)
npm run test:lighthouse

# Type check the codebase
npm run typecheck
```

Make sure project dependencies are installed before executing the test commands.
