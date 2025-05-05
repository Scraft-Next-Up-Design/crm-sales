import { workspaceApi } from "../base/workspace";

interface WorkspaceRequest {
  id?: string; // Optional for create/update, required for delete
  name: string;
  description?: string;
  status: boolean;
}

interface WorkspaceResponse {
  [key: string]: any;
}

export const workspaceApis = workspaceApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new workspace
    createWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=createWorkspace",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Workspace"],
    }),

    // Update an existing workspace
    updateWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=updateWorkspaceDetails",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Workspace"],
    }),

    // Delete an existing workspace
    deleteWorkspace: builder.mutation<{ id: string }, { id: string }>({
      query: ({ id }) => ({
        url: `?action=deleteWorkspace`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Workspace"],
    }),

    // Fetch all workspaces
    getWorkspaces: builder.query<any, void>({
      query: () => ({
        url: "?action=getWorkspaces",
        method: "GET",
      }),
      providesTags: ["Workspace"],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    // Fetch all workspaces
    getWorkspacesById: builder.query<any, string | undefined>({
      query: (id) => ({
        url: `?action=getWorkspacesById&workspaceId=${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Workspace", id }],
      keepUnusedDataFor: 600, // 10 minutes
      skip: (id) => !id,
    }),

    // Fetch workspaces by owner ID
    getWorkspacesByOwnerId: builder.query<any, { ownerId: string }>({
      query: ({ ownerId }) => ({
        url: `?action=getWorkspaces&ownerId=${ownerId}`,
        method: "GET",
      }),
      providesTags: ["Workspace"],
    }),

    getActiveWorkspace: builder.query<any, void>({
      query: () => ({
        url: `?action=getActiveWorkspace`,
        method: "GET",
      }),
      providesTags: ["Workspace"],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    getRevenueByWorkspace: builder.query<any, string | undefined>({
      query: (id) => ({
        url: `?action=getLeadsRevenueByWorkspace&workspaceId=${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkspaceRevenue", id }],
      transformResponse: (response: any) => {
        if (!response) return { totalRevenue: 0, change: "+0%" };
        return {
          ...response,
          totalRevenue: response.totalRevenue || 0,
          change: response.change || "+0%",
        };
      },
      keepUnusedDataFor: 300, // 5 minutes
      skip: (id) => !id,
    }),

    getCountByWorkspace: builder.query<any, string | undefined>({
      query: (id) => ({
        url: `?action=getArrivedLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkspaceCount", id }],
      transformResponse: (response: any) => {
        if (!response) return { arrivedLeadsCount: 0 };
        return {
          ...response,
          arrivedLeadsCount: response.arrivedLeadsCount || 0,
        };
      },
      keepUnusedDataFor: 300, // 5 minutes
      skip: (id) => !id,
    }),

    getROCByWorkspace: builder.query<any, string | undefined>({
      query: (id) => ({
        url: `?action=getTotalLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkspaceStats", id }],
      transformResponse: (response: any) => {
        if (!response)
          return { conversion_rate: 0, monthly_stats: [], top_source_id: null };
        return {
          ...response,
          conversion_rate: response.conversion_rate || 0,
          monthly_stats: response.monthly_stats || [],
          top_source_id: response.top_source_id || null,
        };
      },
      keepUnusedDataFor: 300, // 5 minutes
      skip: (id) => !id,
    }),

    getWorkspaceMembers: builder.query<any, string | undefined>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceMembers&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Workspace", id }],
      skip: (id) => !id,
    }),

    getQualifiedCount: builder.query<any, string | undefined>({
      query: (workspaceId) => ({
        url: `?action=getQualifiedLeadsCount&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkspaceStats", id }],
      transformResponse: (response: any) => {
        if (!response) return { qualifiedLeadsCount: 0 };
        return {
          ...response,
          qualifiedLeadsCount: response.qualifiedLeadsCount || 0,
        };
      },
      keepUnusedDataFor: 300, // 5 minutes
      skip: (id) => !id,
    }),

    getWorkspaceDetailsAnalytics: builder.query<any, string | undefined>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceAnalytics&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "WorkspaceStats", id }],
      skip: (id) => !id,
    }),

    // Update the status of a workspace
    updateWorkspaceStatus: builder.mutation<
      { id: string; status: boolean },
      WorkspaceResponse
    >({
      query: ({ id, status }) => ({
        url: "?action=updateWorkspaceStatus",
        method: "PUT",
        body: { id, status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Workspace", id }],
    }),
  }),
});

// Export hooks for the workspace mutations and queries
export const {
  useGetActiveWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspacesQuery,
  useGetWorkspacesByOwnerIdQuery,
  useUpdateWorkspaceStatusMutation,
  useGetWorkspacesByIdQuery,
  useGetRevenueByWorkspaceQuery,
  useGetCountByWorkspaceQuery,
  useGetROCByWorkspaceQuery,
  useGetWorkspaceMembersQuery,
  useGetQualifiedCountQuery,
  useGetWorkspaceDetailsAnalyticsQuery,
} = workspaceApis;
