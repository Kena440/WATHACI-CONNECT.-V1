require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
