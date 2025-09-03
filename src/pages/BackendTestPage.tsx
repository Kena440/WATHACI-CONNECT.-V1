import React from 'react';
import AppLayout from '@/components/AppLayout';
import BackendTest from '@/components/BackendTest';

const BackendTestPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Backend Integration Test
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            This page demonstrates the connection between the React frontend and Express backend.
          </p>
          <BackendTest />
        </div>
      </div>
    </AppLayout>
  );
};

export default BackendTestPage;