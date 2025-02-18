"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Copy, Loader, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useDeleteWebhookMutation,
  useWebhookMutation,
  useChangeWebhookStatusMutation,
  useUpdateWebhookMutation,
} from "@/lib/store/services/webhooks";
import { useGetWebhooksQuery } from "@/lib/store/services/webhooks";
import { v4 as uuidv4 } from "uuid";
import { useGetActiveWorkspaceQuery } from "@/lib/store/services/workspace";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
// Zod validation schema
const sourceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  description: z.string().optional(),
  status: z.boolean().optional(),
});
export type Source = {
  webhook?: string; // URL as a string
  created_at?: string; // ISO 8601 formatted date string
  description?: string; // String, can be empty
  id: string; // UUID
  name: string; // Name of the source
  status: boolean; // True or false, indicates the status
  type: string; // Type of the source (e.g., 'ded')
  user_id?: string; // User UUID associated with the source
  webhook_url?: string; // URL as a string
  workspace_id?: string | null; // Can be a string or null
};
const LeadSourceManager: React.FC = () => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );
  const {
    data: workspacesData,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useGetActiveWorkspaceQuery();
  const [changeWebhookStatus] = useChangeWebhookStatusMutation();
  const [webhook, { isLoading: isWebhookAdded, error: webhookAddingError }] =
    useWebhookMutation();
  const [deleteWebhook, { isLoading: isDeleted, error: deleteError }] =
    useDeleteWebhookMutation();
  const [updateWebhook, { isLoading: isUpdated, error: updateError }] =
    useUpdateWebhookMutation();
  const {
    data: webhooks,
    isLoading,
    isError,
    error,
  } = useGetWebhooksQuery({ id: workspacesData?.data.id });
  const webhooksData = webhooks?.data;
  const [sources, setSources] = useState<Source[]>(webhooksData || []);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (id: any) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  useEffect(() => {
    if (webhooks?.data) {
      setSources(webhooks.data);
    }
  }, [webhooks]);
  console.log(webhooksData);
  // console.log(sources);
  const form = useForm<z.infer<typeof sourceSchema>>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
    },
  });

  const resetDialog = () => {
    form.reset({
      name: "",
      type: "",
      description: "",
    });
    setSelectedSource(null);
    setDialogMode(null);
  };

  const openCreateDialog = () => {
    if (workspacesData === undefined) {
      toast.error("No workspace selected. Please select a workspace");
      return; // Prevent dialog from opening
    }
    resetDialog();
    setDialogMode("create");
  };

  const openEditDialog = (source: (typeof sources)[number]) => {
    form.reset({
      name: source.name,
      type: source.type,
      description: source.description,
    });
    setSelectedSource(source);
    setDialogMode("edit");
  };

  const openDeleteDialog = (source: (typeof sources)[number]) => {
    setSelectedSource(source);
    setDialogMode("delete");
  };

  const copyWebhook = (webhook: string) => {
    navigator.clipboard.writeText(webhook);
    toast.success("Webhook URL copied to clipboard");
  };

  // Function to toggle webhook status
  const toggleWebhookStatus = async (sourceId: string) => {
    try {
      const currentStatus = sources.find(
        (source) => source.id === sourceId
      )?.status;
      const result = await changeWebhookStatus({
        id: sourceId,
        status: !currentStatus,
      }).unwrap();

      // If the API call succeeds, update local state and show success message
      setSources(
        sources.map((source) =>
          source.id === sourceId
            ? { ...source, status: !source.status }
            : source
        )
      );
      toast.success("Webhook status updated successfully");
    } catch (error: any) {
      // Handle specific API error
      const errorMessage =
        error.data?.error || "Failed to update webhook status";
      toast.error(errorMessage);

      // Optionally revert the optimistic update if you're doing one
      // or refresh the data from the server
    }
  };

  const onSubmit = async (data: z.infer<typeof sourceSchema>) => {
    if (dialogMode === "create") {
      try {
        // Validate workspace data before proceeding
        if (!workspacesData?.data.id) {
          toast.error("No workspace selected. Please select a workspace");
          return;
        }

        const newId: any = uuidv4().toString();
        const newWebhook = `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/leads?action=${"getLeads"}&sourceId=${newId}&workspaceId=${
          workspacesData?.data.id
        }`;

        const response = await webhook({
          status: true,
          type: data.type,
          name: data.name,
          webhook_url: newWebhook,
          workspace_id: workspacesData.data.id,
        }).unwrap();

        // Only update local state if API call succeeds
        setSources((prevSources) => [
          ...prevSources,
          {
            id: newId,
            ...data,
            webhook_url: newWebhook,
            description: data.description || "",
            workspace_id: workspacesData.data.id,
            status: true,
          },
        ]);
        window.location.reload();
        toast.success("Lead source created successfully");
        resetDialog();
      } catch (error: any) {
        // Handle specific error cases
        if (error.status === 409) {
          toast.error("A lead source with this name already exists");
        } else if (error.status === 403) {
          toast.error("You don't have permission to create a lead source");
        } else {
          const errorMessage =
            error.data?.error || "Failed to create lead source";
          toast.error(errorMessage);
        }
      }
    } else if (dialogMode === "edit" && selectedSource) {
      try {
        await updateWebhook({ data, id: selectedSource.id }).unwrap();

        const updatedSources = sources.map((source) =>
          source.id === selectedSource.id
            ? {
                ...source,
                ...data,
                description: data.description || "",
              }
            : source
        );
        setSources(updatedSources);
        toast.success("Lead source updated successfully");
        resetDialog();
      } catch (error: any) {
        const errorMessage =
          error.data?.error || "Failed to update lead source";
        toast.error(errorMessage);
      }
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteWebhook({ id }).unwrap();
      resetDialog();
      setSources(sources.filter((source) => source.id !== id));
      toast.success("Lead source deleted successfully");
    } catch (error: any) {
      // Handle specific API error
      const errorMessage = error.data?.error || "Failed to delete lead source";
      toast.error(errorMessage);
    }
  };
  if (workspaceLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div
      className={`grid  align-center gap-0  md:gap-2    transition-all duration-500 ease-in-out  px-2 py-6 w-auto min-h-screen
      ${isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"}
      overflow-hidden`}
    >
      <Card className="w-full">
        {/* Header: Move Title and Button to opposite ends on mobile */}
        <CardHeader className="flex flex-row justify-between md:justify-between items-center">
          <CardTitle className="text-sm md:text-xl lg:text-2xl">
            Lead Sources
          </CardTitle>
          <Button onClick={openCreateDialog} className=" md:w-auto">
            <Plus className="mr-2 h-3 w-3 text-md md:h-4 md:w-4 " /> Add Source
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Count</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Processing Rate
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Qualification Rate
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Webhook
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sources.map((source) => (
                  <>
                    {/* Mobile View (Show Only Name, Type, and Expand Button) */}
                    <TableRow className="md:hidden" key={source.id}>
                      <TableCell>{source.name}</TableCell>
                      <TableCell>{source.type}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleRow(source.id)}
                          className="h-8 w-8"
                        >
                          {expandedRow === source.id ? "−" : "+"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details for Mobile */}
                    {expandedRow === source.id && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="p-4 bg-gray-100 rounded-md">
                            <p>
                              <strong>Count:</strong> {source.description}
                            </p>
                            <p>
                              <strong>Processing Rate:</strong> N/A
                            </p>
                            <p>
                              <strong>Qualification Rate:</strong> N/A
                            </p>
                            <p>
                              <strong>Webhook:</strong> {source.webhook_url}
                            </p>

                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={source.status}
                                  onCheckedChange={() =>
                                    toggleWebhookStatus(source.id)
                                  }
                                />
                                <span
                                  className={`text-sm ${
                                    source.status
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {source.status ? "Enabled" : "Disabled"}
                                </span>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(source)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => openDeleteDialog(source)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Desktop View (Show Full Data) */}
                    <TableRow
                      key={`${source.id}-desktop`}
                      className="hidden md:table-row"
                    >
                      <TableCell>{source.name}</TableCell>
                      <TableCell>{source.type}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {source.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        N/A
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        N/A
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          <span className="truncate max-w-xs">
                            {source.webhook_url}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyWebhook(source.webhook_url ?? "")
                            }
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={source.status}
                            onCheckedChange={() =>
                              toggleWebhookStatus(source.id)
                            }
                          />
                          <span
                            className={`text-sm ${
                              source.status ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {source.status ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(source)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => openDeleteDialog(source)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogMode === "create" || dialogMode === "edit"}
        onOpenChange={() => resetDialog()}
      >
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? "Add New Lead Source"
                : "Edit Lead Source"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter source name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter source type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter source description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">
                  {isWebhookAdded || isUpdated ? (
                    <>
                      <Loader2 className="h-5 w-5" />
                      <span className="ml-2">
                        {dialogMode === "create"
                          ? "Adding..."
                          : isUpdated
                          ? "Updating..."
                          : "Updating..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="ml-2">
                        {dialogMode === "create"
                          ? "Add Source"
                          : "Update Source"}
                      </span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={() => resetDialog()}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete the lead source &quot;
            {selectedSource?.name}&quot;?
          </p>
          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedSource?.id)}
              className="w-full sm:w-auto"
            >
              {isDeleted ? (
                <>
                  <Loader2 className="h-5 w-5" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                "Delete Source"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadSourceManager;
