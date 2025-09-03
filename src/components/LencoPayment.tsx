import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, CreditCard, Banknote, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface LencoPaymentProps {
  amount: string | number;
  description: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export const LencoPayment = ({ amount, description, onSuccess, onCancel, onError }: LencoPaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(value);
  };

  // Calculate fee breakdown
  const totalAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/[^\d.]/g, '')) : parseFloat(amount.toString());
  const managementFee = totalAmount * 0.02;
  const providerAmount = totalAmount - managementFee;

  const handlePayment = async () => {
    if (paymentMethod === 'mobile_money' && (!phoneNumber || !provider)) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

      if (!cleanCard || !expiry || !cvv) {
        toast({
          title: "Missing Information",
          description: "Please enter your card details",
          variant: "destructive",
        });
        return;
      }

      if (cleanCard.length < 12 || !expiryRegex.test(expiry) || cvv.length < 3) {
        toast({
          title: "Invalid Card",
          description: "Please check your card number, expiry, and CVV",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('lenco-payment', {
        body: {
          amount: totalAmount,
          paymentMethod,
          phoneNumber,
          provider,
          description,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          expiry,
          cvv,
        }
      });

      if (error) {
        logger.error('Supabase function error', error, 'LencoPayment');
        throw new Error(error.message || 'Network error occurred');
      }
      
      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: `Payment completed. Transaction ID: ${data.transaction_id}`,
        });
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Payment was declined or card details were invalid');
      }
    } catch (error: any) {
      logger.error('Payment error', error, 'LencoPayment');
      const errorMessage = error.message || 'Payment failed. Please check your connection and try again.';
      onError?.(error);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Secure Payment Portal
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Payment Breakdown</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">K{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee (2%):</span>
              <span>K{managementFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Provider Receives:</span>
              <span>K{providerAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile_money">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Money
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Debit/Credit Card
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'mobile_money' && (
          <>
            <div>
              <Label>Mobile Money Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="zamtel">Zamtel Kwacha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="097XXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </>
        )}

        {paymentMethod === 'card' && (
          <>
            <div>
              <Label>Card Number</Label>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="1234567812345678"
                value={cardNumber}
                onChange={handleCardNumberChange}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Expiry (MM/YY)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                />
              </div>
              <div className="w-24">
                <Label>CVV</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Pay K${totalAmount.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
