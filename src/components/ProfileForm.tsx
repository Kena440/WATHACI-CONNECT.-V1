import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CountrySelect } from '@/components/CountrySelect';
import { AddressInput } from '@/components/AddressInput';
import { QualificationsInput } from '@/components/QualificationsInput';
import { ImageUpload } from '@/components/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { sectors, countries, currencies } from '../data/countries';

interface ProfileFormProps {
  accountType: string;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  loading: boolean;
  initialData?: any;
}

export const ProfileForm = ({ accountType, onSubmit, onPrevious, loading, initialData }: ProfileFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    payment_method: 'phone',
    use_same_phone: true,
    qualifications: [],
    gaps_identified: [],
    phone: '',
    payment_phone: '',
    mobile_money_provider: '',
    card_number: '',
    card_expiry: '',
    cardholder_name: '',
    card_cvv: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_name: '',
    bank_branch: '',
    bank_swift_code: '',
    bank_currency: '',
    profile_image_url: null,
    linkedin_url: '',
    ...initialData
  });

  // Auto-populate country code when country changes
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry) {
        const phoneCode = selectedCountry.phoneCode;
        
        if (formData.phone && !formData.phone.startsWith('+')) {
          setFormData(prev => ({ ...prev, phone: `${phoneCode} ${formData.phone.replace(/^\+?\d{1,4}\s?/, '')}` }));
        } else if (!formData.phone) {
          setFormData(prev => ({ ...prev, phone: `${phoneCode} ` }));
        }
        
        if (!formData.use_same_phone && formData.payment_phone && !formData.payment_phone.startsWith('+')) {
          setFormData(prev => ({ ...prev, payment_phone: `${phoneCode} ${formData.payment_phone.replace(/^\+?\d{1,4}\s?/, '')}` }));
        } else if (!formData.use_same_phone && !formData.payment_phone) {
          setFormData(prev => ({ ...prev, payment_phone: `${phoneCode} ` }));
        }
      }
    }
  }, [formData.country, formData.phone, formData.payment_phone, formData.use_same_phone]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      address,
      coordinates: coordinates || null
    }));
  };

  const renderSoleProprietorFields = () => (
    <>
      <ImageUpload
        currentImage={formData.profile_image_url}
        onImageChange={(url) => handleInputChange('profile_image_url', url)}
        label="Business Logo"
        type="logo"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Business Name</Label>
          <Input 
            value={formData.business_name || ''}
            onChange={(e) => handleInputChange('business_name', e.target.value)} 
          />
        </div>
        <div>
          <Label>Registration Number</Label>
          <Input 
            value={formData.registration_number || ''}
            onChange={(e) => handleInputChange('registration_number', e.target.value)} 
          />
        </div>
      </div>
      <div>
        <Label>LinkedIn Profile URL</Label>
        <Input 
          value={formData.linkedin_url || ''}
          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </div>
    </>
  );

  const renderProfessionalFields = () => (
    <>
      <ImageUpload
        currentImage={formData.profile_image_url}
        onImageChange={(url) => handleInputChange('profile_image_url', url)}
        label="Profile Picture"
        type="profile"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Years of Experience</Label>
          <Input 
            type="number" 
            value={formData.experience_years || ''}
            onChange={(e) => handleInputChange('experience_years', e.target.value)} 
          />
        </div>
        <div>
          <Label>Professional License Number</Label>
          <Input 
            value={formData.license_number || ''}
            onChange={(e) => handleInputChange('license_number', e.target.value)} 
          />
        </div>
      </div>
      
      <div>
        <Label>LinkedIn Profile URL</Label>
        <Input 
          value={formData.linkedin_url || ''}
          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </div>
      
      <QualificationsInput
        qualifications={formData.qualifications}
        onChange={(qualifications) => handleInputChange('qualifications', qualifications)}
      />
    </>
  );

  const renderSMEFields = () => (
    <>
      <ImageUpload
        currentImage={formData.profile_image_url}
        onImageChange={(url) => handleInputChange('profile_image_url', url)}
        label="Company Logo"
        type="logo"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ownership Structure</Label>
          <Select 
            value={formData.ownership_structure || ''}
            onValueChange={(value) => handleInputChange('ownership_structure', value)}
          >
            <SelectTrigger><SelectValue placeholder="Select ownership structure" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="limited_company">Limited Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Number of Employees</Label>
          <Input 
            type="number" 
            value={formData.employees_count || ''}
            onChange={(e) => handleInputChange('employees_count', e.target.value)} 
          />
        </div>
      </div>
      <div>
        <Label>LinkedIn Profile URL</Label>
        <Input 
          value={formData.linkedin_url || ''}
          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/company/your-company"
        />
      </div>
    </>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div>
            <CardTitle>Complete Your {accountType} Profile</CardTitle>
            <CardDescription>
              Please provide information specific to your account type
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
          {/* Location Fields */}
          <CountrySelect
            onCountryChange={(country) => handleInputChange('country', country)}
            onProvinceChange={(province) => handleInputChange('province', province)}
            selectedCountry={formData.country}
            selectedProvince={formData.province}
          />
          
          <AddressInput
            onAddressChange={handleAddressChange}
            value={formData.address}
          />

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone Number</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                placeholder="Country code will be auto-filled"
              />
            </div>
            <div>
              <Label>Sector/Industry</Label>
              <Select 
                value={formData.sectors?.[0] || ''}
                onValueChange={(value) => handleInputChange('sectors', [value])}
              >
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          {/* Bio Section */}
          <div>
            <Label>Bio</Label>
            <Textarea 
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself and what you do..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will be shown to anyone who views your profile
            </p>
          </div>
          </div>

          {/* Account Type Specific Fields */}
          {accountType === 'sole_proprietor' && renderSoleProprietorFields()}
          {accountType === 'professional' && renderProfessionalFields()}
          {accountType === 'sme' && renderSMEFields()}

          {/* Payment Method Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="same-phone"
                checked={formData.use_same_phone}
                onCheckedChange={(checked) => handleInputChange('use_same_phone', checked)}
              />
              <Label htmlFor="same-phone">Use the same phone number for subscription payments</Label>
            </div>
            {formData.use_same_phone && (
              <div className="mb-4">
                <Label>Mobile Money Provider</Label>
                <Select
                  value={formData.mobile_money_provider}
                  onValueChange={(value) => handleInputChange('mobile_money_provider', value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="zamtel">Zamtel Kwacha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!formData.use_same_phone && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.payment_method}
                  onValueChange={(value) => handleInputChange('payment_method', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank Transfer</Label>
                  </div>
                </RadioGroup>

                {formData.payment_method === 'phone' && (
                  <>
                    <div>
                      <Label>Mobile Money Provider</Label>
                      <Select
                        value={formData.mobile_money_provider}
                        onValueChange={(value) => handleInputChange('mobile_money_provider', value)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                          <SelectItem value="airtel">Airtel Money</SelectItem>
                          <SelectItem value="zamtel">Zamtel Kwacha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Payment Phone Number</Label>
                      <Input
                        value={formData.payment_phone}
                        onChange={(e) => handleInputChange('payment_phone', e.target.value)}
                        placeholder="Country code will be auto-filled"
                      />
                    </div>
                  </>
                )}

                {formData.payment_method === 'card' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input
                          value={formData.card_number}
                          onChange={(e) => handleInputChange('card_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          value={formData.card_expiry}
                          onChange={(e) => handleInputChange('card_expiry', e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cardholder Name</Label>
                        <Input
                          value={formData.cardholder_name}
                          onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          value={formData.card_cvv}
                          onChange={(e) => handleInputChange('card_cvv', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.payment_method === 'bank' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Account Name</Label>
                        <Input
                          value={formData.bank_account_name}
                          onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={formData.bank_account_number}
                          onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          value={formData.bank_name}
                          onChange={(e) => handleInputChange('bank_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Bank Branch</Label>
                        <Input
                          value={formData.bank_branch}
                          onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Swift Code</Label>
                        <Input
                          value={formData.bank_swift_code}
                          onChange={(e) => handleInputChange('bank_swift_code', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select
                          value={formData.bank_currency}
                          onValueChange={(value) => handleInputChange('bank_currency', value)}
                        >
                          <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                          <SelectContent>
                            {currencies.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};