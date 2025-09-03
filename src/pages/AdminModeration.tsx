import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  type: 'product' | 'service';
  seller_id: string;
}

const AdminModeration = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      const { data, error } = await supabase
        .from<Listing>('listings')
        .select('*')
        .eq('status', 'pending');

      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    };

    fetchPending();
  }, []);

  const handleDecision = async (listing: Listing, approve: boolean) => {
    const status = approve ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listing.id);

    if (!error) {
      // Notify seller via Supabase edge function and in-app message
      await supabase.functions.invoke('notify-seller', {
        body: { sellerId: listing.seller_id, listingId: listing.id, status },
      });

      await supabase.from('notifications').insert({
        user_id: listing.seller_id,
        message: `Your listing "${listing.title}" was ${status}.`,
      });

      setListings(prev => prev.filter(l => l.id !== listing.id));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Pending Listings</h1>
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <p>No pending listings.</p>
        ) : (
          <ul className="space-y-4">
            {listings.map(listing => (
              <li
                key={listing.id}
                className="border rounded p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-sm text-gray-500">{listing.type}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDecision(listing, false)}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => handleDecision(listing, true)}>
                    Approve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminModeration;
