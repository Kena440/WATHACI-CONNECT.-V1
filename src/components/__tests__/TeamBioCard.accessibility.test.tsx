import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import { TeamBioCard } from '../TeamBioCard';

const mockTeamMember = {
  name: "Jane Smith",
  title: "Lead Designer", 
  bio: "Jane is a creative designer with a passion for user experience and accessibility.",
  email: "jane@example.com",
  phone: "+1 555 123 4567"
};

describe('TeamBioCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<TeamBioCard member={mockTeamMember} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper alt text for profile image', () => {
    const { container } = render(<TeamBioCard member={mockTeamMember} />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', 'Jane Smith profile picture');
  });

  it('should have accessible contact links with proper labels', () => {
    const { container } = render(<TeamBioCard member={mockTeamMember} />);
    
    const emailLink = container.querySelector('a[href^="mailto:"]');
    expect(emailLink).toHaveAttribute('aria-label', 'Send email to Jane Smith');
    
    const phoneLink = container.querySelector('a[href^="tel:"]');
    expect(phoneLink).toHaveAttribute('aria-label', 'Call Jane Smith');
  });
});