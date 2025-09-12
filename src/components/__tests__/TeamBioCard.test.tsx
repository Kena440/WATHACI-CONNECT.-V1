import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import { TeamBioCard } from '../TeamBioCard';

const mockTeamMember = {
  name: "John Doe",
  title: "Senior Developer",
  bio: "John is a seasoned developer with expertise in React and TypeScript.",
  email: "john@example.com",
  phone: "+1 234 567 8900",
  image: "/john-doe.jpg"
};

describe('TeamBioCard', () => {
  it('renders team member information correctly', () => {
    render(<TeamBioCard member={mockTeamMember} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText(/John is a seasoned developer/)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8900')).toBeInTheDocument();
  });

  it('renders email and phone as clickable links', () => {
    render(<TeamBioCard member={mockTeamMember} />);
    
    const emailLink = screen.getByLabelText('Send email to John Doe');
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
    
    const phoneLink = screen.getByLabelText('Call John Doe');
    expect(phoneLink).toHaveAttribute('href', 'tel:+1 234 567 8900');
  });

  it('uses placeholder image when no image provided', () => {
    const memberWithoutImage = { ...mockTeamMember, image: undefined };
    render(<TeamBioCard member={memberWithoutImage} />);
    
    const image = screen.getByAltText('John Doe profile picture');
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<TeamBioCard member={mockTeamMember} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});