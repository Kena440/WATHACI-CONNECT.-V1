import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fundingOpportunities } from './funding-data.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function fetchGrantsGov() {
  const url = 'https://www.grants.gov/grantsws/rest/opportunities/search?keyword=Zambia&startRecordNum=0&sortBy=closeDate&orderBy=asc';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch grants.gov');
  const data = await res.json();
  return (data.opportunities?.opportunity || []).map((opp: any) => ({
    id: opp.id || opp.opportunityId,
    title: opp.title || opp.opportunityTitle,
    organization: opp.agency || opp.agencyName,
    amount: 'See notice',
    deadline: opp.closeDate || opp.closeDateDisplay,
    sectors: ['all'],
    countries: ['zambia'],
    type: 'Grant',
    matchScore: 50,
    successRate: 0.5,
    requirements: []
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    if (action !== 'fetch_live_opportunities') {
      throw new Error('Unknown action');
    }

    let opportunities = [];
    try {
      opportunities = await fetchGrantsGov();
    } catch (err) {
      console.error('External fetch failed, using static data:', err);
      opportunities = fundingOpportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        amount: `Up to $${opp.amount.toLocaleString()}`,
        deadline: opp.deadline,
        sectors: opp.sectors,
        countries: opp.countries,
        type: opp.type,
        matchScore: 80,
        successRate: 0.6,
        requirements: opp.requirements
      }));
    }

    return new Response(
      JSON.stringify({ opportunities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Live funding matcher error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
