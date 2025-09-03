import { supabase, withErrorHandling } from '@/lib/supabase-enhanced';
import type { ServiceRequest, DatabaseResponse } from '@/@types/database';

export const createRequest = (
  request: Omit<ServiceRequest, 'id' | 'created_at'>
): Promise<DatabaseResponse<ServiceRequest>> => {
  return withErrorHandling(
    () =>
      supabase
        .from('service_requests')
        .insert({ ...request, created_at: new Date().toISOString() })
        .select('*')
        .single(),
    'ServiceRequestService.createRequest'
  );
};

export const listRequests = (): Promise<DatabaseResponse<ServiceRequest[]>> => {
  return withErrorHandling(
    () =>
      supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    'ServiceRequestService.listRequests'
  );
};
