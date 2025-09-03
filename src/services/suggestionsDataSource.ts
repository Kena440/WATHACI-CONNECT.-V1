import { supabase } from '@/lib/supabase';

export interface SuggestionData {
  id: string;
  type: 'partnership' | 'skill_exchange' | 'project' | 'mentorship';
  title: string;
  description: string;
  matchScore: number;
  participants: string[];
  tags: string[];
  potentialValue: string;
  dataSource: 'database' | 'ai' | 'manual';
  sourceId?: string;
}

export interface UserProfile {
  id?: string;
  business_name?: string;
  industry?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  company_size?: string;
}

export class SuggestionsDataSource {
  private static instance: SuggestionsDataSource;

  public static getInstance(): SuggestionsDataSource {
    if (!SuggestionsDataSource.instance) {
      SuggestionsDataSource.instance = new SuggestionsDataSource();
    }
    return SuggestionsDataSource.instance;
  }

  /**
   * Generate suggestions from multiple data sources
   */
  async generateSuggestions(userProfile?: UserProfile): Promise<SuggestionData[]> {
    try {
      // Try to get suggestions from multiple sources
      const [aiSuggestions, databaseSuggestions, manualSuggestions] = await Promise.allSettled([
        this.getAISuggestions(userProfile),
        this.getDatabaseSuggestions(userProfile),
        this.getManualSuggestions(userProfile)
      ]);

      const allSuggestions: SuggestionData[] = [];

      // Combine results from all sources
      if (aiSuggestions.status === 'fulfilled') {
        allSuggestions.push(...aiSuggestions.value);
      }

      if (databaseSuggestions.status === 'fulfilled') {
        allSuggestions.push(...databaseSuggestions.value);
      }

      if (manualSuggestions.status === 'fulfilled') {
        allSuggestions.push(...manualSuggestions.value);
      }

      // Sort by match score and return top 10
      return allSuggestions
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

    } catch (error) {
      console.error('Error generating suggestions from data sources:', error);
      return this.getFallbackSuggestions(userProfile);
    }
  }

  /**
   * Get AI-powered suggestions from Supabase edge function
   */
  private async getAISuggestions(userProfile?: UserProfile): Promise<SuggestionData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-professional-matcher', {
        body: {
          type: 'collaboration_suggestions',
          userProfile
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        return data.suggestions.map((suggestion: any) => ({
          ...suggestion,
          dataSource: 'ai' as const,
          sourceId: 'supabase-ai'
        }));
      }

      return [];
    } catch (error) {
      console.warn('AI suggestions failed:', error);
      return [];
    }
  }

  /**
   * Get suggestions from database/stored data
   */
  private async getDatabaseSuggestions(userProfile?: UserProfile): Promise<SuggestionData[]> {
    try {
      // This would typically query a database table with pre-computed suggestions
      // For now, we'll simulate with static data that matches user profile
      const staticSuggestions: SuggestionData[] = [
        {
          id: 'db_001',
          type: 'partnership',
          title: 'Local Supply Chain Partnership',
          description: 'Connect with local suppliers to reduce costs and improve delivery times.',
          matchScore: 82,
          participants: ['Local Suppliers Network', userProfile?.business_name || 'Your Business'],
          tags: ['supply-chain', 'local', 'cost-optimization'],
          potentialValue: 'K15,000 cost savings',
          dataSource: 'database',
          sourceId: 'supply_chain_db'
        },
        {
          id: 'db_002',
          type: 'skill_exchange',
          title: 'Digital Marketing Skills Exchange',
          description: 'Exchange your expertise for digital marketing knowledge with experienced marketers.',
          matchScore: 75,
          participants: ['Marketing Professionals Group'],
          tags: ['digital-marketing', 'skills', 'exchange'],
          potentialValue: 'Enhanced market reach',
          dataSource: 'database',
          sourceId: 'skills_exchange_db'
        }
      ];

      // Filter suggestions based on user profile if available
      if (userProfile?.industry) {
        return staticSuggestions.filter(suggestion =>
          suggestion.tags.some(tag => tag.includes(userProfile.industry?.toLowerCase() || ''))
        );
      }

      return staticSuggestions;
    } catch (error) {
      console.warn('Database suggestions failed:', error);
      return [];
    }
  }

  /**
   * Get manually curated suggestions
   */
  private async getManualSuggestions(userProfile?: UserProfile): Promise<SuggestionData[]> {
    // These would typically come from admin-curated content
    const manualSuggestions: SuggestionData[] = [
      {
        id: 'manual_001',
        type: 'mentorship',
        title: 'Experienced Entrepreneur Mentorship',
        description: 'Get guidance from successful local entrepreneurs who have scaled similar businesses.',
        matchScore: 88,
        participants: ['Business Leaders Network'],
        tags: ['mentorship', 'scaling', 'leadership'],
        potentialValue: 'Strategic business growth',
        dataSource: 'manual',
        sourceId: 'curated_mentors'
      },
      {
        id: 'manual_002',
        type: 'project',
        title: 'Community Impact Initiative',
        description: 'Join collaborative projects that create positive community impact while building business networks.',
        matchScore: 70,
        participants: ['Community Leaders', 'Social Impact Organizations'],
        tags: ['community', 'impact', 'networking'],
        potentialValue: 'Brand visibility and network expansion',
        dataSource: 'manual',
        sourceId: 'community_projects'
      }
    ];

    return manualSuggestions;
  }

  /**
   * Fallback suggestions when all data sources fail
   */
  private getFallbackSuggestions(userProfile?: UserProfile): SuggestionData[] {
    return [
      {
        id: 'fallback_001',
        type: 'partnership',
        title: 'Local Distributor Partnership',
        description: 'Partner with regional distributors to expand your market reach.',
        matchScore: 85,
        participants: ['Zed Distributors Ltd', userProfile?.business_name || 'Your Business'],
        tags: ['distribution', 'retail'],
        potentialValue: 'K25,000 revenue increase',
        dataSource: 'manual',
        sourceId: 'fallback'
      },
      {
        id: 'fallback_002',
        type: 'mentorship',
        title: 'Mentorship with Jane Banda',
        description: 'Seasoned entrepreneur ready to guide you on scaling operations.',
        matchScore: 78,
        participants: ['Jane Banda'],
        tags: ['mentorship', 'operations'],
        potentialValue: 'Improved business strategy',
        dataSource: 'manual',
        sourceId: 'fallback'
      }
    ];
  }

  /**
   * Get suggestions by data source type
   */
  async getSuggestionsBySource(
    source: 'database' | 'ai' | 'manual',
    userProfile?: UserProfile
  ): Promise<SuggestionData[]> {
    switch (source) {
      case 'ai':
        return this.getAISuggestions(userProfile);
      case 'database':
        return this.getDatabaseSuggestions(userProfile);
      case 'manual':
        return this.getManualSuggestions(userProfile);
      default:
        return [];
    }
  }
}

export const suggestionsDataSource = SuggestionsDataSource.getInstance();