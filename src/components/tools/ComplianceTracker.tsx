import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  status: 'completed' | 'pending' | 'overdue';
  dueDate: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const ComplianceTracker = () => {
  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      title: 'PACRA Annual Return',
      status: 'completed',
      dueDate: '2024-03-31',
      description: 'Submit annual return to PACRA',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Tax Return Filing',
      status: 'pending',
      dueDate: '2024-06-30',
      description: 'File corporate tax return with ZRA',
      priority: 'high'
    },
    {
      id: '3',
      title: 'VAT Registration',
      status: 'overdue',
      dueDate: '2024-01-15',
      description: 'Register for VAT with ZRA',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Workers Compensation',
      status: 'pending',
      dueDate: '2024-12-31',
      description: 'Renew workers compensation insurance',
      priority: 'low'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const completedItems = complianceItems.filter(item => item.status === 'completed').length;
  const completionRate = (completedItems / complianceItems.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {complianceItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {complianceItems.filter(item => item.status === 'overdue').length}
              </div>
              <div className="text-xs text-gray-500">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {complianceItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.priority === 'high' ? 'border-red-200 text-red-700' :
                          item.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-gray-200 text-gray-700'
                        }`}
                      >
                        {item.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  {item.status !== 'completed' && (
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      Action
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplianceTracker;