import React, { memo, useMemo } from 'react';
import VirtualizedList from '@/components/ui/virtualized-list';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { User, Mail, Phone, Calendar, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';

// Lead interface - match to your API response type
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  value?: number;
  tags?: string[];
  createdAt: string;
  avatarUrl?: string;
}

interface VirtualizedLeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  onSelectLead?: (lead: Lead) => void;
}

// Status color mapping
const STATUS_COLORS = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-green-500',
  proposal: 'bg-purple-500',
  negotiation: 'bg-orange-500',
  closed: 'bg-red-500',
  won: 'bg-emerald-500',
  lost: 'bg-gray-500',
};

// Memoized lead item component
const LeadItem = memo(({ lead, onSelect }: { lead: Lead; onSelect?: (lead: Lead) => void }) => {
  // Format creation date
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(lead.createdAt), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  }, [lead.createdAt]);

  // Format value with currency
  const formattedValue = useMemo(() => {
    if (lead.value === undefined || lead.value === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(lead.value);
  }, [lead.value]);

  // Get status color class
  const statusColor = useMemo(() => {
    return STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS] || 'bg-gray-500';
  }, [lead.status]);

  return (
    <Card 
      className="w-full hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => onSelect?.(lead)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          {lead.avatarUrl ? (
            <OptimizedImage
              src={lead.avatarUrl}
              alt={lead.name}
              fill
              className="rounded-full object-cover"
              sizes="48px"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User size={24} />
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-medium text-gray-900 truncate">
              {lead.name}
            </h3>
            <Badge className={`${statusColor} text-white`}>
              {lead.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Mail size={14} />
              <span className="truncate">{lead.email}</span>
            </div>
            
            {lead.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Phone size={14} />
                <span>{lead.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <DollarSign size={14} />
              <span>{formattedValue}</span>
            </div>
          </div>
          
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lead.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lead.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
LeadItem.displayName = 'LeadItem';

// Loading component for the list
const LoadingItem = memo(() => (
  <Card className="w-full animate-pulse">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="h-12 w-12 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </CardContent>
  </Card>
));
LoadingItem.displayName = 'LoadingItem';

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="text-gray-400 mb-4">
      <User size={64} strokeWidth={1} />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">
      No leads found
    </h3>
    <p className="text-sm text-gray-500 max-w-md">
      Try adjusting your search or filter criteria, or create a new lead to get started.
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Loading state for the entire list
const ListLoading = memo(() => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <LoadingItem key={index} />
    ))}
  </div>
));
ListLoading.displayName = 'ListLoading';

// Main virtualized leads list component
const VirtualizedLeadsList = memo(({
  leads,
  isLoading,
  onLoadMore,
  hasMore,
  onSelectLead,
}: VirtualizedLeadsListProps) => {
  // Memoized render item function
  const renderLead = useCallback((lead: Lead) => (
    <div className="px-4 pb-4">
      <LeadItem lead={lead} onSelect={onSelectLead} />
    </div>
  ), [onSelectLead]);

  // Memoized key extractor
  const keyExtractor = useCallback((lead: Lead) => lead.id, []);

  // Calculate a reasonable height for the list (you may adjust this based on your layout)
  const listHeight = useMemo(() => {
    // Adjust this based on your page layout
    // This calculation assumes window height minus headers/footers
    return typeof window !== 'undefined' ? window.innerHeight - 200 : 600;
  }, []);

  return (
    <VirtualizedList
      items={leads}
      height={listHeight}
      itemHeight={150} // Adjust based on your item component height
      renderItem={renderLead}
      keyExtractor={keyExtractor}
      onEndReached={hasMore ? onLoadMore : undefined}
      endReachedThreshold={0.8}
      className="w-full"
      emptyComponent={<EmptyState />}
      loadingComponent={<div className="p-4"><LoadingItem /></div>}
      isLoading={isLoading}
      overscan={2}
    />
  );
});
VirtualizedLeadsList.displayName = 'VirtualizedLeadsList';

export default VirtualizedLeadsList;
