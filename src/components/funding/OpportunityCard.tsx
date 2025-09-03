import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, MapPin, Clock } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    organization: string;
    amount: string;
    deadline: string;
    location: string;
    category: string;
    description: string;
    eligibility: string[];
    matchScore?: number;
  };
  onApply: (id: string) => void;
  onGetHelp: (id: string) => void;
}

export const OpportunityCard = ({ opportunity, onApply, onGetHelp }: OpportunityCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
            <p className="text-sm text-gray-600">{opportunity.organization}</p>
          </div>
          {opportunity.matchScore && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {opportunity.matchScore}% Match
            </Badge>
          )}
        </div>
        <Badge variant="outline">{opportunity.category}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>{opportunity.amount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Deadline: {opportunity.deadline}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span>{opportunity.location}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onApply(opportunity.id)} className="flex-1">
            Apply Now
          </Button>
          <Button variant="outline" onClick={() => onGetHelp(opportunity.id)} className="flex-1">
            Get Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};