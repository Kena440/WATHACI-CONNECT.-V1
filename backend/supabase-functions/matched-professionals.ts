import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fetchProfessionals, fetchFundingOpportunities } from './funding-data.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { opportunityId } = await req.json();
    const opportunities = await fetchFundingOpportunities();
    const opportunity = opportunities.find(o => o.id === opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const profs = await fetchProfessionals();
    const matches = profs.map((prof) => {
      const overlap = prof.expertise.filter(skill =>
        opportunity.sectors.includes(skill.toLowerCase()) || opportunity.sectors.includes('all')
      );
      const matchScore = Math.round((overlap.length / opportunity.sectors.length) * 100);
      return { ...prof, matchScore };
    }).filter(p => p.matchScore > 0);

    return new Response(
      JSON.stringify({ professionals: matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Matched professionals error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
