import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, Clock, Search, Filter } from 'lucide-react';
import PriceNegotiation from '@/components/PriceNegotiation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

const DEBUG = import.meta.env.DEV;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  currency: string;
  location: string;
  country: string;
  rating: number;
  reviews_count: number;
  profile_image_url?: string;
  availability_status: string;
  years_experience: number;
  summary?: string;
}

export const FreelancerDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('availability_status', 'available');
      
      if (error) throw error;

      const enriched = await Promise.all(
        (data || []).map(async (freelancer) => {
          try {
            const response = await fetch(`${BACKEND_URL}/profile-summary`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(freelancer),
            });
            const { summary } = await response.json();
            return { ...freelancer, summary };
          } catch (err) {
            logger.error('Error fetching summary', err, 'FreelancerDirectory');
            return { ...freelancer };
          }
        })
      );

      setFreelancers(enriched);
    } catch (error) {
      logger.error('Error fetching freelancers', error, 'FreelancerDirectory');
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !selectedLocation || selectedLocation === 'all-locations' || 
                           freelancer.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesPrice = !priceRange || priceRange === 'all-prices' || 
      (priceRange === 'low' && freelancer.hourly_rate < 25) ||
      (priceRange === 'medium' && freelancer.hourly_rate >= 25 && freelancer.hourly_rate < 50) ||
      (priceRange === 'high' && freelancer.hourly_rate >= 50);

    return matchesSearch && matchesLocation && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filter Freelancers</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              <SelectItem value="lusaka">Lusaka</SelectItem>
              <SelectItem value="ndola">Ndola</SelectItem>
              <SelectItem value="kitwe">Kitwe</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-prices">All Prices</SelectItem>
              <SelectItem value="low">Under K150/hr</SelectItem>
              <SelectItem value="medium">K150-250/hr</SelectItem>
              <SelectItem value="high">K250+/hr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <img
                src={freelancer.profile_image_url || '/placeholder.svg'}
                alt={freelancer.name}
                loading="lazy"
                decoding="async"
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <CardTitle className="text-xl">{freelancer.name}</CardTitle>
              <p className="text-gray-600">{freelancer.title}</p>
              {freelancer.summary && (
                <p className="text-gray-500 text-sm mt-1">{freelancer.summary}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{freelancer.rating}</span>
                  <span className="text-gray-500">({freelancer.reviews_count})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{freelancer.location}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 mb-2">
                  {freelancer.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{freelancer.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${freelancer.hourly_rate}</span>
                  <span className="text-gray-500">/hour</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${freelancer.availability_status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                    {freelancer.availability_status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700" 
                    disabled={freelancer.availability_status !== 'available'}
                  >
                    {freelancer.availability_status === 'available' ? 'Hire & Negotiate' : 'Join Waitlist'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <PriceNegotiation
                    initialPrice={freelancer.hourly_rate}
                    serviceTitle={`${freelancer.name} - ${freelancer.title}`}
                    providerId={freelancer.id.toString()}
                    onNegotiationComplete={(finalPrice) => {
                      if (DEBUG) console.log(`Negotiation complete: $${finalPrice}`);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {freelancers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No freelancers available yet.</p>
          <p className="text-gray-400 mt-2">We're building our network of verified professionals. Check back soon!</p>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No freelancers found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all-locations');
              setPriceRange('all-prices');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : null}
    </div>
  );
};

