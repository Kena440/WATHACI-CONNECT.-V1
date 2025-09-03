import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface RequestBody {
  skills: string[];
  location?: string;
}

serve(async (req) => {
  try {
    const { skills, location } = (await req.json()) as RequestBody;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabaseClient
      .from('freelancers')
      .select('id, name, title, skills, location, profile_image_url');

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: freelancers, error } = await query;
    if (error) throw error;

    const ranked = (freelancers || []).map((f: any) => {
      const skillMatches = skills.filter((s) => (f.skills || []).includes(s));
      const match_score = skills.length
        ? Math.round((skillMatches.length / skills.length) * 100)
        : 0;
      return { ...f, match_score };
    })
    .sort((a: any, b: any) => b.match_score - a.match_score);

    return new Response(
      JSON.stringify({ freelancers: ranked }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
