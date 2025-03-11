import { leadsApi } from "../base/leadsapi";

export interface Lead {
  [key: string]: any;
}

export const leadsApis = leadsApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<Lead[], { userId: string; sourceId: string }>({
      query: ({ userId, sourceId }) => ({
        url: `?action=getLeads&userId=${userId}&sourceId=${sourceId}`,
      }),
    }),
    getLeadsByUser: builder.query<Lead[], { userId: string }>({
      query: ({ userId }) => ({
        url: `?action=getLeadsByUser&userId=${userId}`,
      }),
    }),
    getLeadsByWorkspace: builder.query<Lead[], { workspaceId: string }>({
      query: ({ workspaceId }) => ({
        url: `?action=getLeadsByWorkspace&workspaceId=${workspaceId}`,
      }),
      providesTags: () => {
        return [{ type: 'Lead' as const, id: 'LIST' }];
      },
    
    }),
    getLeadById: builder.query<Lead, { id: string }>({
      query: ({ id }) => ({
        url: `?action=getLeadById&id=${id}`,
      }),
    }),
    createLead: builder.mutation<
      Lead,
      { workspaceId: string; body: Partial<Lead> }
    >({
      query: ({ workspaceId, body }) => ({
        url: `?action=createLead&workspaceId=${workspaceId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Lead'],  
    }),
    createManyLead: builder.mutation<
      { message: string; data: Lead[] },
      { workspaceId: string; body: Partial<Lead>[] }
    >({
      query: ({ workspaceId, body }) => ({
        url: `?action=createManyLead&workspaceId=${workspaceId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Lead'],
    }),
    updateLead: builder.mutation<any, { id: any; leads: any }>({
      query: ({ id, leads }) => ({
        url: `?action=updateLeadById&id=${id}`,
        method: "PUT",
        body: leads, // Pass the body with name and color
      }),
      invalidatesTags: ['Lead'],  

    }),
    assignRole: builder.mutation<any, { id: any; data: any ,workspaceId: any}>({
      query: ({ id, data,workspaceId }) => ({
        url: `?action=assignRoleById&id=${id}&workspaceId=${workspaceId}`,
        method: "PUT",
        body: data, // Pass the body with name and color
      }),
    }),
    updateLeadData: builder.mutation<any, { id: any; leads: any }>({
      query: ({ id, leads }) => ({
        url: `?action=updateLeadData&id=${id}`,
        method: "PUT",
        body: leads, // Pass the body with name and color
      }),
      
    }),

    addNotes: builder.mutation<any, { id: any; Note: any }>({
      query: ({ id, Note }) => ({
        url: `?action=updateNotesById&id=${id}`,
        method: "POST",
        body: Note, // Pass the body with name and color
      }),
    }),
    getNotes: builder.query<any, { id: any }>({
      query: ({ id }) => ({
        url: `?action=getNotesById&id=${id}`,
        method: "GET",
      }),
    }),
    leadNotification: builder.query<void, {  workspaceId: any }>({
      query: ({workspaceId }) => ({
        url: `?action=getNotifications&workspaceId=${workspaceId}`,
        method: "GET",
      }),
      providesTags: ['LeadNotification'],
    }),
    deleteLead: builder.mutation<void, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `${id}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['LeadNotification'],
    }),
    bulkDeleteLeads: builder.mutation<void, { id: any; workspaceId: any }>({
      query: ({ id, workspaceId }) => ({
        url: `?action=deleteLeads`,
        method: "DELETE",
        body: { id, workspaceId },
      }),
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadsByUserQuery,
  useGetLeadsByWorkspaceQuery,
  useGetLeadByIdQuery,
  useAddNotesMutation,
  useGetNotesQuery,
  useCreateLeadMutation,
  useCreateManyLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadDataMutation,
  useAssignRoleMutation,
  useBulkDeleteLeadsMutation,
  useLeadNotificationQuery,
} = leadsApis;
