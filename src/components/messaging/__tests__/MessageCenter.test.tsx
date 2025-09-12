import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { MessageCenter } from '../MessageCenter';

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
      },
      functions: {
        invoke: vi.fn(),
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
    vi.clearAllMocks();
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
    const recipientInput = screen.getByLabelText(/recipient id/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const contentTextarea = screen.getByLabelText(/message content/i);
    expect(recipientInput).toBeInTheDocument();
    expect(subjectInput).toBeInTheDocument();
    expect(contentTextarea).toBeInTheDocument();

    fireEvent.change(recipientInput, { target: { value: 'u2' } });
    fireEvent.change(subjectInput, { target: { value: 'New Subject' } });
    fireEvent.change(contentTextarea, { target: { value: 'New Content' } });

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
    expect(screen.getByLabelText(/recipient id/i)).toHaveValue('');
    expect(screen.getByLabelText(/subject/i)).toHaveValue('');
    expect(screen.getByLabelText(/message content/i)).toHaveValue('');
  });
});

