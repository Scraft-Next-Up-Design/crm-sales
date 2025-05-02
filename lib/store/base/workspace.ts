import { createApi } from "@reduxjs/toolkit/query/react";
import createSecureBaseQuery from "../../auth/secureBaseQuery";

// Tag constants for better cache management
export const WORKSPACE_API_TAGS = {
  WORKSPACE: 'WORKSPACE',
  ALL_WORKSPACES: 'ALL_WORKSPACES',
  WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS',
  WORKSPACE_ANALYTICS: 'WORKSPACE_ANALYTICS',
  ACTIVE_WORKSPACE: 'ACTIVE_WORKSPACE',
};

// Create secure base query with error handling and token refresh
const secureBaseQuery = createSecureBaseQuery("/api/workspace/workspace");

export const workspaceApi = createApi({
  reducerPath: "/api/workspace/",
  baseQuery: secureBaseQuery,
  tagTypes: Object.values(WORKSPACE_API_TAGS),
  keepUnusedDataFor: 300, // 5 minutes for better performance
  refetchOnReconnect: true,
  refetchOnFocus: false, // Disable auto-refetch on window focus to reduce unnecessary API calls
  endpoints: () => ({}),
});

// Helper to transform workspace responses for consistent data structure
export const transformWorkspaceResponse = (response: any) => {
  if (!response) return null;
  
  // Ensure consistent structure for workspace data
  return {
    ...response,
    // Add any transformation logic here
  };
};

// Export the API
export default workspaceApi;
