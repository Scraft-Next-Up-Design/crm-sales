import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabaseClient";

export const workspaceApi = createApi({
  reducerPath: "/api/workspace/",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/workspace/workspace",
    prepareHeaders: async (headers) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set("authorization", `Bearer ${session.access_token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Workspace",
    "WorkspaceStats",
    "WorkspaceRevenue",
    "WorkspaceCount",
  ],
  endpoints: () => ({}),
  keepUnusedDataFor: 300, // Increase cache time to 5 minutes
  refetchOnReconnect: true,
  refetchOnFocus: false, // Only refetch when explicitly needed
});
