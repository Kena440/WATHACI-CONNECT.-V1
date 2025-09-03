import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

// Simple test component
const SimpleButton = () => (
  <button type="button" aria-label="Test button">
    Click me
  </button>
);

describe('Accessibility Tests', () => {
  test('Simple button should not have accessibility violations', async () => {
    const { container } = render(<SimpleButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Image without alt text should have accessibility violations', async () => {
    const BadImage = () => <img src="test.jpg" />;
    const { container } = render(<BadImage />);
    const results = await axe(container);
    
    // This test expects violations, so we check that violations exist
    expect(results.violations.length).toBeGreaterThan(0);
  });

  test('Input without label should have accessibility violations', async () => {
    const BadInput = () => <input type="text" />;
    const { container } = render(<BadInput />);
    const results = await axe(container);
    
    // This test expects violations for missing label
    expect(results.violations.length).toBeGreaterThan(0);
  });
});