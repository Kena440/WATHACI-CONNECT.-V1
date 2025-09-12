// Integration tests for funding-data API client

const mockData = [
  {
    id: '1',
    title: 'Test',
    organization: 'Org',
    description: 'Desc',
    amount: 1000,
    deadline: '2024-01-01',
    sectors: ['tech'],
    countries: ['zambia'],
    type: 'Grant',
    requirements: [],
  },
];

describe('funding-data API client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  it('retrieves funding opportunities', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const { fetchFundingOpportunities } = await import(
      '../../../backend/supabase-functions/funding-data'
    );

    const data = await fetchFundingOpportunities();
    expect(data).toEqual(mockData);
  });

  it('handles funding opportunity errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;

    const { fetchFundingOpportunities } = await import(
      '../../../backend/supabase-functions/funding-data'
    );

    await expect(fetchFundingOpportunities()).rejects.toThrow(
      'Failed to fetch funding_opportunities'
    );
  });

  it('retrieves professionals', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const { fetchProfessionals } = await import(
      '../../../backend/supabase-functions/funding-data'
    );

    const data = await fetchProfessionals();
    expect(data).toEqual(mockData);
  });
});

