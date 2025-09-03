import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, TrendingUp, MessageCircle, Database, Bot, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestionsDataSource, type SuggestionData, type UserProfile } from '@/services/suggestionsDataSource';

export const CollaborationSuggestions = ({ userProfile }: { userProfile?: UserProfile }) => {
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataSource, setSelectedDataSource] = useState<'all' | 'ai' | 'database' | 'manual'>('all');
  const { toast } = useToast();

  const generateSuggestions = useCallback(async () => {
    setLoading(true);

    try {
      let suggestions: SuggestionData[];
      
      if (selectedDataSource === 'all') {
        suggestions = await suggestionsDataSource.generateSuggestions(userProfile);
      } else {
        suggestions = await suggestionsDataSource.getSuggestionsBySource(selectedDataSource, userProfile);
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggestions. Please try again.",
        variant: "destructive"
      });
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile, selectedDataSource, toast]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  const getDataSourceIcon = (dataSource: string) => {
    switch (dataSource) {
      case 'ai': return <Bot className="w-4 h-4 text-blue-500" />;
      case 'database': return <Database className="w-4 h-4 text-green-500" />;
      case 'manual': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDataSourceColor = (dataSource: string) => {
    switch (dataSource) {
      case 'ai': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'database': return 'bg-green-50 text-green-700 border-green-200';
      case 'manual': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleInterest = (suggestionId: string, action: 'interested' | 'not_interested') => {
    if (action === 'interested') {
      toast({
        title: "Interest registered!",
        description: "We'll connect you with potential collaborators soon.",
      });
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partnership': return <Users className="w-5 h-5 text-blue-500" />;
      case 'skill_exchange': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'project': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'mentorship': return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'partnership': return 'bg-blue-100 text-blue-800';
      case 'skill_exchange': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-yellow-100 text-yellow-800';
      case 'mentorship': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">AI-Powered Collaboration Suggestions</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">AI-Powered Collaboration Suggestions</h2>
      </div>

      {/* Data Source Selection */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700 mr-2">Data Sources:</span>
        <Button
          variant={selectedDataSource === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDataSource('all')}
        >
          All Sources
        </Button>
        <Button
          variant={selectedDataSource === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDataSource('ai')}
          className="flex items-center gap-1"
        >
          <Bot className="w-4 h-4" />
          AI
        </Button>
        <Button
          variant={selectedDataSource === 'database' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDataSource('database')}
          className="flex items-center gap-1"
        >
          <Database className="w-4 h-4" />
          Database
        </Button>
        <Button
          variant={selectedDataSource === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDataSource('manual')}
          className="flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          Curated
        </Button>
      </div>
      
      {suggestions.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
            <p className="text-gray-600 mb-4">Complete your profile to get personalized collaboration suggestions.</p>
            <Button onClick={generateSuggestions}>Refresh Suggestions</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(suggestion.type)}
                    <div>
                      <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getTypeColor(suggestion.type)}`}>
                          {suggestion.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`${getDataSourceColor(suggestion.dataSource)} flex items-center gap-1`}>
                          {getDataSourceIcon(suggestion.dataSource)}
                          {suggestion.dataSource.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{suggestion.matchScore}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{suggestion.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Potential Participants:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.participants.map((participant, idx) => (
                      <Badge key={idx} variant="outline">{participant}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-gray-600">Potential Value: </span>
                    <span className="font-semibold text-green-600">{suggestion.potentialValue}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleInterest(suggestion.id, 'not_interested')}
                    >
                      Not Interested
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleInterest(suggestion.id, 'interested')}
                    >
                      I'm Interested
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-center space-y-4">
        <Button variant="outline" onClick={generateSuggestions}>
          Generate More Suggestions
        </Button>
        {suggestions.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {suggestions.length} suggestions from {selectedDataSource === 'all' ? 'all data sources' : `${selectedDataSource} source`}
          </div>
        )}
      </div>
    </div>
  );
};
