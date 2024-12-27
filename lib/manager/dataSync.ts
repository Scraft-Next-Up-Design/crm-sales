import { QueryClient } from '@tanstack/react-query';
import { Source } from './types';

export class DataSyncManager {
  private queryClient: QueryClient;
  private sourceKeys: string[];

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.sourceKeys = ['webhooks', 'webhookTypes', 'webhookStats'];
  }

  // Invalidate and refetch all related queries
  invalidateAll() {
    this.sourceKeys.forEach(key => {
      this.queryClient.invalidateQueries({ queryKey: [key] });
    });
  }

  // Update cache optimistically
  updateCache(key: string, updater: (old: any) => any) {
    this.queryClient.setQueryData([key], updater);
  }
}