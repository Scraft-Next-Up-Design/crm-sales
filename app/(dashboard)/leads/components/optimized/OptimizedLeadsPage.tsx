'use client';

import { useState, useCallback, useMemo } from 'react';
import { useLeadsData } from '@/hooks/database/useLeadsData';
import VirtualizedLeadsList from '../VirtualizedLeadsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetActiveWorkspaceQuery } from '@/lib/store/services/workspace';
import { debounce } from '@/utils/performance';

// Lead status options
const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'value-desc', label: 'Value (High-Low)' },
  { value: 'value-asc', label: 'Value (Low-High)' },
];

/**
 * Optimized leads page component using virtualization and efficient database queries
 */
export default function OptimizedLeadsPage() {
  // Get active workspace
  const { data: activeWorkspaceData } = useGetActiveWorkspaceQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  const workspaceId = activeWorkspaceData?.data?.id;
  
  // Filter state
  const [currentStatus, setCurrentStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('created_at-desc');
  
  // Extract sort parameters from the selected option
  const sortParams = useMemo(() => {
    const [sortBy, sortDirection] = sortOption.split('-');
    return {
      sortBy,
      sortDirection: sortDirection as 'asc' | 'desc'
    };
  }, [sortOption]);
  
  // Use the optimized leads data hook
  const {
    leads,
    isLoading,
    totalCount,
    qualifiedCount,
    totalRevenue,
    pagination,
    setStatus,
    setSearch,
    setSort,
    refresh
  } = useLeadsData({
    workspaceId,
    status: currentStatus === 'all' ? undefined : currentStatus,
    searchTerm,
    ...sortParams
  });
  
  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    [setSearch]
  );
  
  // Handle status change
  const handleStatusChange = useCallback((value: string) => {
    setCurrentStatus(value);
    setStatus(value === 'all' ? undefined : value);
  }, [setStatus]);
  
  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
    const [sortBy, sortDirection] = value.split('-');
    setSort(sortBy, sortDirection as 'asc' | 'desc');
  }, [setSort]);
  
  // Handle lead selection
  const handleSelectLead = useCallback((lead: any) => {
    // Implementation for lead selection (e.g., navigation or modal)
    console.log('Selected lead:', lead);
  }, []);
  
  // Handle load more for virtualized list
  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage) {
      pagination.goToNextPage();
    }
  }, [pagination]);
  
  return (
    <div className="space-y-6 p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Leads"
          value={totalCount}
          loading={isLoading}
          icon={<Badge className="bg-blue-500">All</Badge>}
        />
        <StatsCard
          title="Qualified Leads"
          value={qualifiedCount}
          loading={isLoading}
          icon={<Badge className="bg-green-500">Qualified</Badge>}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          loading={isLoading}
          icon={<Badge className="bg-emerald-500">Won</Badge>}
        />
      </div>
      
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search leads..."
            className="pl-10"
            defaultValue={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearchChange(e.target.value);
            }}
          />
        </div>
        
        <Select
          value={currentStatus}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={sortOption}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => refresh()}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      
      {/* Leads List */}
      <div className="bg-white rounded-lg shadow">
        <VirtualizedLeadsList
          leads={leads}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          hasMore={pagination.hasNextPage}
          onSelectLead={handleSelectLead}
        />
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {leads.length} of {totalCount} leads
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.goToPrevPage}
            disabled={!pagination.hasPrevPage}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages || 1}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.goToNextPage}
            disabled={!pagination.hasNextPage}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon?: React.ReactNode;
}

function StatsCard({ title, value, loading, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
