'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedLeadsPage from '../components/optimized/OptimizedLeadsPage';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetActiveWorkspaceQuery 
} from '@/lib/store/services/workspace';

// Loading component
function LeadsPageLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Skeleton Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Skeleton Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Skeleton List */}
      <Card>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-0">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Skeleton Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2 items-center">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
      <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-lg w-full text-center">
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-sm mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Parent component with workspace check
export default function OptimizedLeadsPageWrapper() {
  const router = useRouter();
  
  // Check if user has an active workspace
  const { data: workspace, isLoading: isWorkspaceLoading, error: workspaceError } = 
    useGetActiveWorkspaceQuery(undefined, {
      refetchOnMountOrArgChange: true
    });
  
  // Handle workspace loading
  if (isWorkspaceLoading) {
    return <LeadsPageLoading />;
  }
  
  // Handle workspace error or no active workspace
  if (workspaceError || !workspace?.data?.id) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg max-w-lg w-full text-center">
          <h3 className="text-lg font-medium mb-2">Workspace Required</h3>
          <p className="text-sm mb-4">
            You need an active workspace to view leads. Please create or select a workspace.
          </p>
          <button
            onClick={() => router.push('/workspace')}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded transition-colors"
          >
            Go to Workspaces
          </button>
        </div>
      </div>
    );
  }
  
  // Render optimized leads page with error boundary and suspense
  return (
    <React.Fragment>
      {/* 
        Note: In a real implementation, we'd use an actual ErrorBoundary component, 
        but for simplicity we're not adding that dependency in this example.
      */}
      <Suspense fallback={<LeadsPageLoading />}>
        <OptimizedLeadsPage />
      </Suspense>
    </React.Fragment>
  );
}
