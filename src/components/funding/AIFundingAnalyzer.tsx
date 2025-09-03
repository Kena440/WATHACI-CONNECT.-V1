import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AnalysisResult {
  opportunityId: string;
  matchScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
  successProbability: number;
  timelineEstimate: string;
  requiredDocuments: string[];
}

export default function AIFundingAnalyzer() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAIAnalysis = async () => {
    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        opportunityId: 'afdb_2024_001',
        matchScore: 87,
        strengthAreas: [
          'Strong financial track record',
          'Clear market opportunity',
          'Experienced team',
          'Scalable business model'
        ],
        improvementAreas: [
          'Impact measurement framework',
          'Risk mitigation strategy',
          'Sustainability plan',
          'Partnership agreements'
        ],
        recommendations: [
          'Develop comprehensive impact metrics aligned with SDGs',
          'Create detailed financial projections for 5 years',
          'Establish partnerships with local organizations',
          'Prepare environmental impact assessment',
          'Obtain letters of support from beneficiaries'
        ],
        successProbability: 73,
        timelineEstimate: '4-6 months',
        requiredDocuments: [
          'Business registration certificate',
          'Audited financial statements (3 years)',
          'Tax compliance certificates',
          'Environmental impact assessment',
          'Board resolution',
          'Project implementation plan'
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Funding Application Analyzer
          </CardTitle>
          <p className="text-sm text-gray-600">
            Get AI-powered insights on your funding application readiness and success probability
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAIAnalysis} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Match Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analysis.matchScore}%
                    </div>
                    <Progress value={analysis.matchScore} className="mb-2" />
                    <p className="text-sm text-gray-600">Excellent match for this opportunity</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analysis.successProbability}%
                    </div>
                    <Progress value={analysis.successProbability} className="mb-2" />
                    <p className="text-sm text-gray-600">High chance of approval</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-orange-600">
                    {analysis.timelineEstimate}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    From application to approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Needs Preparation</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Address improvement areas before applying
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.strengthAreas.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex gap-3">
                        <Badge variant="outline" className="flex-shrink-0 mt-1">
                          {index + 1}
                        </Badge>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Documents Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}