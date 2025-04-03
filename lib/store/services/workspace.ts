import { workspaceApi } from "../base/workspace";

interface WorkspaceRequest {
  id?: string; 
  name: string;
  description?: string;
  status: boolean;
}

interface WorkspaceResponse {
  [key: string]: any;
}

export const workspaceApis = workspaceApi.injectEndpoints({
  endpoints: (builder) => ({
    createWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=createWorkspace",
        method: "POST",
        body: data,
      }),
    }),

    updateWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=updateWorkspaceDetails",
        method: "PUT",
        body: data,
      }),
    }),

    deleteWorkspace: builder.mutation<{ id: string }, { id: string }>({
      query: ({ id }) => ({
        url: `?action=deleteWorkspace`,
        method: "DELETE",
        body: { id },
      }),
    }),

    getWorkspaces: builder.query<any, void>({
      query: () => ({
        url: "?action=getWorkspaces",
        method: "GET",
      }),
    }),
    getWorkspacesById: builder.query<any, void>({
      query: (id) => ({
        url: `?action=getWorkspacesById&workspaceId=${id}`,
        method: "GET",
      }),
    }),
    getWorkspacesByOwnerId: builder.query<any, { ownerId: string }>({
      query: ({ ownerId }) => ({
        url: `?action=getWorkspaces&ownerId=${ownerId}`,
        method: "GET",
      }),
    }),
    getActiveWorkspace: builder.query<any, void>({
      query: () => ({
        url: `?action=getActiveWorkspace`,
        method: "GET",
      }),
    }),
    getRevenueByWorkspace: builder.query<any, void>({
      query: (id) => ({
        url: `?action=getLeadsRevenueByWorkspace&workspaceId=${id}`,
        method: "GET",
      }),
    }),
    getCountByWorkspace: builder.query<any, void>({
      query: (id) => ({
        url: `?action=getArrivedLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
    }),
    getROCByWorkspace: builder.query<any, void>({
      query: (id) => ({
        url: `?action=getTotalLeadsCount&workspaceId=${id}`,
        method: "GET",
      }),
    }),
    getWorkspaceMembers: builder.query<any, void>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceMembers&workspaceId=${workspaceId}`,
        method: "GET",
      }),
    }),

    getQualifiedCount: builder.query<any, void>({
      query: (workspaceId) => ({
        url: `?action=getQualifiedLeadsCount&workspaceId=${workspaceId}`,
        method: "GET",
      }),
    }),
    getWorkspaceDetailsAnalytics: builder.query<any, void>({
      query: (workspaceId) => ({
        url: `?action=getWorkspaceAnalytics&workspaceId=${workspaceId}`,
        method: "GET",
      }),
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
    }),
  }),
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
