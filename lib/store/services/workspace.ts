import { workspaceApi, WORKSPACE_API_TAGS, transformWorkspaceResponse } from "../base/workspace";

// Better typed interfaces for workspace entities
interface WorkspaceRequest {
  id?: string; 
  name: string;
  description?: string;
  status: boolean;
}

interface WorkspaceResponse {
  [key: string]: any;
}

// Improved interface for workspace analytics
interface WorkspaceAnalytics {
  totalRevenue?: number;
  leadsCount?: number;
  conversionRate?: number;
  qualifiedLeadsCount?: number;
  monthlyStats?: Array<{
    month: string;
    convertedLeads: number;
  }>;
  change?: string;
  top_source_id?: string;
}

export const workspaceApis = workspaceApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create workspace with proper cache invalidation
    createWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=createWorkspace",
        method: "POST",
        body: data,
      }),
      // Invalidate relevant cache tags when a new workspace is created
      invalidatesTags: [WORKSPACE_API_TAGS.ALL_WORKSPACES],
    }),

    // Update workspace with proper cache invalidation
    updateWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=updateWorkspaceDetails",
        method: "PUT",
        body: data,
      }),
      // Invalidate specific workspace and potentially the active workspace
      invalidatesTags: (result, error, arg) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE, id: arg.id },
        WORKSPACE_API_TAGS.ALL_WORKSPACES,
        WORKSPACE_API_TAGS.ACTIVE_WORKSPACE
      ],
    }),

    // Delete workspace with proper cache invalidation
    deleteWorkspace: builder.mutation<{ id: string }, { id: string }>({
      query: ({ id }) => ({
        url: `?action=deleteWorkspace`,
        method: "DELETE",
        body: { id },
      }),
      // Invalidate all workspaces and remove the specific one
      invalidatesTags: (result, error, { id }) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE, id },
        WORKSPACE_API_TAGS.ALL_WORKSPACES,
        WORKSPACE_API_TAGS.ACTIVE_WORKSPACE
      ],
    }),

    // Get all workspaces with proper caching
    getWorkspaces: builder.query<any, void>({
      query: () => ({
        url: "?action=getWorkspaces",
        method: "GET",
      }),
      transformResponse: (response) => {
        // Transform response for consistency
        if (!response?.data) return [];
        return response.data.map(transformWorkspaceResponse);
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ 
                type: WORKSPACE_API_TAGS.WORKSPACE as const, 
                id 
              })),
              { type: WORKSPACE_API_TAGS.ALL_WORKSPACES, id: 'LIST' }
            ]
          : [{ type: WORKSPACE_API_TAGS.ALL_WORKSPACES, id: 'LIST' }],
    }),

    // Get workspace by ID with proper cache tag
    getWorkspacesById: builder.query<any, string>({
      query: (id) => ({
        url: `?action=getWorkspacesById&workspaceId=${id}`,
        method: "GET",
      }),
      transformResponse: transformWorkspaceResponse,
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE, id }
      ],
    }),

    // Get workspaces by owner with proper cache tags
    getWorkspacesByOwnerId: builder.query<any, { ownerId: string }>({
      query: ({ ownerId }) => ({
        url: `?action=getWorkspaces&ownerId=${ownerId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.data) return [];
        return response.data.map(transformWorkspaceResponse);
      },
      providesTags: (result) => [
        { type: WORKSPACE_API_TAGS.ALL_WORKSPACES, id: 'LIST' }
      ],
    }),

    // Get active workspace with dedicated cache tag
    getActiveWorkspace: builder.query<any, void>({
      query: () => ({
        url: `?action=getActiveWorkspace`,
        method: "GET",
      }),
      transformResponse: transformWorkspaceResponse,
      providesTags: [WORKSPACE_API_TAGS.ACTIVE_WORKSPACE],
    }),

    // Analytics queries with dedicated tags and longer cache times
    getRevenueByWorkspace: builder.query<any, string>({
      query: (id) => ({
        url: `?action=getLeadsRevenueByWorkspace&workspaceId=${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 600, // 10 minutes for analytics data
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_ANALYTICS, id: `revenue-${id}` }
      ],
    }),

    getCountByWorkspace: builder.query<any, string>({
      query: (id) => ({
        url: `?action=getArrivedLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 600, // 10 minutes for analytics data
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_ANALYTICS, id: `count-${id}` }
      ],
    }),

    getROCByWorkspace: builder.query<WorkspaceAnalytics, string>({
      query: (id) => ({
        url: `?action=getTotalLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 600, // 10 minutes for analytics data
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_ANALYTICS, id: `roc-${id}` }
      ],
    }),

    // Get workspace members with dedicated tag
    getWorkspaceMembers: builder.query<any, string>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceMembers&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      providesTags: (result, error, workspaceId) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_MEMBERS, id: workspaceId }
      ],
    }),

    // Analytics queries continue
    getQualifiedCount: builder.query<any, string>({
      query: (workspaceId) => ({
        url: `?action=getQualifiedLeadsCount&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 600, // 10 minutes for analytics data
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_ANALYTICS, id: `qualified-${id}` }
      ],
    }),

    getWorkspaceDetailsAnalytics: builder.query<any, string>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceAnalytics&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 600, // 10 minutes for analytics data
      providesTags: (result, error, id) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE_ANALYTICS, id: `details-${id}` }
      ],
    }),

    // Update workspace status with proper cache invalidation
    updateWorkspaceStatus: builder.mutation<
      { id: string; status: boolean },
      WorkspaceResponse
    >({
      query: ({ id, status }) => ({
        url: "?action=updateWorkspaceStatus",
        method: "PUT",
        body: { id, status },
      }),
      // Invalidate specific workspace and active workspace
      invalidatesTags: (result, error, { id }) => [
        { type: WORKSPACE_API_TAGS.WORKSPACE, id },
        WORKSPACE_API_TAGS.ALL_WORKSPACES,
        WORKSPACE_API_TAGS.ACTIVE_WORKSPACE
      ],
    }),
  }),
  overrideExisting: false,
});

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
