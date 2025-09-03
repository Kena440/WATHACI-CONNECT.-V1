# Accessibility and Testing

This project provides multiple testing approaches for accessibility and SEO compliance.

## Node.js Native Testing

For environments that need to run without external dependencies, we provide lightweight tests using Node's built-in test runner:

### Available Scripts

- `npm test` – run all tests using Node.js native test runner
- `npm run test:accessibility` – verify the HTML document has a language attribute and images include `alt` text
- `npm run test:lighthouse` – perform basic SEO checks for a meta description tag and the existence of `robots.txt`

These tests run in environments without network access or additional CLI tools.

## Jest + jest-axe Accessibility Testing

For comprehensive component testing and accessibility validation, this project also includes Jest and jest-axe configuration.

### Overview

Jest is configured alongside the Node.js testing framework to provide accessibility testing capabilities using jest-axe. This allows us to automatically test components for accessibility violations according to WCAG guidelines.

### Setup

The following has been configured:

#### Dependencies Added
- `jest` - Testing framework
- `jest-axe` - Accessibility testing utilities
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM testing matchers
- `ts-jest` - TypeScript support for Jest
- Various supporting packages for TypeScript and React integration

#### Configuration Files
- `jest.config.cjs` - Main Jest configuration
- `jest.setup.ts` - Test setup with jest-axe integration
- `babel.config.cjs` - Babel configuration for Jest
- Type definitions in `src/@types/` for TypeScript support

### Available Scripts

```bash
# Run Jest tests
npm run test:jest

# Run Jest tests in watch mode
npm run test:jest:watch
```

## Writing Accessibility Tests

### Basic Example

```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MyComponent } from '../MyComponent';

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Advanced Example with Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';

test('should remain accessible after interactions', async () => {
  const { container } = render(<InteractiveComponent />);
  
  // Test initial state
  const initialResults = await axe(container);
  expect(initialResults).toHaveNoViolations();
  
  // Interact with component
  fireEvent.click(screen.getByRole('button'));
  
  // Test after interaction
  const afterResults = await axe(container);
  expect(afterResults).toHaveNoViolations();
});
```

## Test Conventions

- Accessibility tests should be named `*.accessibility.test.tsx`
- Place component accessibility tests in `src/components/__tests__/`
- General accessibility tests go in `src/__tests__/`

## Current Test Coverage

Accessibility tests have been added for:
- ✅ Basic accessibility patterns (buttons, images, inputs)
- ✅ DonateButton component
- ✅ ServiceCard component

## Benefits

- **Automated WCAG compliance checking** - Catch accessibility issues early
- **CI/CD integration ready** - Tests can run in continuous integration
- **Developer education** - Learn about accessibility through test failures
- **Regression prevention** - Ensure accessibility improvements aren't lost

## Common Accessibility Issues Detected

- Missing alt text on images
- Form inputs without labels
- Poor color contrast
- Missing ARIA attributes
- Incorrect heading hierarchy
- Missing focus management

## Resources

- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
