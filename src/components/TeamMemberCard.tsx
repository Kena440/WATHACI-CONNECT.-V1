import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, Clock } from 'lucide-react';
import PriceNegotiation from '@/components/PriceNegotiation';
import { Link } from 'react-router-dom';

const DEBUG = import.meta.env.DEV;

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  skills: string[];
  hourly_rate: number;
  currency: string;
  location: string;
  rating: number;
  reviews_count: number;
  profile_image_url?: string;
  availability_status: string;
}

interface TeamMemberCardProps {
  freelancer: TeamMember;
}

export const TeamMemberCard = ({ freelancer }: TeamMemberCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <img
          src={freelancer.profile_image_url || '/placeholder.svg'}
          alt={freelancer.name}
          loading="lazy"
          decoding="async"
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
        />
        <CardTitle className="text-xl">{freelancer.name}</CardTitle>
        <p className="text-gray-600">{freelancer.title}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-semibold">{freelancer.rating}</span>
            <span className="text-gray-500">({freelancer.reviews_count})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{freelancer.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {freelancer.skills.slice(0, 3).map((skill) => (
              <div key={skill} className="flex gap-1">
                <Link to={`/marketplace?skill=${encodeURIComponent(skill)}`}>
                  <Badge variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                </Link>
                <Link to={`/freelancer-hub?skill=${encodeURIComponent(skill)}`}>
                  <Badge variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                </Link>
              </div>
            ))}
            {freelancer.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{freelancer.skills.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">${freelancer.hourly_rate}</span>
            <span className="text-gray-500">/hour</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span
              className={`text-sm ${freelancer.availability_status === 'available' ? 'text-green-600' : 'text-orange-600'}`}
            >
              {freelancer.availability_status === 'available' ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={freelancer.availability_status !== 'available'}
            >
              {freelancer.availability_status === 'available' ? 'Hire & Negotiate' : 'Join Waitlist'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <PriceNegotiation
              initialPrice={freelancer.hourly_rate}
              serviceTitle={`${freelancer.name} - ${freelancer.title}`}
              providerId={freelancer.id.toString()}
              onNegotiationComplete={(finalPrice) => {
                if (DEBUG) console.log(`Negotiation complete: $${finalPrice}`);
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
