import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createSearchPattern } from '@/lib/utils/search';

export type AccountType = 'freelancer' | 'sme' | 'investor' | 'government';

export interface DirectoryProfile {
  id: string;
  display_name?: string | null;
  full_name?: string | null;
  profile_photo_url?: string | null;
  avatar_url?: string | null;
  account_type?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  is_profile_complete?: boolean | null;
  // Freelancer
  professional_title?: string | null;
  primary_skills?: string[] | null;
  experience_level?: string | null;
  availability?: string | null;
  rate_range?: string | null;
  // SME
  business_name?: string | null;
  industry?: string | null;
  business_stage?: string | null;
  sme_services?: string | null;
  top_needs?: string[] | null;
  need_categories?: string[] | null;
  service_categories?: string[] | null;
  // Investor
  investor_type?: string | null;
  ticket_size_range?: string | null;
  investor_sectors?: string[] | null;
  investment_stage_focus?: string[] | null;
  // Government
  institution_name?: string | null;
  institution_type?: string | null;
  mandate_areas?: string[] | null;
  services_or_programmes?: string | null;
}

interface UseDirectoryProfilesOptions {
  accountType: AccountType;
  pageSize?: number;
}

export function useDirectoryProfiles({ accountType, pageSize = 20 }: UseDirectoryProfilesOptions) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Debounced search (simple implementation)
  const debouncedSearch = useMemo(() => searchTerm, [searchTerm]);

  const queryKey = ['directory-profiles', accountType, debouncedSearch, locationFilter, industryFilter, page, pageSize];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // CRITICAL FIX: Use v_directory_profiles view - NO is_profile_complete filter
      // This ensures ALL users with account_type appear in directories
      let query = supabase
        .from('v_directory_profiles')
        .select('*', { count: 'exact' });

      // Handle the 'freelancer' type which may also be stored as 'professional'
      if (accountType === 'freelancer') {
        query = query.in('account_type', ['freelancer', 'professional']);
      } else {
        query = query.eq('account_type', accountType);
      }
      
      query = query.order('created_at', { ascending: false });

      // Apply search filter with escaped patterns
      if (debouncedSearch) {
        const safePattern = createSearchPattern(debouncedSearch);
        query = query.or(
          `display_name.ilike.${safePattern},` +
          `full_name.ilike.${safePattern},` +
          `bio.ilike.${safePattern},` +
          `professional_title.ilike.${safePattern},` +
          `business_name.ilike.${safePattern},` +
          `institution_name.ilike.${safePattern}`
        );
      }

      // Apply location filter with escaped pattern
      if (locationFilter && locationFilter !== 'all') {
        const locationPattern = createSearchPattern(locationFilter);
        query = query.ilike('city', locationPattern);
      }

      // Apply industry filter for SME and Investor with escaped pattern
      if (industryFilter && industryFilter !== 'all') {
        if (accountType === 'sme') {
          const industryPattern = createSearchPattern(industryFilter);
          query = query.ilike('industry', industryPattern);
        }
      }

      // Apply pagination
      query = query.range(from, to);

      const { data: profiles, error, count } = await query;

      if (error) throw error;

      // Filter out profiles without an id and map to DirectoryProfile
      const validProfiles: DirectoryProfile[] = (profiles || [])
        .filter((p): p is typeof p & { id: string } => p.id !== null)
        .map(p => ({
          id: p.id,
          display_name: p.display_name,
          full_name: p.full_name,
          profile_photo_url: p.profile_photo_url,
          account_type: p.account_type,
          bio: p.bio,
          city: p.city,
          country: p.country,
          is_profile_complete: p.is_profile_complete,
          professional_title: p.professional_title,
          primary_skills: p.primary_skills,
          experience_level: p.experience_level,
          availability: p.availability,
          rate_range: p.rate_range,
          business_name: p.business_name,
          industry: p.industry,
          business_stage: p.business_stage,
          sme_services: p.sme_services,
          top_needs: p.top_needs,
          investor_type: p.investor_type,
          ticket_size_range: p.ticket_size_range,
          investor_sectors: p.investor_sectors,
          investment_stage_focus: p.investment_stage_focus,
          institution_name: p.institution_name,
          institution_type: p.institution_type,
          mandate_areas: p.mandate_areas,
          services_or_programmes: p.services_or_programmes,
        }));

      // Attach structured taxonomy tags (freelancer service categories / SME need categories)
      const ids = validProfiles.map(p => p.id);
      if (ids.length > 0) {
        if (accountType === 'freelancer') {
          const { data: rows } = await supabase
            .from('freelancer_services')
            .select('freelancer_profile_id, category')
            .in('freelancer_profile_id', ids)
            .eq('is_active', true);
          const byId = new Map<string, string[]>();
          (rows || []).forEach(r => {
            const list = byId.get(r.freelancer_profile_id) || [];
            if (!list.includes(r.category)) list.push(r.category);
            byId.set(r.freelancer_profile_id, list);
          });
          validProfiles.forEach(p => { p.service_categories = byId.get(p.id) || []; });
        } else if (accountType === 'sme') {
          const { data: rows } = await supabase
            .from('sme_needs')
            .select('sme_profile_id, category')
            .in('sme_profile_id', ids)
            .eq('is_active', true);
          const byId = new Map<string, string[]>();
          (rows || []).forEach(r => {
            const list = byId.get(r.sme_profile_id) || [];
            if (!list.includes(r.category)) list.push(r.category);
            byId.set(r.sme_profile_id, list);
          });
          validProfiles.forEach(p => { p.need_categories = byId.get(p.id) || []; });
        }
      }

      return {
        profiles: validProfiles,
        totalCount: count || 0,
      };
    },
    staleTime: 30000, // 30 seconds
  });

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setIndustryFilter('all');
    setPage(1);
  };

  return {
    profiles: data?.profiles || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    // Filters
    searchTerm,
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      setPage(1); // Reset to first page on search
    },
    locationFilter,
    setLocationFilter: (value: string) => {
      setLocationFilter(value);
      setPage(1);
    },
    industryFilter,
    setIndustryFilter: (value: string) => {
      setIndustryFilter(value);
      setPage(1);
    },
    clearFilters,
    // Pagination
    page,
    setPage,
    pageSize,
    refetch,
  };
}
