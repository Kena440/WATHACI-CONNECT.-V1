import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { countries } from '@/data/countries';

interface CountrySelectProps {
  onCountryChange: (country: string) => void;
  onProvinceChange: (province: string) => void;
  selectedCountry?: string;
  selectedProvince?: string;
}

export const CountrySelect = ({ onCountryChange, onProvinceChange, selectedCountry, selectedProvince }: CountrySelectProps) => {
  const [provinces, setProvinces] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.name === selectedCountry);
      if (country) {
        setProvinces(country.provinces);
      } else {
        setProvinces([]);
      }
    } else {
      setProvinces([]);
    }
  }, [selectedCountry]);

  const handleCountryChange = (country: string) => {
    onCountryChange(country);
    onProvinceChange(''); // Reset province when country changes
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Country</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Province/State</Label>
        <Select 
          value={selectedProvince} 
          onValueChange={onProvinceChange}
          disabled={!selectedCountry}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select province/state" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};