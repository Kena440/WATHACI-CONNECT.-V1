import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BackendTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [hashResult, setHashResult] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/test');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestResult(data);
      toast.success("Successfully connected to Express backend!");
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error("Failed to connect to backend. Make sure the server is running on port 3001.");
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordHashing = async () => {
    if (!password.trim()) {
      toast.error("Please enter a password to hash");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setHashResult(data);
      toast.success("Password hashed successfully!");
    } catch (error) {
      console.error('Hashing failed:', error);
      toast.error("Failed to hash password");
      setHashResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backend Connection Test</CardTitle>
          <CardDescription>
            Test the connection between React frontend and Express backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test Backend Connection"}
          </Button>
          
          {testResult && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <h4 className="font-semibold mb-2">Connection Result:</h4>
              <pre className="text-sm">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Hashing Test</CardTitle>
          <CardDescription>
            Test the password hashing functionality from the frontend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to hash"
            />
          </div>
          
          <Button onClick={testPasswordHashing} disabled={isLoading || !password.trim()}>
            {isLoading ? "Hashing..." : "Hash Password"}
          </Button>
          
          {hashResult && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <h4 className="font-semibold mb-2">Hash Result:</h4>
              <pre className="text-sm break-all">{JSON.stringify(hashResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendTest;