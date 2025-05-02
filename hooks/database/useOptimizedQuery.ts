/**
 * React hooks for optimized Supabase queries
 * Provides React-friendly wrappers around database query optimizers
 */
import { useState, useCallback, useEffect } from 'react';
import { 
  executePaginatedQuery, 
  executeAggregateQuery, 
  executeJoinQuery,
  PaginatedQueryOptions 
} from '@/lib/database/queryOptimizer';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook for paginated queries with sorting, filtering, and search
 */
export function usePaginatedQuery(
  table: string,
  initialOptions: PaginatedQueryOptions = {}
) {
  // State for query options
  const [options, setOptions] = useState<PaginatedQueryOptions>({
    page: 1,
    pageSize: 20,
    sortBy: undefined,
    sortDirection: 'desc',
    filters: {},
    searchTerm: undefined,
    searchFields: [],
    ...initialOptions,
  });
  
  // State for query results
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to execute the query
  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await executePaginatedQuery(table, options);
      setData(result.data);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err);
      console.error('Error executing paginated query:', err);
    } finally {
      setLoading(false);
    }
  }, [table, options]);
  
  // Execute query on mount and when options change
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);
  
  // Function to set page
  const setPage = useCallback((page: number) => {
    setOptions(prev => ({ ...prev, page }));
  }, []);
  
  // Function to set page size
  const setPageSize = useCallback((pageSize: number) => {
    setOptions(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);
  
  // Function to set sort
  const setSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc' = 'desc') => {
    setOptions(prev => ({ ...prev, sortBy, sortDirection, page: 1 }));
  }, []);
  
  // Function to set filters
  const setFilters = useCallback((filters: Record<string, any>) => {
    setOptions(prev => ({ ...prev, filters, page: 1 }));
  }, []);
  
  // Function to update a single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1
    }));
  }, []);
  
  // Function to set search
  const setSearch = useCallback((searchTerm: string, searchFields: string[] = []) => {
    setOptions(prev => ({ ...prev, searchTerm, searchFields, page: 1 }));
  }, []);
  
  // Function to reset options
  const resetQuery = useCallback(() => {
    setOptions({
      page: 1,
      pageSize: initialOptions.pageSize || 20,
      sortBy: initialOptions.sortBy,
      sortDirection: initialOptions.sortDirection || 'desc',
      filters: initialOptions.filters || {},
      searchTerm: initialOptions.searchTerm,
      searchFields: initialOptions.searchFields || [],
    });
  }, [initialOptions]);
  
  // Function to refresh the query
  const refresh = useCallback(() => {
    executeQuery();
  }, [executeQuery]);
  
  return {
    // Data
    data,
    totalCount,
    totalPages,
    loading,
    error,
    
    // Current options
    options,
    
    // Actions
    setPage,
    setPageSize,
    setSort,
    setFilters,
    updateFilter,
    setSearch,
    resetQuery,
    refresh,
    
    // Raw actions
    setOptions,
    executeQuery,
  };
}

/**
 * Hook for aggregate queries (count, sum, avg, etc.)
 */
