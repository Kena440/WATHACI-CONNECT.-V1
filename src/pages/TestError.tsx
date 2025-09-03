import React from 'react';

const TestError: React.FC = () => {
  throw new Error('Test error');
};

export default TestError;
