/**
 * Service Request service for handling service request operations
 */

import { BaseService } from './base-service';
import { supabase, withErrorHandling } from '@/lib/supabase-enhanced';
import type { ServiceRequest, DatabaseResponse } from '@/@types/database';

export class ServiceRequestService extends BaseService<ServiceRequest> {
  constructor() {
    super('service_requests');
  }

  /**
   * Get service requests submitted by a specific user
   */
  async getRequestsByUser(userId: string): Promise<DatabaseResponse<ServiceRequest[]>> {
    return withErrorHandling(
      () =>
        supabase
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      'ServiceRequestService.getRequestsByUser'
    );
  }

  /**
   * Create a new service request
   */
  async createRequest(
    request: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DatabaseResponse<ServiceRequest>> {
    return this.create(request);
  }

  /**
   * Update an existing service request
   */
  async updateRequest(
    id: string,
    data: Partial<ServiceRequest>
  ): Promise<DatabaseResponse<ServiceRequest>> {
    return this.update(id, data);
  }

  /**
   * Delete a service request
   */
  async deleteRequest(id: string): Promise<DatabaseResponse<void>> {
    return super.delete(id);
  }
}

export const serviceRequestService = new ServiceRequestService();
