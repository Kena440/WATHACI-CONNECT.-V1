import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, jest } from '@jest/globals';

import Header from '../components/Header';
import Footer from '../components/Footer';

jest.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({ user: null, signOut: jest.fn(), loading: false }),
}));

jest.mock('@/components/NotificationCenter', () => ({
  NotificationCenter: () => <div />,
}));

jest.mock('@/components/DonateButton', () => ({
  DonateButton: () => <button>Donate</button>,
}));

describe('Header navigation', () => {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Freelancer Hub', path: '/freelancer-hub' },
    { name: 'Resources', path: '/resources' },
    { name: 'Partnership Hub', path: '/partnership-hub' },
    { name: 'Get Started', path: '/get-started' },
  ];

  it.each(links)('navigates to %s', async ({ name, path }) => {
    render(
      <MemoryRouter initialEntries={['/initial']}>
        <Header />
        <Routes>
          {links.map((r) => (
            <Route key={r.path} path={r.path} element={<div>{r.name} Page</div>} />
          ))}
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name }));
    expect(screen.getByText(`${name} Page`)).toBeInTheDocument();
  });
});

describe('Footer navigation', () => {
  const links = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Freelancer Hub', path: '/freelancer-hub' },
    { name: 'Partnership Hub', path: '/partnership-hub' },
    { name: 'Resources', path: '/resources' },
    { name: 'Get Started', path: '/get-started' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
  ];

  it.each(links)('navigates to %s', async ({ name, path }) => {
    render(
      <MemoryRouter initialEntries={['/initial']}>
        <Footer />
        <Routes>
          {links.map((r) => (
            <Route key={r.path} path={r.path} element={<div>{r.name} Page</div>} />
          ))}
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name }));
    expect(screen.getByText(`${name} Page`)).toBeInTheDocument();
  });
});
