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
    }),

    // Update an existing workspace
    updateWorkspace: builder.mutation<WorkspaceRequest, WorkspaceResponse>({
      query: (data) => ({
        url: "?action=updateWorkspace",
        method: "PUT",
        body: data,
      }),
    }),

    // Delete an existing workspace
    deleteWorkspace: builder.mutation<{ id: string }, { id: string }>({
      query: ({ id }) => ({
        url: `?action=deleteWorkspace`,
        method: "DELETE",
        body: { id },
      }),
    }),

    // Fetch all workspaces
    getWorkspaces: builder.query<any, void>({
      query: () => ({
        url: "?action=getWorkspaces",
        method: "GET",
      }),
    }),

    // Fetch workspaces by owner ID
    getWorkspacesByOwnerId: builder.query<any, { ownerId: string }>({
      query: ({ ownerId }) => ({
        url: `?action=getWorkspaces&ownerId=${ownerId}`,
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
        method: "PATCH",
        body: { id, status },
      }),
    }),
  }),
});

// Export hooks for the workspace mutations and queries
export const {
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspacesQuery,
  useGetWorkspacesByOwnerIdQuery,
  useUpdateWorkspaceStatusMutation,
} = workspaceApis;
