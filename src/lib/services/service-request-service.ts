/**
 * Service Request service for handling service request operations
 */

import { BaseService } from './base-service';
import type {
  ServiceRequest,
  DatabaseResponse,
  PaginatedResponse,
  PaginationParams
} from '@/@types/database';

export class ServiceRequestService extends BaseService<ServiceRequest> {
  constructor() {
    super('service_requests');
  }

  create(data: Partial<ServiceRequest>): Promise<DatabaseResponse<ServiceRequest>> {
    return super.create(data);
  }

  findMany(
    filters: Record<string, any> = {},
    pagination: PaginationParams = {},
    select: string = '*'
  ): Promise<DatabaseResponse<PaginatedResponse<ServiceRequest>>> {
    return super.findMany(filters, pagination, select);
  }

  findById(id: string, select: string = '*'): Promise<DatabaseResponse<ServiceRequest>> {
    return super.findById(id, select);
  }

  delete(id: string): Promise<DatabaseResponse<void>> {
    return super.delete(id);
  }
}

export const serviceRequestService = new ServiceRequestService();

export default serviceRequestService;
