import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  title: string;
  description: string;
  is_paid: boolean;
  budget?: number;
}

export const ServiceRequestCard = ({ title, description, is_paid, budget }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">{description}</p>
        <div>
          {is_paid ? (
            <Badge variant="outline">Budget: ZMW {budget}</Badge>
          ) : (
            <Badge variant="secondary">Unpaid</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestCard;
