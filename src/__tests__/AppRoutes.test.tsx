import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { AppRoutes } from '../App';

vi.mock('../pages/Index', () => ({ default: () => <div>Home Page</div> }));
vi.mock('../pages/Marketplace', () => ({ default: () => <div>Marketplace Page</div> }));
vi.mock('../pages/Resources', () => ({ default: () => <div>Resources Page</div> }));
vi.mock('../pages/NotFound', () => ({ default: () => <div>Not Found</div> }));
vi.mock('../pages/SignIn', () => ({ SignIn: () => <div>Sign In Page</div> }));
vi.mock('../pages/GetStarted', () => ({ GetStarted: () => <div>Get Started Page</div> }));
vi.mock('../pages/SubscriptionPlans', () => ({ SubscriptionPlans: () => <div>Subscription Plans Page</div> }));
vi.mock('../pages/PartnershipHub', () => ({ PartnershipHub: () => <div>Partnership Hub Page</div> }));
vi.mock('../pages/ProfileSetup', () => ({ ProfileSetup: () => <div>Profile Setup Page</div> }));
vi.mock('../components/ProfileReview', () => ({ ProfileReview: () => <div>Profile Review Page</div> }));
vi.mock('../pages/FreelancerHub', () => ({ default: () => <div>Freelancer Hub Page</div> }));
vi.mock('../pages/PrivacyPolicy', () => ({ default: () => <div>Privacy Policy Page</div> }));
vi.mock('../pages/TermsOfService', () => ({ default: () => <div>Terms Of Service Page</div> }));
vi.mock('../pages/Messages', () => ({ default: () => <div>Messages Page</div> }));
vi.mock('../pages/admin/AuditLog', () => ({ default: () => <div>Audit Log Page</div> }));

const routes = [
  { path: '/', text: 'Home Page' },
  { path: '/marketplace', text: 'Marketplace Page' },
  { path: '/freelancer-hub', text: 'Freelancer Hub Page' },
  { path: '/resources', text: 'Resources Page' },
  { path: '/signin', text: 'Sign In Page' },
  { path: '/get-started', text: 'Get Started Page' },
  { path: '/profile-setup', text: 'Profile Setup Page' },
  { path: '/profile-review', text: 'Profile Review Page' },
  { path: '/subscription-plans', text: 'Subscription Plans Page' },
  { path: '/partnership-hub', text: 'Partnership Hub Page' },
  { path: '/privacy-policy', text: 'Privacy Policy Page' },
  { path: '/terms-of-service', text: 'Terms Of Service Page' },
  { path: '/messages', text: 'Messages Page' },
  { path: '/admin/audit-log', text: 'Audit Log Page' },
];

describe('AppRoutes', () => {
  it.each(routes)('renders %s', ({ path, text }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('renders NotFound for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });
});
