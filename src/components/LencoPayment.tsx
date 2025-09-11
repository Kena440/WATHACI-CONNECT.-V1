import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, CreditCard, Banknote, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { validateZambianPhone, getExampleNumbers } from '@/utils/phoneValidation';

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
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const { toast } = useToast();

  // Calculate fee breakdown
  const totalAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/[^\d.]/g, '')) : parseFloat(amount.toString());
  const managementFee = totalAmount * 0.02;
  const providerAmount = totalAmount - managementFee;

  // Get example numbers for display
  const exampleNumbers = getExampleNumbers();

  const validatePhoneNumber = (phone: string, selectedProvider?: string) => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }

    const validation = validateZambianPhone(phone, selectedProvider);
    if (!validation.isValid) {
      setPhoneError(validation.message);
      return false;
    }

    // Check if provider matches selected provider
    if (selectedProvider && validation.provider?.code !== selectedProvider) {
      setPhoneError(`Phone number doesn't match selected provider (${provider})`);
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    if (phone.trim()) {
      validatePhoneNumber(phone, provider);
    } else {
      setPhoneError('');
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    if (phoneNumber.trim()) {
      validatePhoneNumber(phoneNumber, newProvider);
    }
  };

  const getPlaceholderForProvider = (providerCode: string) => {
    const examples = exampleNumbers.find(ex => {
      switch (providerCode) {
        case 'mtn': return ex.provider === 'MTN Mobile Money';
        case 'airtel': return ex.provider === 'Airtel Money';
        case 'zamtel': return ex.provider === 'Zamtel Kwacha';
        default: return false;
      }
    });
    return examples?.examples.join(' or ') || '0XXXXXXXXX';
  };

  const handlePayment = async () => {
    if (paymentMethod === 'mobile_money' && (!phoneNumber || !provider)) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'mobile_money' && !validatePhoneNumber(phoneNumber, provider)) {
      toast({
        title: "Invalid Phone Number",
        description: phoneError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('lenco-payment', {
        body: {
          amount: totalAmount,
          paymentMethod,
          phoneNumber,
          provider,
          description
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Network error occurred');
      }
      
      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: `Payment completed. Transaction ID: ${data.transaction_id}`,
        });
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Payment was declined');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
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
              <Select value={provider} onValueChange={handleProviderChange}>
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
                placeholder={provider ? getPlaceholderForProvider(provider) : '0XXXXXXXXX'}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
              {provider && !phoneError && (
                <p className="text-sm text-gray-500 mt-1">
                  Valid formats: {getPlaceholderForProvider(provider)}
                </p>
              )}
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