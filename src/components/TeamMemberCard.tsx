import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export const TeamMemberCard = ({ member }: TeamMemberCardProps) => (
  <Card className="flex flex-col items-center text-center">
    <CardHeader className="flex flex-col items-center">
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src={member.avatar_url} alt={member.name} />
        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <CardTitle>{member.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{member.role}</p>
    </CardHeader>
    {member.bio && (
      <CardContent>
        <p className="text-sm">{member.bio}</p>
      </CardContent>
    )}
  </Card>
);

export default TeamMemberCard;

