# TeamBioCard Component

## Overview

The `TeamBioCard` component is a reusable React component designed to display team member information in a clean, accessible, and visually appealing card format. It was created to resolve conflicts between different bio card implementations and provides a consistent, maintainable solution for displaying team member profiles across the application.

## Features

- **Clean, Modern Design**: Simple yet professional appearance with subtle hover effects
- **Full Accessibility**: WCAG compliant with proper ARIA labels and semantic HTML
- **Contact Links**: Clickable email and phone links with accessibility labels
- **Responsive Layout**: Works well on all screen sizes
- **Customizable**: Accepts optional className prop for styling customization
- **TypeScript Support**: Fully typed with exported interfaces

## Usage

```tsx
import { TeamBioCard, type TeamMember } from "@/components/TeamBioCard";

const teamMember: TeamMember = {
  name: "John Doe",
  title: "Senior Developer", 
  bio: "John is a seasoned developer with expertise in React and TypeScript.",
  email: "john@example.com",
  phone: "+1 234 567 8900",
  image: "/john-doe.jpg" // optional
};

function MyComponent() {
  return <TeamBioCard member={teamMember} />;
}
```

## Props

### TeamBioCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `member` | `TeamMember` | Yes | The team member data to display |
| `className` | `string` | No | Additional CSS classes for customization |

### TeamMember Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Full name of the team member |
| `title` | `string` | Yes | Job title or role |
| `bio` | `string` | Yes | Biography or description |
| `email` | `string` | Yes | Contact email address |
| `phone` | `string` | Yes | Contact phone number |
| `image` | `string` | No | Profile image URL (defaults to placeholder) |

## Accessibility Features

- **Semantic HTML**: Uses proper heading structure and card semantics
- **Alt Text**: Profile images have descriptive alt text
- **Contact Links**: Email and phone links have proper ARIA labels
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Friendly**: Proper labeling for assistive technologies

## Design Improvements

This component was created to resolve conflicts between complex bio card implementations by:

1. **Removing Complex Animations**: Eliminated heavy CSS animations and glossy effects that could impact performance
2. **Improving Accessibility**: Ensured all content is accessible without requiring hover interactions
3. **Standardizing Design**: Created a consistent design pattern that aligns with the overall design system
4. **Making it Reusable**: Extracted into a standalone component for use across the application

## Testing

The component includes comprehensive tests covering:

- Rendering of all team member information
- Accessibility compliance using jest-axe
- Proper linking behavior for email and phone
- Fallback behavior for missing images

Run tests with:
```bash
npm run test:jest -- --testPathPatterns="TeamBioCard"
```

## Browser Support

This component works in all modern browsers and follows React best practices for compatibility.