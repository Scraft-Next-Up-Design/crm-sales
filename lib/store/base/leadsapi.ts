import { createApi } from "@reduxjs/toolkit/query/react";
import createSecureBaseQuery from "../../auth/secureBaseQuery";

// Tags constants for better cache management
export const LEADS_API_TAGS = {
  ALL_LEADS: 'ALL_LEADS',
  LEAD: 'LEAD',
  LEADS_BY_WORKSPACE: 'LEADS_BY_WORKSPACE',
  LEADS_STATS: 'LEADS_STATS',
};

// Create secure base query with error handling and token refresh
const secureBaseQuery = createSecureBaseQuery("/api/leads/leads");

// Better caching strategy for leads API
export const leadsApi = createApi({
  reducerPath: "/api/leads/",
  baseQuery: secureBaseQuery,
  // Improved cache management
  keepUnusedDataFor: 300, // 5 minutes cache retention for better performance
  refetchOnReconnect: true,
  refetchOnFocus: false, // Disable auto-refetch on window focus for better performance
  tagTypes: Object.values(LEADS_API_TAGS),
  endpoints: () => ({}),
});

// Helper to transform responses for consistent data structure
export const transformLeadResponse = (response: any) => {
  if (!response) return null;
  
  // Ensure consistent structure and remove any unnecessary data
  return {
    ...response,
    // Add any transformation logic here
  };
};

// Export the API
export default leadsApi;
