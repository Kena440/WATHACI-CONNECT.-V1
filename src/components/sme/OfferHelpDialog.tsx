import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HandHeart, Loader2 } from 'lucide-react';

interface OfferHelpDialogProps {
  smeUserId: string;
  smeName: string;
  need: string;
  needIndex: number;
}

export const OfferHelpDialog = ({ smeUserId, smeName, need, needIndex }: OfferHelpDialogProps) => {
  const [open, setOpen] = useState(false);
  const [fee, setFee] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    const price = parseFloat(fee);
    if (!price || price <= 0 || !message.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to send an offer');

      const { data, error } = await supabase.functions.invoke('negotiation-manager', {
        body: {
          action: 'create',
          serviceId: null,
          providerId: user.id,
          clientId: smeUserId,
          serviceTitle: `Help with: ${need}`,
          initialPrice: price,
          message: message.trim(),
          notes: JSON.stringify({
            kind: 'sme_need_offer',
            sme_profile_id: smeUserId,
            need,
            need_index: needIndex,
          }),
        },
      });

      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error || 'Failed to send offer');

      toast({
        title: 'Offer sent',
        description: `${smeName} has been notified of your offer to help with "${need}".`,
      });
      setOpen(false);
      setFee('');
      setMessage('');
    } catch (err) {
      toast({
        title: 'Could not send offer',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <HandHeart className="mr-2 h-4 w-4" />
        Offer to Help
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offer to help with “{need}”</DialogTitle>
          <DialogDescription>
            Propose a fee and explain how you would support {smeName}. They can counter, accept and pay
            through the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-fee">Proposed fee (ZMW)</Label>
            <Input
              id="offer-fee"
              type="number"
              min="1"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="e.g. 2500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-message">How you'll help</Label>
            <Textarea
              id="offer-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your approach, deliverables and timeline..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading || !fee || !message.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferHelpDialog;
