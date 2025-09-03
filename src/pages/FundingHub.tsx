import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { FundingHub as FundingHubComponent } from '@/components/funding/FundingHub';
import { FundingMatcher } from '@/components/funding/FundingMatcher';
import LiveFundingMatcher from '@/components/funding/LiveFundingMatcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FundingHub = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Funding Hub</h1>
          <p className="text-gray-600">
            Discover live funding opportunities and get matched with expert professionals using advanced AI
          </p>
        </div>

        <Tabs defaultValue="live-matcher" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matcher">AI Matcher</TabsTrigger>
            <TabsTrigger value="live-matcher">Live Opportunities</TabsTrigger>
            <TabsTrigger value="ai-analyzer">AI Analyzer</TabsTrigger>
            <TabsTrigger value="discovery">Discovery Hub</TabsTrigger>
          </TabsList>

          <TabsContent value="matcher">
            <FundingMatcher />
          </TabsContent>

          <TabsContent value="live-matcher">
            <LiveFundingMatcher />
          </TabsContent>

          <TabsContent value="ai-analyzer">
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">AI Analyzer Coming Soon</h3>
              <p className="text-gray-600">Advanced AI analysis features will be available soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="discovery">
            <FundingHubComponent />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FundingHub;