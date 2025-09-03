import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface RequestBody {
  title: string;
  description: string;
  willing_to_pay: boolean;
  budget?: number;
}

serve(async (req) => {
  try {
    const { title, description } = (await req.json()) as RequestBody;

    const keywords = `${title} ${description}`
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: freelancers, error } = await supabaseClient
      .from('freelancers')
      .select('id, name, title, skills, location, profile_image_url');

    if (error) throw error;

    const ranked = (freelancers || [])
      .map((f: any) => {
        const skillMatches = (f.skills || []).filter((s: string) =>
          keywords.includes(s.toLowerCase())
        );
        const match_score = keywords.length
          ? Math.round((skillMatches.length / keywords.length) * 100)
          : 0;
        return { ...f, match_score };
      })
      .sort((a: any, b: any) => b.match_score - a.match_score);

    return new Response(JSON.stringify({ freelancers: ranked }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

