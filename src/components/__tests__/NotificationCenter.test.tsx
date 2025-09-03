import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationCenter } from '../NotificationCenter';

// Mock AppContext to provide a user
jest.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({ user: { id: 'user1', email: 'test@example.com' } })
}));

const fakeNotifications = [
  {
    id: '1',
    type: 'test',
    title: 'Test Notification',
    message: 'Hello World',
    data: null,
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'test',
    title: 'Another Notification',
    message: 'Hi again',
    data: null,
    read: true,
    created_at: new Date().toISOString()
  }
];

const updateEqMock = jest.fn().mockResolvedValue({ data: null, error: null });

// Mock Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: fakeNotifications, error: null }),
      update: jest.fn().mockReturnValue({ eq: updateEqMock })
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
    }))
  }
}));

describe('NotificationCenter', () => {
  it('displays initial unread count and updates after marking as read', async () => {
    render(<NotificationCenter />);

    // wait for notifications to load and unread badge to show
    const badge = await screen.findByText('1');
    expect(badge).toBeInTheDocument();

    // open notification sheet
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // find mark-as-read button inside first notification card
    const title = await screen.findByText('Test Notification');
    const card = title.closest('div');
    const markButton = within(card as HTMLElement).getByRole('button');
    fireEvent.click(markButton);

    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });
});
