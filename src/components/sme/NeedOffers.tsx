import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PriceNegotiation } from '@/components/PriceNegotiation';
import { HandHeart, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

interface OfferRow {
  id: string;
  service_title: string;
  initial_price: number;
  current_price: number;
  final_price: number | null;
  status: string;
  created_at: string;
  provider_id: string;
  client_id: string;
  notes: string | null;
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'accepted':
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'countered':
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    default:
      return <Clock className="h-4 w-4 text-amber-600" />;
  }
};

export const NeedOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<OfferRow | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('negotiations')
      .select('*')
      .is('service_id', null)
      .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error) setOffers((data || []) as OfferRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOffers();
    const channel = supabase
      .channel('need-offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negotiations' }, () => fetchOffers())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOffers]);

  if (!user) return null;

  const incoming = offers.filter((o) => o.client_id === user.id);
  const sent = offers.filter((o) => o.provider_id === user.id);

  const renderList = (rows: OfferRow[], role: 'client' | 'provider') => {
    if (rows.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4">
          {role === 'client' ? 'No offers to help yet.' : "You haven't sent any offers yet."}
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {rows.map((offer) => (
          <div key={offer.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-medium">{offer.service_title}</h4>
              <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                {statusIcon(offer.status)}
                {offer.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Proposed fee: <span className="font-medium text-foreground">K{Number(offer.current_price).toLocaleString()}</span>
              {' · '}
              {new Date(offer.created_at).toLocaleDateString()}
            </div>
            {(offer.status === 'pending' || offer.status === 'countered' || offer.status === 'accepted') && (
              <Button size="sm" variant="outline" onClick={() => setActive(offer)}>
                {role === 'client' ? 'Review & respond' : 'View negotiation'}
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5" />
            Offers to Help
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading offers…</p>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">Received</h3>
                {renderList(incoming, 'client')}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Sent</h3>
                {renderList(sent, 'provider')}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <PriceNegotiation
              initialPrice={Number(active.current_price)}
              serviceTitle={active.service_title}
              providerId={active.provider_id}
              existingNegotiationId={active.id}
              onNegotiationComplete={() => {
                setActive(null);
                fetchOffers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NeedOffers;
