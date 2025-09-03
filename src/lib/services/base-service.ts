/**
 * Base database service class providing common database operations
 * and utilities that other service classes can extend.
 */

import { supabase, withErrorHandling, withRetry } from '@/lib/supabase-enhanced';
import type { DatabaseResponse, PaginatedResponse, PaginationParams } from '@/@types/database';

export abstract class BaseService<T = any> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get a single record by ID
   */
  async findById(id: string, select: string = '*'): Promise<DatabaseResponse<T>> {
    return withErrorHandling(
      async () => await supabase
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single(),
      `${this.tableName}.findById`
    );
  }

  /**
   * Get multiple records with optional filtering and pagination
   */
  async findMany(
    filters: Record<string, any> = {},
    pagination: PaginationParams = {},
    select: string = '*'
  ): Promise<DatabaseResponse<PaginatedResponse<T>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(this.tableName)
        .select(select, { count: 'exact' })
        .range(from, to)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && key.includes('search')) {
            query = query.ilike(key.replace('_search', ''), `%${value}%`);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const result = await query;

      if (result.error) {
        const error = new Error(`${this.tableName}.findMany: ${result.error.message}`);
        console.error(error);
        return { data: null, error };
      }

      const totalCount = result.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: {
          data: result.data as T[] || [],
          count: totalCount,
          page,
          totalPages,
          hasMore: page < totalPages,
        },
        error: null,
      };
    } catch (error) {
      const wrappedError = new Error(`${this.tableName}.findMany: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(wrappedError);
      return { data: null, error: wrappedError };
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<DatabaseResponse<T>> {
    return withErrorHandling(
      async () => await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single(),
      `${this.tableName}.create`
    );
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<DatabaseResponse<T>> {
    return withErrorHandling(
      async () => await supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
      `${this.tableName}.update`
    );
  }

  /**
   * Upsert (insert or update) a record
   */
  async upsert(data: Partial<T>): Promise<DatabaseResponse<T>> {
    return withErrorHandling(
      async () => await supabase
        .from(this.tableName)
        .upsert(data)
        .select()
        .single(),
      `${this.tableName}.upsert`
    );
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<DatabaseResponse<void>> {
    return withErrorHandling(
      async () => {
        const result = await supabase
          .from(this.tableName)
          .delete()
          .eq('id', id);
        
        return { data: undefined, error: result.error };
      },
      `${this.tableName}.delete`
    );
  }

  /**
   * Soft delete a record (sets deleted_at timestamp)
   */
  async softDelete(id: string): Promise<DatabaseResponse<T>> {
    return withErrorHandling(
      async () => await supabase
        .from(this.tableName)
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single(),
      `${this.tableName}.softDelete`
    );
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<DatabaseResponse<boolean>> {
    return withErrorHandling(
      async () => {
        const result = await supabase
          .from(this.tableName)
          .select('id')
          .eq('id', id)
          .single();

        return { 
          data: !result.error && !!result.data, 
          error: null 
        };
      },
      `${this.tableName}.exists`
    );
  }

  /**
   * Count records with optional filters
   */
  async count(filters: Record<string, any> = {}): Promise<DatabaseResponse<number>> {
    return withErrorHandling(
      async () => {
        let query = supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true });

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });

        const result = await query;
        
        return { 
          data: result.count || 0, 
          error: result.error 
        };
      },
      `${this.tableName}.count`
    );
  }

  /**
   * Execute a custom query with retry logic
   */
  async executeWithRetry<R>(
    operation: () => Promise<{ data: R | null; error: any }>,
    context: string,
    maxRetries: number = 3
  ): Promise<DatabaseResponse<R>> {
    return withRetry(
      () => withErrorHandling(operation, context),
      maxRetries
    );
  }

  /**
   * Batch operations with transaction-like behavior
   */
  async batchOperation<R>(
    operations: Array<() => Promise<{ data: R | null; error: any }>>,
    context: string
  ): Promise<DatabaseResponse<R[]>> {
    try {
      const results = await Promise.all(
        operations.map(op => withErrorHandling(op, context))
      );

      // Check if any operation failed
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return {
          data: null,
          error: new Error(`Batch operation failed: ${errors.map(e => e.error?.message).join(', ')}`)
        };
      }

      return {
        data: results.map(r => r.data!),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Batch operation failed')
      };
    }
  }
}