require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);
