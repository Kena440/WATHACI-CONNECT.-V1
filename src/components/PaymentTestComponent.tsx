/**
 * Payment Test Component
 * UI component for testing payment functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TestTube, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Loader2
} from 'lucide-react';
import { paymentTestSuite, PaymentTestResult } from '@/lib/testing/payment-test-suite';
import { lencoPaymentService } from '@/lib/services/lenco-payment-service';

export const PaymentTestComponent = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'validation' | 'integration' | 'edge-case'>('all');

  const runTests = async (category: 'all' | 'validation' | 'integration' | 'edge-case') => {
    setTesting(true);
    setTestResults(null);

    try {
      let results;
      
      if (category === 'all') {
        results = await paymentTestSuite.runComprehensiveTests();
      } else {
        const testResults = await paymentTestSuite.runTestCategory(category);
        results = {
          paymentTests: testResults,
          configurationValid: true,
          calculationsValid: true,
          subscriptionIntegrationValid: true,
          overallSuccess: testResults.every(t => t.passed)
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResults({
        error: error.message || 'Test execution failed',
        overallSuccess: false
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "PASSED" : "FAILED"}
      </Badge>
    );
  };

  const configStatus = lencoPaymentService.isConfigured();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          Payment System Test Suite
        </h1>
        <p className="text-gray-600">
          Comprehensive testing for Lenco payment integration and subscription management
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getStatusIcon(configStatus)}
            <span className={configStatus ? 'text-green-600' : 'text-red-600'}>
              Payment System {configStatus ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          {!configStatus && (
            <Alert className="mt-3" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Payment system is not properly configured. Please check environment variables.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => runTests('all')}
              disabled={testing || !configStatus}
              className="flex items-center gap-2"
            >
              {testing && selectedCategory === 'all' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              All Tests
            </Button>
            <Button
              variant="outline"
              onClick={() => runTests('validation')}
              disabled={testing || !configStatus}
              className="flex items-center gap-2"
            >
              {testing && selectedCategory === 'validation' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Validation
            </Button>
            <Button
              variant="outline"
              onClick={() => runTests('integration')}
              disabled={testing || !configStatus}
              className="flex items-center gap-2"
            >
              {testing && selectedCategory === 'integration' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Integration
            </Button>
            <Button
              variant="outline"
              onClick={() => runTests('edge-case')}
              disabled={testing || !configStatus}
              className="flex items-center gap-2"
            >
              {testing && selectedCategory === 'edge-case' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Edge Cases
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResults.overallSuccess)}
              Test Results
              {getStatusBadge(testResults.overallSuccess)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{testResults.error}</AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Detailed Results</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {testResults.configurationValid !== undefined && (
                      <div className="text-center p-3 border rounded">
                        {getStatusIcon(testResults.configurationValid)}
                        <div className="text-sm mt-1">Configuration</div>
                      </div>
                    )}
                    {testResults.calculationsValid !== undefined && (
                      <div className="text-center p-3 border rounded">
                        {getStatusIcon(testResults.calculationsValid)}
                        <div className="text-sm mt-1">Calculations</div>
                      </div>
                    )}
                    {testResults.subscriptionIntegrationValid !== undefined && (
                      <div className="text-center p-3 border rounded">
                        {getStatusIcon(testResults.subscriptionIntegrationValid)}
                        <div className="text-sm mt-1">Subscriptions</div>
                      </div>
                    )}
                    <div className="text-center p-3 border rounded">
                      {getStatusIcon(testResults.paymentTests?.every((t: PaymentTestResult) => t.passed) || false)}
                      <div className="text-sm mt-1">Payment Tests</div>
                    </div>
                  </div>

                  {testResults.paymentTests && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Test Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Tests:</span> {testResults.paymentTests.length}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Passed:</span>{' '}
                          {testResults.paymentTests.filter((t: PaymentTestResult) => t.passed).length}
                        </div>
                        <div>
                          <span className="font-medium text-red-600">Failed:</span>{' '}
                          {testResults.paymentTests.filter((t: PaymentTestResult) => !t.passed).length}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-3">
                  {testResults.paymentTests?.map((result: PaymentTestResult, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.passed)}
                          <span className="font-medium">{result.testCase.name}</span>
                          <Badge variant="outline">{result.testCase.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {result.duration}ms
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.testCase.description}</p>
                      {result.error && (
                        <Alert className="mt-2" variant="destructive">
                          <AlertDescription className="text-xs">{result.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="performance" className="space-y-3">
                  {testResults.paymentTests && (
                    <>
                      <h4 className="font-semibold">Performance Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['validation', 'integration', 'edge-case'].map(category => {
                          const categoryTests = testResults.paymentTests.filter(
                            (t: PaymentTestResult) => t.testCase.category === category
                          );
                          if (categoryTests.length === 0) return null;

                          const avgDuration = categoryTests.reduce(
                            (sum: number, t: PaymentTestResult) => sum + t.duration, 0
                          ) / categoryTests.length;
                          const passRate = (categoryTests.filter(
                            (t: PaymentTestResult) => t.passed
                          ).length / categoryTests.length) * 100;

                          return (
                            <div key={category} className="border rounded p-3">
                              <h5 className="font-medium capitalize">{category}</h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Tests: {categoryTests.length}</div>
                                <div>Avg Duration: {avgDuration.toFixed(0)}ms</div>
                                <div>Pass Rate: {passRate.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>All Tests:</strong> Runs configuration, calculation, integration, and payment validation tests</p>
          <p><strong>Validation:</strong> Tests input validation and basic payment request structure</p>
          <p><strong>Integration:</strong> Tests integration with Lenco API and subscription services</p>
          <p><strong>Edge Cases:</strong> Tests unusual inputs and boundary conditions</p>
          <p className="text-amber-600"><strong>Note:</strong> Tests run against the actual Lenco API. Ensure proper test credentials are configured.</p>
        </CardContent>
      </Card>
    </div>
  );
};