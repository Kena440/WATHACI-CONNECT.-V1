import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MapPin, DollarSign, Star, Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Freelancer {
  avatar?: string;
  name?: string;
  title?: string;
  match_score?: number;
  bio?: string;
  skills?: string[];
  location?: string;
  hourly_rate?: number;
  rating?: number;
  reviews_count?: number;
}

export const FreelancerMatcher = () => {
  const [projectRequirements, setProjectRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [matches, setMatches] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!projectRequirements || !skills) {
      alert('Please describe your project and required skills');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const response = await fetch('/openai-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDescription: projectRequirements,
          skills: skillsArray,
          budget: budget ? parseInt(budget) : undefined,
          location
        })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      logger.error('Error matching freelancers', error, 'FreelancerMatcher');
      alert('Error finding matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find the Perfect Freelancer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your project requirements..."
            value={projectRequirements}
            onChange={(e) => setProjectRequirements(e.target.value)}
            rows={3}
          />
          
          <Input
            placeholder="Required skills (comma separated, e.g., React, Node.js, Design)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Budget per hour (ZMW)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            
            <Input
              placeholder="Preferred location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Button onClick={handleMatch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Freelancers...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Freelancers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Matched Freelancers</h2>
          {matches.map((freelancer: Freelancer, idx: number) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                    <AvatarFallback>{freelancer.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                        <p className="text-gray-600">{freelancer.title}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {freelancer.match_score}% Match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{freelancer.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {freelancer.skills?.slice(0, 5).map((skill: string, skillIdx: number) => (
                        <Badge key={skillIdx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {freelancer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ZMW {freelancer.hourly_rate}/hour
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {freelancer.rating} ({freelancer.reviews_count} reviews)
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">Contact Freelancer</Button>
                      <Button variant="outline">View Profile</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};