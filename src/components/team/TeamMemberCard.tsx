import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TeamMemberCardProps {
  avatarUrl: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  onClick?: () => void;
  onBadgeClick?: (badge: string) => void;
}

export const TeamMemberCard = ({
  avatarUrl,
  name,
  role,
  bio,
  expertise,
  onClick,
  onBadgeClick
}: TeamMemberCardProps) => {
  return (
    <Card
      className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-col items-center space-y-4">
        <Avatar size="xl">
          <AvatarImage src={avatarUrl} alt={name} loading="lazy" decoding="async" />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{bio}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {expertise.map((skill) => (
            <Badge
              key={skill}
              variant="info"
              onClick={(e) => {
                e.stopPropagation();
                onBadgeClick?.(skill);
              }}
              className="cursor-pointer"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
