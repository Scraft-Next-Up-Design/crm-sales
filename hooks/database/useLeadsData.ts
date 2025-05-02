/**
 * Custom hook for optimized leads data fetching
 */
import { useCallback, useMemo } from 'react';
import { usePaginatedQuery, useAggregateQuery } from './useOptimizedQuery';

// Interface for leads filter options
export interface LeadsFilterOptions {
  workspaceId?: string;
  status?: string | string[];
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  tags?: string[];
  minValue?: number;
  maxValue?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Hook for fetching and managing leads data with optimized queries
 */
export function useLeadsData(
  initialOptions: LeadsFilterOptions = {},
  pageSize: number = 20
) {
  // Create filter object from options
  const filters = useMemo(() => {
    const result: Record<string, any> = {};
    
    // Add workspace filter
    if (initialOptions.workspaceId) {
      result.workspace_id = initialOptions.workspaceId;
    }
    
    // Add status filter (handle single or multiple)
    if (initialOptions.status) {
      if (Array.isArray(initialOptions.status)) {
        // For multiple statuses, we need to handle this differently
        // We'll use a special filter handler in the query function
        result._statusArray = initialOptions.status;
      } else {
        result.status = initialOptions.status;
      }
    }
    
    // Add date range filters
    if (initialOptions.startDate) {
      result._startDate = initialOptions.startDate;
    }
    
    if (initialOptions.endDate) {
      result._endDate = initialOptions.endDate;
    }
    
    // Add assignee filter
    if (initialOptions.assignedTo) {
      result.assigned_to = initialOptions.assignedTo;
    }
    
    // Add value range filters
    if (initialOptions.minValue !== undefined) {
      result._minValue = initialOptions.minValue;
    }
    
    if (initialOptions.maxValue !== undefined) {
      result._maxValue = initialOptions.maxValue;
    }
    
    // Add tags filter (will need special handling)
    if (initialOptions.tags && initialOptions.tags.length > 0) {
      result._tags = initialOptions.tags;
    }
    
    return result;
  }, [initialOptions]);
  
  // Set up search fields
  const searchFields = useMemo(() => [
    'name',
    'email',
    'phone',
    'company',
    'description'
  ], []);
  
  // Use the paginated query hook with our filters
  const leadsQuery = usePaginatedQuery('leads', {
    pageSize,
    filters,
    sortBy: initialOptions.sortBy || 'created_at',
    sortDirection: initialOptions.sortDirection || 'desc',
    searchTerm: initialOptions.searchTerm,
    searchFields,
  });
  
  // Get total leads count for the current filter
  const totalLeadsQuery = useAggregateQuery(
    'leads',
    'count',
    '*',
    filters
  );
  
  // Get qualified leads count
  const qualifiedLeadsQuery = useAggregateQuery(
    'leads',
    'count',
    '*',
    { ...filters, status: 'qualified' }
  );
  
  // Get total revenue (using sum)
  const totalRevenueQuery = useAggregateQuery(
    'leads',
    'sum',
    'value',
    { ...filters, status: 'won' }
  );
  
  // Function to refresh all queries
  const refreshAll = useCallback(() => {
    leadsQuery.refresh();
    totalLeadsQuery.refresh();
    qualifiedLeadsQuery.refresh();
    totalRevenueQuery.refresh();
  }, [
    leadsQuery.refresh,
    totalLeadsQuery.refresh,
    qualifiedLeadsQuery.refresh,
    totalRevenueQuery.refresh
  ]);
  
  // Calculate loading state
  const isLoading = useMemo(
    () => leadsQuery.loading || totalLeadsQuery.loading || qualifiedLeadsQuery.loading || totalRevenueQuery.loading,
    [leadsQuery.loading, totalLeadsQuery.loading, qualifiedLeadsQuery.loading, totalRevenueQuery.loading]
  );
  
  // Calculate error state
  const error = useMemo(
    () => leadsQuery.error || totalLeadsQuery.error || qualifiedLeadsQuery.error || totalRevenueQuery.error,
    [leadsQuery.error, totalLeadsQuery.error, qualifiedLeadsQuery.error, totalRevenueQuery.error]
  );
  
  // Organize data for convenient access
  const data = useMemo(() => ({
    leads: leadsQuery.data,
    totalCount: totalLeadsQuery.result?.count || 0,
    qualifiedCount: qualifiedLeadsQuery.result?.count || 0,
    totalRevenue: totalRevenueQuery.result?.sum || 0,
  }), [
    leadsQuery.data,
    totalLeadsQuery.result,
    qualifiedLeadsQuery.result,
    totalRevenueQuery.result
  ]);
  
  // Expose filter functions
  const filterActions = useMemo(() => ({
    setStatus: (status: string | string[]) => {
      if (Array.isArray(status)) {
        leadsQuery.updateFilter('_statusArray', status);
      } else {
        leadsQuery.updateFilter('status', status);
        leadsQuery.updateFilter('_statusArray', undefined);
      }
    },
    
    setDateRange: (startDate?: string, endDate?: string) => {
      leadsQuery.updateFilter('_startDate', startDate);
      leadsQuery.updateFilter('_endDate', endDate);
    },
    
    setAssignedTo: (assignedTo?: string) => {
      leadsQuery.updateFilter('assigned_to', assignedTo);
    },
    
    setValueRange: (minValue?: number, maxValue?: number) => {
      leadsQuery.updateFilter('_minValue', minValue);
      leadsQuery.updateFilter('_maxValue', maxValue);
    },
    
    setTags: (tags?: string[]) => {
      leadsQuery.updateFilter('_tags', tags && tags.length > 0 ? tags : undefined);
    },
    
    setSearch: (searchTerm?: string) => {
      leadsQuery.setSearch(searchTerm || '', searchFields);
    },
    
    setSort: (sortBy: string, sortDirection: 'asc' | 'desc' = 'desc') => {
      leadsQuery.setSort(sortBy, sortDirection);
    },
    
    resetFilters: () => {
      leadsQuery.resetQuery();
    },
  }), [leadsQuery, searchFields]);
  
  // Pagination controls
  const pagination = useMemo(() => ({
    currentPage: leadsQuery.options.page || 1,
    totalPages: leadsQuery.totalPages,
    pageSize: leadsQuery.options.pageSize || pageSize,
    totalCount: leadsQuery.totalCount,
    setPage: leadsQuery.setPage,
    setPageSize: leadsQuery.setPageSize,
    hasNextPage: (leadsQuery.options.page || 1) < leadsQuery.totalPages,
    hasPrevPage: (leadsQuery.options.page || 1) > 1,
    goToNextPage: () => leadsQuery.setPage((leadsQuery.options.page || 1) + 1),
    goToPrevPage: () => leadsQuery.setPage((leadsQuery.options.page || 1) - 1),
  }), [
    leadsQuery.options.page,
    leadsQuery.options.pageSize,
    leadsQuery.totalPages,
    leadsQuery.totalCount,
    leadsQuery.setPage,
    leadsQuery.setPageSize,
    pageSize
  ]);
  
  return {
    // Data
    ...data,
    
    // Status
    isLoading,
    error,
    
    // Actions
    ...filterActions,
    refresh: refreshAll,
    
    // Pagination
    pagination,
    
    // Raw access to underlying queries
    leadsQuery,
    totalLeadsQuery,
    qualifiedLeadsQuery,
    totalRevenueQuery,
  };
}

export default useLeadsData;
