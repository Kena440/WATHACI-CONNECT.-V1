import { useEffect } from 'react';

const TestError = () => {
  useEffect(() => {
    // Throw an error to test the ErrorBoundary
    throw new Error('This is a test error to demonstrate ErrorBoundary functionality');
  }, []);

  return (
    <div>
      <h1>Test Error Page</h1>
      <p>This page should trigger the ErrorBoundary.</p>
    </div>
  );
};

export default TestError;