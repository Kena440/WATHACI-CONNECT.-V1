import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase-enhanced';

interface Recommendation {
  id: string;
  type: 'product' | 'service' | 'professional';
  title: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  reason: string;
  confidence: number;
}

interface AIRecommendationsProps {
  userProfile?: any;
  searchHistory?: string[];
  onSelectRecommendation: (recommendation: Recommendation) => void;
}

const AIRecommendations = ({ 
  userProfile, 
  searchHistory = [], 
  onSelectRecommendation 
}: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'similar'>('personalized');

  useEffect(() => {
    fetchRecommendations();
  }, [userProfile, searchHistory, activeTab]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-professional-matcher', {
        body: {
          type: 'marketplace_recommendations',
          userProfile,
          searchHistory,
          recommendationType: activeTab
        }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Fallback mock data
      setRecommendations([
        {
          id: '1',
          type: 'service',
          title: 'Business Registration Service',
          description: 'Complete PACRA registration with legal support',
          price: 1500,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
          reason: 'Based on your business setup needs',
          confidence: 0.92
        },
        {
          id: '2',
          type: 'professional',
          title: 'Tax Consultant - Sarah Mwanza',
          description: 'Expert in SME tax compliance and planning',
          price: 250,
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
          reason: 'Highly rated in your area',
          confidence: 0.88
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'personalized': return <Sparkles className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'similar': return <Users className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Recommendations
        </h3>
        <div className="flex gap-2">
          {['personalized', 'trending', 'similar'].map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="capitalize"
            >
              {getTabIcon(tab)}
              <span className="ml-1">{tab}</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map(rec => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={rec.image}
                  alt={rec.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-sm line-clamp-2">{rec.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {Math.round(rec.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{rec.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-blue-600">K{rec.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{rec.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {rec.reason}
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => onSelectRecommendation(rec)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;