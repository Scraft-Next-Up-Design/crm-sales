/**
 * Database query optimization utilities for Supabase
 * Provides optimized query patterns, batching, and error handling
 */
import { supabase } from "../supabaseClient";

// Constants for optimized queries
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_BATCH_SIZE = 50;
const QUERY_TIMEOUT = 30000; // 30 seconds

/**
 * Interface for paginated query options
 */
export interface PaginatedQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  searchTerm?: string;
  searchFields?: string[];
  select?: string;
  include?: string[];
  timeout?: number;
}

/**
 * Execute query with timeout
 * @param queryPromise The query promise to execute
 * @param timeout Timeout in milliseconds
 */
export async function executeWithTimeout<T>(
  queryPromise: Promise<T>,
  timeout: number = QUERY_TIMEOUT
): Promise<T> {
  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timed out after ${timeout}ms`));
    }, timeout);
  });
  
  // Race the query against the timeout
  return Promise.race([queryPromise, timeoutPromise]);
}

/**
 * Execute paginated query with optimized parameters
 * @param table Table name
 * @param options Query options
 */
export async function executePaginatedQuery(
  table: string,
  options: PaginatedQueryOptions = {}
) {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      sortBy,
      sortDirection = 'desc',
      filters = {},
      searchTerm,
      searchFields = [],
      select = '*',
      include = [],
      timeout = QUERY_TIMEOUT,
    } = options;
    
    // Validate and limit page size
    const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
    const offset = (page - 1) * limitSize;
    
    // Start query builder
    let query = supabase
      .from(table)
      .select(select, { count: 'exact' });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply search if provided
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => {
        return `${field}.ilike.%${searchTerm}%`;
      });
      
      query = query.or(searchConditions.join(','));
    }
    
    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limitSize - 1);
    
    // Execute query with timeout
    const result = await executeWithTimeout(query, timeout);
    
    return {
      data: result.data || [],
      count: result.count || 0,
      page,
      pageSize: limitSize,
      totalPages: result.count ? Math.ceil(result.count / limitSize) : 0,
    };
  } catch (error) {
    console.error(`Error executing paginated query on ${table}:`, error);
    throw error;
  }
}

/**
 * Batch insert records for better performance
 * @param table Table name
 * @param records Records to insert
 */
export async function batchInsert(
  table: string,
  records: any[]
) {
  try {
    // No records to insert
    if (!records.length) {
      return { data: [], error: null };
    }
    
    // If records count is below max batch size, insert all at once
    if (records.length <= MAX_BATCH_SIZE) {
      return supabase.from(table).insert(records).select();
    }
    
    // Split records into batches
    const batches = [];
    for (let i = 0; i < records.length; i += MAX_BATCH_SIZE) {
      const batch = records.slice(i, i + MAX_BATCH_SIZE);
      batches.push(batch);
    }
    
    // Execute batches in sequence
    const results = [];
    for (const batch of batches) {
      const result = await supabase.from(table).insert(batch).select();
      if (result.error) {
        throw result.error;
      }
      results.push(...(result.data || []));
    }
    
    return { data: results, error: null };
  } catch (error) {
    console.error(`Error batch inserting into ${table}:`, error);
    throw error;
  }
}

/**
 * Batch update records for better performance
 * @param table Table name
 * @param records Records to update (must include ID)
 * @param idField ID field name (default: 'id')
 */
export async function batchUpdate(
  table: string,
  records: any[],
  idField: string = 'id'
) {
  try {
    // No records to update
    if (!records.length) {
      return { data: [], error: null };
    }
    
    // Ensure all records have an ID
    if (!records.every(record => record[idField])) {
      throw new Error(`All records must have an ${idField} field for batch update`);
    }
    
    // If records count is below max batch size, update all at once
    if (records.length <= MAX_BATCH_SIZE) {
      const ids = records.map(record => record[idField]);
      return supabase.from(table).upsert(records).select();
    }
    
    // Split records into batches
    const batches = [];
    for (let i = 0; i < records.length; i += MAX_BATCH_SIZE) {
      const batch = records.slice(i, i + MAX_BATCH_SIZE);
      batches.push(batch);
    }
    
    // Execute batches in sequence
    const results = [];
    for (const batch of batches) {
      const result = await supabase.from(table).upsert(batch).select();
      if (result.error) {
        throw result.error;
      }
      results.push(...(result.data || []));
    }
    
    return { data: results, error: null };
  } catch (error) {
    console.error(`Error batch updating ${table}:`, error);
    throw error;
  }
}

/**
 * Execute aggregation query with proper error handling
 * @param table Table name
 * @param aggregation Aggregation type (count, sum, avg, max, min)
 * @param column Column to aggregate
 * @param filters Filters to apply
 */
export async function executeAggregateQuery(
  table: string,
  aggregation: 'count' | 'sum' | 'avg' | 'max' | 'min',
  column: string = '*',
  filters: Record<string, any> = {}
) {
  try {
    let query = supabase.from(table);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply aggregation
    if (aggregation === 'count') {
      query = query.count(column);
    } else {
      query = query[aggregation](column);
    }
    
    // Execute query with timeout
    const result = await executeWithTimeout(query, QUERY_TIMEOUT);
    
    return result;
  } catch (error) {
    console.error(`Error executing aggregate query on ${table}:`, error);
    throw error;
  }
}

/**
 * Execute join query with proper error handling
 * @param mainTable Main table name
 * @param joins Join configurations
 * @param options Query options
 */
export async function executeJoinQuery(
  mainTable: string,
  joins: Array<{
    table: string;
    field: string;
    foreignField: string;
    type?: 'inner' | 'left' | 'right';
  }>,
  options: PaginatedQueryOptions = {}
) {
  try {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      sortBy,
      sortDirection = 'desc',
      filters = {},
      select = '*',
      timeout = QUERY_TIMEOUT,
    } = options;
    
    // Validate and limit page size
    const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);
    const offset = (page - 1) * limitSize;
    
    // Build select string with joins
    const selectQuery = joins.reduce((acc, join) => {
      const joinType = join.type || 'left';
      return `${acc}, ${join.table}:${join.table}(*)`;
    }, select);
    
    // Start query builder
    let query = supabase
      .from(mainTable)
      .select(selectQuery, { count: 'exact' });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limitSize - 1);
    
    // Execute query with timeout
    const result = await executeWithTimeout(query, timeout);
    
    return {
      data: result.data || [],
      count: result.count || 0,
      page,
      pageSize: limitSize,
      totalPages: result.count ? Math.ceil(result.count / limitSize) : 0,
    };
  } catch (error) {
    console.error(`Error executing join query on ${mainTable}:`, error);
    throw error;
  }
}

export default {
  executePaginatedQuery,
  batchInsert,
  batchUpdate,
  executeAggregateQuery,
  executeJoinQuery,
  executeWithTimeout,
};
