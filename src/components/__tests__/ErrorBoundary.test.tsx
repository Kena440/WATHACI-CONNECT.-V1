import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { logger } from '@/utils/logger';

jest.mock('@/utils/logger', () => ({
  logger: { error: jest.fn() },
}));

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('displays fallback message and logs error', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('Something went wrong.')
    ).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
