import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

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
}

export const FreelancerDirectory = ({ initialSkill = '' }: { initialSkill?: string }) => {
  const [searchTerm, setSearchTerm] = useState(initialSkill);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    setSearchTerm(initialSkill);
  }, [initialSkill]);

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('availability_status', 'available');
      
      if (error) throw error;
      setFreelancers(data || []);
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
          <TeamMemberCard key={freelancer.id} freelancer={freelancer} />
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

