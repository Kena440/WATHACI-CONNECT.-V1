import { track } from '@/utils/analytics';

describe('analytics track', () => {
  afterEach(() => {
    // @ts-expect-error - reset fetch after each test
    global.fetch = undefined;
    jest.resetAllMocks();
  });

  it('calls fetch with event data', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    // @ts-expect-error - mock fetch for analytics call
    global.fetch = mockFetch;

    await track('test-event', { foo: 'bar' });

    expect(mockFetch).toHaveBeenCalledWith('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'test-event', data: { foo: 'bar' } })
    });
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('network failure'));
    // @ts-expect-error - mock fetch for error handling
    global.fetch = mockFetch;

    await expect(track('error-event')).resolves.toBeUndefined();
  });
});

