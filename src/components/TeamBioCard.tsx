import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  image?: string;
}

interface TeamBioCardProps {
  member: TeamMember;
  className?: string;
}

export function TeamBioCard({ member, className }: TeamBioCardProps) {
  return (
    <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className || ''}`}>
      <CardHeader className="text-center pb-4">
        <img
          src={member.image || "/placeholder.svg"}
          alt={`${member.name} profile picture`}
          loading="lazy"
          decoding="async"
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
        />
        <CardTitle className="text-xl text-gray-900">{member.name}</CardTitle>
        <p className="text-gray-600 font-medium">{member.title}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {member.bio}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center">
            <span className="mr-2" aria-label="Email">📧</span>
            <a 
              href={`mailto:${member.email}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              aria-label={`Send email to ${member.name}`}
            >
              {member.email}
            </a>
          </p>
          <p className="flex items-center">
            <span className="mr-2" aria-label="Phone">📱</span>
            <a 
              href={`tel:${member.phone}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              aria-label={`Call ${member.name}`}
            >
              {member.phone}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}