import { useState, useEffect, useCallback, FormEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { serviceRequestService } from '@/lib/services';
import { useAppContext } from '@/contexts/AppContext';
import type { ServiceRequest } from '@/@types/database';

const ServiceRequests = () => {
  const { user } = useAppContext();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [willingToPay, setWillingToPay] = useState(false);
  const [budget, setBudget] = useState('');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data, error } = await serviceRequestService.getRequestsByUser(user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      setRequests(data);
    }
  }, [user, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkills('');
    setWillingToPay(false);
    setBudget('');
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      user_id: user.id,
      title,
      description,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      willing_to_pay: willingToPay,
      budget: willingToPay ? Number(budget) : undefined,
    };

    const result = editingId
      ? await serviceRequestService.updateRequest(editingId, payload)
      : await serviceRequestService.createRequest(payload);

    if (result.error) {
      toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: editingId ? 'Request updated.' : 'Request submitted.' });
      resetForm();
      loadRequests();
    }
  };

  const handleEdit = (request: ServiceRequest) => {
    setEditingId(request.id);
    setTitle(request.title);
    setDescription(request.description);
    setSkills(request.skills.join(', '));
    setWillingToPay(request.willing_to_pay);
    setBudget(request.budget?.toString() || '');
  };

  const handleDelete = async (id: string) => {
    const { error } = await serviceRequestService.deleteRequest(id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Request removed.' });
      loadRequests();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Service Requests</h1>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <Input
            placeholder="Service title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Detailed description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            placeholder="Required skills or tags (comma separated)"
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Switch checked={willingToPay} onCheckedChange={setWillingToPay} id="pay-switch" />
            <label htmlFor="pay-switch">Willing to pay</label>
          </div>
          {willingToPay && (
            <Input
              type="number"
              placeholder="Budget"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          )}
          <Button type="submit">{editingId ? 'Update Request' : 'Submit Request'}</Button>
        </form>

        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{req.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                  <p className="text-sm text-gray-600">Skills: {req.skills.join(', ')}</p>
                  {req.willing_to_pay && (
                    <p className="text-sm text-gray-600">Budget: {req.budget}</p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(req)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(req.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-gray-600">No requests submitted yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceRequests;
