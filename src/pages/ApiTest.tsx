import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';

export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test health endpoint
      const health = await apiClient.healthCheck();
      setHealthStatus(health);

      // Test API info
      const infoResponse = await fetch('/api/v1');
      const info = await infoResponse.json();
      setApiInfo(info);

      // Test marketplace categories
      const categoriesResponse = await apiClient.getMarketplaceCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Test marketplace stats
      const statsResponse = await apiClient.getMarketplaceStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Backend API Integration Test</h1>
        <p className="text-muted-foreground">
          Testing the connection between frontend and backend API
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={testApiConnection} disabled={loading}>
          {loading ? 'Testing Connection...' : 'Refresh API Test'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>Backend server health status</CardDescription>
          </CardHeader>
          <CardContent>
            {healthStatus ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={healthStatus.status === 'ok' ? 'default' : 'destructive'}>
                    {healthStatus.status}
                  </Badge>
                  {healthStatus.supabase_connected && (
                    <Badge variant="secondary">Supabase Connected</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{healthStatus.message}</p>
                <p className="text-xs text-muted-foreground">
                  {healthStatus.timestamp && new Date(healthStatus.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Testing connection...</p>
            )}
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
            <CardDescription>Backend API details</CardDescription>
          </CardHeader>
          <CardContent>
            {apiInfo ? (
              <div className="space-y-2">
                <h4 className="font-medium">{apiInfo.name}</h4>
                <p className="text-sm">Version: {apiInfo.version}</p>
                <p className="text-sm text-muted-foreground">{apiInfo.description}</p>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Available Endpoints:</p>
                  {apiInfo.endpoints && Object.entries(apiInfo.endpoints).map(([key, value]) => (
                    <p key={key} className="text-xs text-muted-foreground">
                      {key}: {value as string}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading API info...</p>
            )}
          </CardContent>
        </Card>

        {/* Marketplace Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Categories</CardTitle>
            <CardDescription>Available service categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categories ? (
              <div className="space-y-2">
                {categories.categories.map((category: any) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading categories...</p>
            )}
          </CardContent>
        </Card>

        {/* Marketplace Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Statistics</CardTitle>
            <CardDescription>Platform metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-2">
                {Object.entries(stats.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                    <Badge variant="secondary">{value as string}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading stats...</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            ✅ Backend API server running on port 3001
          </p>
          <p className="text-sm">
            ✅ Frontend proxy configured to route /api requests to backend
          </p>
          <p className="text-sm">
            ✅ API client utility created for easy backend communication
          </p>
          <p className="text-sm">
            ✅ Supabase integration maintained for existing functionality
          </p>
          <p className="text-sm">
            ✅ RESTful API endpoints for auth, profiles, users, and marketplace
          </p>
        </CardContent>
      </Card>
    </div>
  );
}