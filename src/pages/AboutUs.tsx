import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
    </div>
  );
}

