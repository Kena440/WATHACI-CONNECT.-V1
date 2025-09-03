import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { createRequest, listRequests } from '@/lib/services';
import type { ServiceRequest } from '@/@types/database';
import { supabase } from '@/lib/supabase';
import ServiceRequestCard from '@/components/marketplace/ServiceRequestCard';
import SuggestedFreelancers from '@/components/marketplace/SuggestedFreelancers';

const ServiceRequests = () => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [budget, setBudget] = useState('');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    const { data } = await listRequests();
    if (data) setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data } = await createRequest({
      user_id: user?.id || 'anonymous',
      title,
      description,
      is_paid: isPaid,
      budget: isPaid ? Number(budget) : undefined,
    });

    if (data) {
      await loadRequests();
      const { data: matchData } = await supabase.functions.invoke('service-request-matcher', {
        body: {
          title,
          description,
          is_paid: isPaid,
          budget: isPaid ? Number(budget) : undefined,
        },
      });
      setSuggestions(matchData?.freelancers || []);
      setTitle('');
      setDescription('');
      setBudget('');
      setIsPaid(false);
    }

    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-16 mb-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Service Requests</h1>
            <p className="text-lg">
              Let the community know what services you need and get matched with freelancers
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 space-y-12 pb-12">
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
            <Input
              placeholder="Request title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Describe the service you need"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            <div className="flex items-center space-x-2">
              <Switch id="isPaid" checked={isPaid} onCheckedChange={setIsPaid} />
              <Label htmlFor="isPaid">Willing to pay</Label>
            </div>
            {isPaid && (
              <Input
                type="number"
                placeholder="Budget (ZMW)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>

          {suggestions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Suggested Freelancers</h2>
              <SuggestedFreelancers freelancers={suggestions} />
            </div>
          )}

          {requests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Requests</h2>
              <div className="space-y-4">
                {requests.map((req) => (
                  <ServiceRequestCard key={req.id} {...req} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceRequests;
