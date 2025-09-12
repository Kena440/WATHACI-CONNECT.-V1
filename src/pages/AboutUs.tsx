import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMember {
  name: string;
  title: string;
  bio: string[];
  contact?: string[];
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex flex-col items-center space-y-2">
          <img
            src={photo || "/placeholder.svg"}
            alt={`${member.name} profile`}
            className="h-32 w-32 rounded-full object-cover"
          />
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>
        <p className="font-bold">{member.name}</p>
        <p className="font-bold">{member.title}</p>
        {member.bio.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
        {member.contact?.map((info, idx) => (
          <p key={idx}>{info}</p>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AboutUs() {
  const teamMembers: TeamMember[] = [
    {
      name: "Amukena Mukumbuta",
      title: "Team Lead",
      bio: [
        "Amukena Mukumbuta, Team Lead, is a results-driven SME champion with 15+ years’ experience in operations, compliance, and donor-funded project management. Kena has overseen £2M+ SME-focused programmes, cutting compliance risks and building systems that help entrepreneurs thrive.",
        "Kena is passionate about unlocking growth for SMEs through practical support—whether it’s compliance guidance, access to finance, or digital transformation. Beyond his corporate role, he leads Wathaci Corporate Services and 440 A.M. Enterprises, platforms designed to equip Zambian SMEs with the tools, networks, and strategies they need to scale sustainably."
      ]
    },
    {
      name: "Kasamwa Kachomba",
      title: "Lead Consultant",
      bio: [
        "Kasamwa Kachomba is a seasoned economist and contracts specialist known for steering complex donor-funded initiatives with precision. As Lead Consultant, he blends sharp analytical insight with hands-on project management, ensuring compliance, fostering stakeholder relationships, and unlocking funding for SMEs and institutions. His strengths include proposal development, donor engagement, team leadership, and establishing robust systems that drive sustainable growth. Passionate about empowering businesses, Kasamwa is committed to building strategic partnerships and delivering measurable impact."
      ],
      contact: ["📧 kasamwa@wathaci.com", "📱 +260 964 283 538"]
    }
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
        <CardContent className="grid gap-4">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

