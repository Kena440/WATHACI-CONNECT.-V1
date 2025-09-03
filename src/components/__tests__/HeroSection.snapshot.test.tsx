import { render } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
