import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, expect } from 'vitest';
import Header from '../Header';

vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

vi.mock('../NotificationCenter', () => ({
  NotificationCenter: () => <div />,
}));

vi.mock('../DonateButton', () => ({
  DonateButton: () => <button>Donate</button>,
}));

test('Header has no accessibility violations', async () => {
  const { container } = render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
