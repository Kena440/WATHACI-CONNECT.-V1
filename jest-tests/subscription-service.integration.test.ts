const mockSingle = jest.fn();

jest.mock('@/lib/supabase-enhanced', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockSingle,
    })),
  },
  withErrorHandling: async (operation: any) => operation(),
}));

jest.mock('@/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { SubscriptionService } from '@/lib/services/subscription-service';

describe('SubscriptionService payment status integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates payment_status from pending to paid after activation', async () => {
    const service = new SubscriptionService();

    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'sub1', payment_status: 'pending', status: 'pending' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'sub1', payment_status: 'paid', status: 'active' },
        error: null,
      });

    const { data: pending } = await service.createSubscription('user1', 'plan1');
    expect(pending?.payment_status).toBe('pending');

    const { data: paid } = await service.activateSubscription('sub1');
    expect(paid?.payment_status).toBe('paid');
  });
});
