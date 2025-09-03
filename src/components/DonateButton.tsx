import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart } from 'lucide-react';
import { LencoPayment } from './LencoPayment';

export const DonateButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');

  const donationAmounts = ['K50', 'K100', 'K250', 'K500', 'K1000'];

  const handleDonationSuccess = () => {
    setIsOpen(false);
    setSelectedAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
          <Heart className="h-4 w-4 mr-2" />
          Donate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Support SME Development</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your donation helps support small and medium enterprises in Zambia
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {donationAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => setSelectedAmount(amount)}
                className="text-sm"
              >
                {amount}
              </Button>
            ))}
          </div>

          {selectedAmount && (
            <LencoPayment
              amount={selectedAmount}
              description={`Donation to support SME development - ${selectedAmount}`}
              onSuccess={handleDonationSuccess}
              onCancel={() => setIsOpen(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};