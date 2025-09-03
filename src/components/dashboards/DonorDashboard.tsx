import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImpactDashboard from '@/components/tools/ImpactDashboard';
import SMEDirectory from '@/components/investor/SMEDirectory';
import InterestTracker from '@/components/investor/InterestTracker';
import CoInvestmentHub from '@/components/investor/CoInvestmentHub';
import { Heart, FileText, BarChart3, Users, Building, TrendingUp } from 'lucide-react';

const DonorDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Investor & Donor Dashboard</h1>
        <Button>
          <Heart className="w-4 h-4 mr-2" />
          Make Donation
        </Button>
      </div>

      <Tabs defaultValue="smes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="smes">SME Directory</TabsTrigger>
          <TabsTrigger value="interests">My Interests</TabsTrigger>
          <TabsTrigger value="coinvest">Co-Investments</TabsTrigger>
          <TabsTrigger value="impact">Impact Metrics</TabsTrigger>
          <TabsTrigger value="projects">Active Projects</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="smes">
          <SMEDirectory />
        </TabsContent>

        <TabsContent value="interests">
          <InterestTracker />
        </TabsContent>

        <TabsContent value="coinvest">
          <CoInvestmentHub />
        </TabsContent>

        <TabsContent value="impact">
          <ImpactDashboard />
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid gap-4">
            {[
              { name: 'Youth Skills Development', funded: 75000, target: 100000, beneficiaries: 150 },
              { name: 'Women in Agriculture', funded: 45000, target: 60000, beneficiaries: 89 },
              { name: 'Digital Literacy Program', funded: 30000, target: 40000, beneficiaries: 200 }
            ].map((project, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    {project.name}
                    <span className="text-sm text-gray-500">{project.beneficiaries} beneficiaries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span>K{project.funded.toLocaleString()} funded</span>
                    <span>K{project.target.toLocaleString()} target</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(project.funded / project.target) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Transparency Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Q4 2024 Impact Report', date: 'Dec 2024', type: 'Impact' },
                  { title: 'Financial Transparency Report', date: 'Nov 2024', type: 'Financial' },
                  { title: 'Project Outcomes Summary', date: 'Oct 2024', type: 'Projects' }
                ].map((report, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorDashboard;