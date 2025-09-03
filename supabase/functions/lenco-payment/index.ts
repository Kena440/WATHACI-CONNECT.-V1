import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface RequestBody {
  amount: number;
  paymentMethod: string;
  phoneNumber?: string;
  provider?: string;
  description: string;
}

serve(async (req) => {
  try {
    const { amount, paymentMethod, phoneNumber, provider, description } = (await req.json()) as RequestBody;

    const baseUrl = Deno.env.get('LENCO_API_BASE_URL');
    const apiKey = Deno.env.get('LENCO_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new Error('Lenco API credentials not configured');
    }

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
        provider,
        description,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || 'Payment failed');
    }

    return new Response(
      JSON.stringify({ success: true, transaction_id: result.transaction_id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
