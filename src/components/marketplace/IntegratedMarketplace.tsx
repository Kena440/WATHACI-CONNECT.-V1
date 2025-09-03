import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceProviderCard } from './ServiceProviderCard';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Grid, List, Loader2, Users, Building, BookOpen } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerType: 'freelancer' | 'partnership' | 'resource';
  category: string;
  skills: string[];
  location: string;
  deliveryTime: string;
  rating: number;
  reviews: number;
  currency: string;
  price: number;
  image: string;
}

export const IntegratedMarketplace = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProviderType, setSelectedProviderType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories = [
    'all', 'technology', 'marketing', 'design', 'business', 
    'finance', 'legal', 'consulting', 'education'
  ];

  const providerTypes: { value: string; label: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { value: 'all', label: 'All Providers' },
    { value: 'freelancer', label: 'Freelancers', icon: Users },
    { value: 'partnership', label: 'Partners', icon: Building },
    { value: 'resource', label: 'Resources', icon: BookOpen }
  ];

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        category: selectedCategory,
        providerType: selectedProviderType,
        location: selectedLocation,
        priceRange: priceRange
      };

      const { data, error } = await supabase.functions.invoke('marketplace-manager', {
        body: { action: 'search', filters }
      });

      if (error) throw error;
      setServices((data.data || []) as Service[]);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedProviderType, selectedLocation, priceRange]);

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProviderTypeStats = () => {
    const stats = services.reduce<Record<string, number>>((acc, service) => {
      acc[service.providerType] = (acc[service.providerType] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const stats = getProviderTypeStats();

  if (selectedService) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => setSelectedService(null)}
          className="mb-6"
        >
          ← Back to Marketplace
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{selectedService.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {selectedService.providerType}
              </Badge>
              <Badge variant="secondary">{selectedService.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedService.skills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-6">{selectedService.description}</p>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{selectedService.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{selectedService.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Time:</span>
                    <span>{selectedService.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span>{selectedService.rating} ⭐ ({selectedService.reviews} reviews)</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      {selectedService.currency}{selectedService.price.toLocaleString()}
                    </div>
                    <Button className="w-full" size="lg">
                      Order Now with Lenco Pay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <div className="text-sm text-gray-600">Total Services</div>
          </CardContent>
        </Card>
        {providerTypes.slice(1).map((type) => {
          const IconComponent = type.icon!;
          return (
            <Card key={type.value}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats[type.value] || 0}
                </div>
                <div className="text-sm text-gray-600">{type.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search services..."
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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProviderType} onValueChange={setSelectedProviderType}>
              <SelectTrigger>
                <SelectValue placeholder="Provider Type" />
              </SelectTrigger>
              <SelectContent>
                {providerTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="lusaka">Lusaka</SelectItem>
                <SelectItem value="ndola">Ndola</SelectItem>
                <SelectItem value="kitwe">Kitwe</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading services...</span>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredServices.map((service) => (
            <ServiceProviderCard 
              key={service.id} 
              service={service} 
              onSelect={setSelectedService}
            />
          ))}
        </div>
      )}

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedProviderType('all');
              setSelectedLocation('all');
              setPriceRange('');
            }}
            className="mt-4"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};