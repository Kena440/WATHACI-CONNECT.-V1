import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin } from "lucide-react";

export default function AboutUs() {
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
        <CardContent className="space-y-4 text-sm">
          <p>
            Kasamwa Kachomba is a seasoned economist and contracts specialist known for steering
            complex donor-funded initiatives with precision. As Lead Consultant, he blends sharp
            analytical insight with hands-on project management, ensuring compliance, fostering
            stakeholder relationships, and unlocking funding for SMEs and institutions. His
            strengths include proposal development, donor engagement, team leadership, and
            establishing robust systems that drive sustainable growth. Passionate about empowering
            businesses, Kasamwa is committed to building strategic partnerships and delivering
            measurable impact.
          </p>
          <p>
            📧 kasamwa@wathaci.com
            <br />📱 +260 964 283 538
            <br />
            <a
              href="https://www.linkedin.com/in/kasamwa-kachomba/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline mt-2"
            >
              <Linkedin className="w-4 h-4 mr-1" />
              LinkedIn
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

