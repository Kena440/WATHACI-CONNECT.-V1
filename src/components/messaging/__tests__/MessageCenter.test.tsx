import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { MessageCenter } from '../MessageCenter';

jest.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: jest.fn(),
      },
      functions: {
        invoke: jest.fn(),
      },
    },
  };
});

import { supabase } from '@/lib/supabase';

describe('MessageCenter', () => {
  const mockMessages = [
    {
      id: '1',
      subject: 'Hello',
      content: 'Hi there',
      read: false,
      created_at: '2024-01-01T00:00:00Z',
      sender: { id: 's1', full_name: 'Alice' },
      recipient: { id: 'u1', full_name: 'Bob' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.functions.invoke as any)
      .mockResolvedValueOnce({ data: { messages: mockMessages }, error: null })
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: { messages: mockMessages }, error: null });
  });

  it('renders messages, sends new message, and resets form', async () => {
    render(<MessageCenter />);

    // Messages render
    expect(await screen.findByText('Hello')).toBeInTheDocument();

    // Compose message
    fireEvent.click(screen.getByRole('button', { name: /compose/i }));
    fireEvent.change(screen.getByPlaceholderText('Recipient ID'), { target: { value: 'u2' } });
    fireEvent.change(screen.getByPlaceholderText('Subject'), { target: { value: 'New Subject' } });
    fireEvent.change(screen.getByPlaceholderText('Message content...'), { target: { value: 'New Content' } });

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'messaging-system',
        expect.objectContaining({
          body: expect.objectContaining({
            action: 'send_message',
            sender_id: 'u1',
            recipient_id: 'u2',
            subject: 'New Subject',
            content: 'New Content',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/compose message/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /compose/i }));
    expect(screen.getByPlaceholderText('Recipient ID')).toHaveValue('');
    expect(screen.getByPlaceholderText('Subject')).toHaveValue('');
    expect(screen.getByPlaceholderText('Message content...')).toHaveValue('');
  });
});

