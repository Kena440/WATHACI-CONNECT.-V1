interface AnalyticsEvent {
  event: string;
  data?: Record<string, unknown>;
}

/**
 * Send analytics events to the backend.
 * Network errors are caught to avoid cascading failures.
 */
export async function track(event: string, data: Record<string, unknown> = {}): Promise<void> {
  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data } as AnalyticsEvent)
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed with status ${response.status}`);
    }
  } catch (error) {
    // Swallow network errors to prevent impacting the app
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to send analytics event', { event, data, error });
    }
  }
}

