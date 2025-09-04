interface AnalyticsEvent {
  event: string;
  data?: Record<string, unknown>;
}

// Helper function to get environment mode, Jest-compatible
function getEnvMode(): string {
  // Check if we're in a Jest environment
  if (typeof jest !== 'undefined' || process.env.NODE_ENV === 'test') {
    return process.env.NODE_ENV || 'test';
  }
  // For browser/Vite environment, use string eval to avoid Jest parsing issues
  return eval('import.meta.env.MODE');
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
    if (getEnvMode() !== 'production') {
      console.error('Failed to send analytics event', { event, data, error });
    }
  }
}

