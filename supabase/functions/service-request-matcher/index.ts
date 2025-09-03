import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { title, description, is_paid, budget } = await req.json();

  const freelancers = [
    { id: "1", name: "Jane Doe", title: "Web Developer", match_score: 92 },
    { id: "2", name: "John Smith", title: "Designer", match_score: 88 }
  ];

  return new Response(
    JSON.stringify({ freelancers }),
    { headers: { "Content-Type": "application/json" } }
  );
});
