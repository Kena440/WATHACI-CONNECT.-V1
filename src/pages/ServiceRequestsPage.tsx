import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import ServiceRequests from '@/components/ServiceRequests';

const ServiceRequestsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Service Requests</h1>
        <p className="text-gray-600 mb-8">
          Post your service requirements and get matched with qualified freelancers using our AI-powered matching system.
        </p>
        <ServiceRequests />
      </div>
    </AppLayout>
  );
};

export default ServiceRequestsPage;