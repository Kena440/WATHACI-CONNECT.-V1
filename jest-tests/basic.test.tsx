import { render, screen } from '@testing-library/react';
import React from 'react';

describe('basic react rendering', () => {
  it('shows greeting', () => {
    const Hello = () => <div>Hello</div>;
    render(<Hello />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
