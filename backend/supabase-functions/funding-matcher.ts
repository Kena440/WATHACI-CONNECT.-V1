import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fundingOpportunities } from './funding-data.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BusinessProfile {
  businessType: string;
  sector: string;
  stage?: string;
  location: string;
  employees?: string;
}

interface FundingNeeds {
  amount: string;
  purpose?: string;
  timeline?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { businessProfile, fundingNeeds }: { businessProfile: BusinessProfile; fundingNeeds: FundingNeeds } = await req.json();

    const matches = fundingOpportunities.map((opp) => {
      let score = 0;
      const reasons: string[] = [];

      if (opp.sectors.includes(businessProfile.sector.toLowerCase()) || opp.sectors.includes('all')) {
        score += 40;
        reasons.push(`Matches sector ${businessProfile.sector}`);
      }

      if (opp.countries.includes(businessProfile.location.toLowerCase())) {
        score += 30;
        reasons.push(`Available in ${businessProfile.location}`);
      }

      const amount = parseFloat(fundingNeeds.amount);
      if (!isNaN(amount) && amount <= opp.amount) {
        score += 30;
        reasons.push('Requested amount within limit');
      }

      return {
        title: opp.title,
        provider: opp.organization,
        description: opp.description,
        max_amount: opp.amount,
        funding_type: opp.type,
        application_deadline: opp.deadline,
        match_score: score,
        reasoning: reasons.join('; ')
      };
    })
    .filter(match => match.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Funding matcher error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
