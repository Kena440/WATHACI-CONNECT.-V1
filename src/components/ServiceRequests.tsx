import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  skills: string[];
  location: string;
  profile_image_url?: string;
  match_score: number;
}

export const ServiceRequests: React.FC = () => {
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Freelancer[]>([]);

  const submitRequest = async () => {
    if (!description.trim() || !skills.trim()) {
      alert('Please provide a description and required skills');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

      const { data: request, error: insertError } = await supabase
        .from('service_requests')
        .insert({ description, skills: skillsArray, location })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data, error } = await supabase.functions.invoke('service-request-matcher', {
        body: { skills: skillsArray, location }
      });

      if (error) throw error;

      const freelancers: Freelancer[] = data.freelancers || [];
      setMatches(freelancers);
      logger.info('Service request matches', freelancers, 'ServiceRequests');

      if (freelancers.length > 0) {
        try {
          const notifications = freelancers.map(f => ({
            recipient_id: f.id,
            type: 'service_request_match',
            title: 'New Service Request Match',
            message: description,
            data: { request_id: request.id },
          }));
          await supabase.from('notifications').insert(notifications);
        } catch (notifyError) {
          logger.error('Error sending notifications', notifyError, 'ServiceRequests');
        }
      }
    } catch (err) {
      logger.error('Error submitting service request', err, 'ServiceRequests');
      alert('Failed to submit service request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post a Service Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the service you need..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Input
            placeholder="Required skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <Input
            placeholder="Preferred location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button onClick={submitRequest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recommended Freelancers</h2>
          {matches.map((freelancer) => (
            <Card key={freelancer.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={freelancer.profile_image_url} alt={freelancer.name} />
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      {freelancer.skills?.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      {freelancer.location}
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">Contact Freelancer</Button>
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

export default ServiceRequests;
