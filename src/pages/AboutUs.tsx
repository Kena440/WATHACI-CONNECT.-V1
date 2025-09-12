import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamBioCard, type TeamMember } from "@/components/TeamBioCard";

export default function AboutUs() {
  const teamMembers: TeamMember[] = [
    {
      name: "Kasamwa Kachomba",
      title: "Lead Consultant",
      bio: "Kasamwa Kachomba is a seasoned economist and contracts specialist known for steering complex donor-funded initiatives with precision. As Lead Consultant, he blends sharp analytical insight with hands-on project management, ensuring compliance, fostering stakeholder relationships, and unlocking funding for SMEs and institutions. His strengths include proposal development, donor engagement, team leadership, and establishing robust systems that drive sustainable growth. Passionate about empowering businesses, Kasamwa is committed to building strategic partnerships and delivering measurable impact.",
      email: "kasamwa@wathaci.com",
      phone: "+260 964 283 538",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">About Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            WATHACI CONNECT empowers entrepreneurs and organizations by linking them with the
            resources, partners, and funding needed to grow their impact across Zambia.
          </p>
          <p>
            Our platform fosters collaboration and innovation through AI-powered matching tools,
            comprehensive business resources, and a vibrant community of stakeholders.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Our Team</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {teamMembers.map((member, idx) => (
            <TeamBioCard key={idx} member={member} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