export function useAggregateQuery(
  table: string,
  aggregation: 'count' | 'sum' | 'avg' | 'max' | 'min',
  column: string = '*',
  filters: Record<string, any> = {}
) {
  // State
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to execute the query
  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryResult = await executeAggregateQuery(table, aggregation, column, filters);
      setResult(queryResult);
    } catch (err: any) {
      setError(err);
      console.error('Error executing aggregate query:', err);
    } finally {
      setLoading(false);
    }
  }, [table, aggregation, column, filters]);
  
  // Execute query on mount and when dependencies change
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);
  
  // Function to refresh the query
  const refresh = useCallback(() => {
    executeQuery();
  }, [executeQuery]);
  
  return {
    result,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for join queries
 */
export function useJoinQuery(
  mainTable: string,
  joins: Array<{
    table: string;
    field: string;
    foreignField: string;
    type?: 'inner' | 'left' | 'right';
  }>,
  initialOptions: PaginatedQueryOptions = {}
) {
  // State for query options
  const [options, setOptions] = useState<PaginatedQueryOptions>({
    page: 1,
    pageSize: 20,
    sortBy: undefined,
    sortDirection: 'desc',
    filters: {},
    ...initialOptions,
  });
  
  // State for query results
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to execute the query
  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await executeJoinQuery(mainTable, joins, options);
      setData(result.data);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err);
      console.error('Error executing join query:', err);
    } finally {
      setLoading(false);
    }
  }, [mainTable, joins, options]);
  
  // Execute query on mount and when options change
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);
  
  // Function to set page
  const setPage = useCallback((page: number) => {
    setOptions(prev => ({ ...prev, page }));
  }, []);
  
  // Function to set page size
  const setPageSize = useCallback((pageSize: number) => {
    setOptions(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);
  
  // Function to set sort
  const setSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc' = 'desc') => {
    setOptions(prev => ({ ...prev, sortBy, sortDirection, page: 1 }));
  }, []);
  
  // Function to set filters
  const setFilters = useCallback((filters: Record<string, any>) => {
    setOptions(prev => ({ ...prev, filters, page: 1 }));
  }, []);
  
  // Function to update a single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1
    }));
  }, []);
  
  // Function to reset options
  const resetQuery = useCallback(() => {
    setOptions({
      page: 1,
      pageSize: initialOptions.pageSize || 20,
      sortBy: initialOptions.sortBy,
      sortDirection: initialOptions.sortDirection || 'desc',
      filters: initialOptions.filters || {},
    });
  }, [initialOptions]);
  
  // Function to refresh the query
  const refresh = useCallback(() => {
    executeQuery();
  }, [executeQuery]);
  
  return {
    // Data
    data,
    totalCount,
    totalPages,
    loading,
    error,
    
    // Current options
    options,
    
    // Actions
    setPage,
    setPageSize,
    setSort,
    setFilters,
    updateFilter,
    resetQuery,
    refresh,
    
    // Raw actions
    setOptions,
    executeQuery,
  };
}

/**
 * Hook for real-time data subscription with optimized updates
 */
export function useRealtimeQuery(
  table: string,
  options: PaginatedQueryOptions = {}
) {
  // Use paginated query hook for initial data loading
  const paginatedQuery = usePaginatedQuery(table, options);
  
  // State for subscription
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  
  // Set up real-time subscription
  useEffect(() => {
    // Don't subscribe if no data
    if (!paginatedQuery.data.length) return;
    
    // Extract ids for subscription filter
    const ids = paginatedQuery.data.map(item => item.id);
    
    // Create subscription
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: `id=in.(${ids.join(',')})`,
      }, (payload) => {
        // Handle updates based on event type
        if (payload.eventType === 'INSERT') {
          // Add new record if it matches filters
          const newRecord = payload.new;
          const filters = paginatedQuery.options.filters || {};
          
          const matchesFilters = Object.entries(filters).every(([key, value]) => {
            return newRecord[key] === value;
          });
          
          if (matchesFilters) {
            paginatedQuery.refresh();
          }
        } else if (payload.eventType === 'UPDATE') {
          // Update existing record
          const updatedRecord = payload.new;
          
          paginatedQuery.setData(prevData => prevData.map(item => 
            item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item
          ));
        } else if (payload.eventType === 'DELETE') {
          // Remove deleted record
          const deletedId = payload.old.id;
          
          paginatedQuery.setData(prevData => prevData.filter(item => 
            item.id !== deletedId
          ));
          
          // Update count
          if (paginatedQuery.totalCount > 0) {
            paginatedQuery.setTotalCount(prevCount => prevCount - 1);
          }
        }
      })
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
      setIsSubscribed(false);
    };
  }, [table, paginatedQuery.data, paginatedQuery.options.filters]);
  
  return {
    ...paginatedQuery,
    isSubscribed,
  };
}

export default {
  usePaginatedQuery,
  useAggregateQuery,
  useJoinQuery,
  useRealtimeQuery,
};
