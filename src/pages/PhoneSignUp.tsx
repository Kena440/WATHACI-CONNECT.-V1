import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const PhoneSignUp = () => {
  const { signInWithPhone, verifyPhoneOtp } = useAppContext();
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setOtpSent(true);
    } catch {
      // error toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, token);
      navigate('/');
    } catch {
      // error toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-emerald-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Phone Sign In</CardTitle>
          <CardDescription>Use your phone number to receive an OTP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={otpSent ? handleVerify : handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required />
            </div>
            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input id="token" value={token} onChange={e => setToken(e.target.value)} required />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : otpSent ? 'Verify Code' : 'Send Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneSignUp;
