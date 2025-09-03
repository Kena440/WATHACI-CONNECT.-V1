import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Freelancer {
  id: string;
  name: string;
  title?: string;
  match_score?: number;
  avatar?: string;
}

interface Props {
  freelancers: Freelancer[];
}

export const SuggestedFreelancers = ({ freelancers }: Props) => {
  if (!freelancers.length) return null;
  return (
    <div className="space-y-4">
      {freelancers.map((freelancer) => (
        <Card key={freelancer.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                    {freelancer.title && (
                      <p className="text-gray-600">{freelancer.title}</p>
                    )}
                  </div>
                  {freelancer.match_score !== undefined && (
                    <Badge className="bg-green-100 text-green-800">
                      {freelancer.match_score}% Match
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">Contact Freelancer</Button>
                  <Button variant="outline">View Profile</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SuggestedFreelancers;
