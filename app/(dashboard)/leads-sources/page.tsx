"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useChangeWebhookStatusMutation,
  useDeleteWebhookMutation,
  useGetWebhooksQuery,
  useUpdateWebhookMutation,
  useWebhookMutation,
} from "@/lib/store/services/webhooks";
import { useGetActiveWorkspaceQuery } from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

const sourceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(2, { message: "Please select a source type" }),
  description: z.string().optional(),
  status: z.boolean().optional(),
});

const SOURCE_TYPES = [
  { id: "website", label: "Website" },
  { id: "crm", label: "CRM" },
  { id: "marketing", label: "Marketing" },
  { id: "social", label: "Social Media" },
  { id: "email", label: "Email Campaign" },
  { id: "referral", label: "Referral" },
  { id: "other", label: "Other" },
];

type Source = {
  webhook?: string;
  created_at?: string;
  description?: string;
  id: string;
  name: string;
  status: boolean;
  type: string;
  user_id?: string;
  webhook_url?: string;
  workspace_id?: string | null;
};

const SkeletonTableRow = memo(() => (
  <TableRow className="animate-pulse">
    <TableCell className="px-2 py-1">
      <div className="h-4 w-32 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1">
      <div className="h-4 w-24 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-20 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-20 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-20 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-48 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-6 w-16 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="flex space-x-1">
        <div className="h-6 w-6 bg-gray-300 rounded" />
        <div className="h-6 w-6 bg-gray-300 rounded" />
      </div>
    </TableCell>
  </TableRow>
));
SkeletonTableRow.displayName = "SkeletonTableRow";

const SourceTableRow = memo(
  ({
    source,
    toggleRow,
    expandedRow,
    copyWebhook,
    toggleWebhookStatus,
    openEditDialog,
    openDeleteDialog,
  }: any) => (
    <>
      {/* Mobile View */}
      <TableRow
        className="flex md:hidden items-center justify-between border-b border-gray-300 p-2 last:border-none"
        key={source.id}
      >
        <div className="flex flex-col gap-0">
          <div className="text-[1rem]">{source.name}</div>
          <div className="text-gray-500">{source.type}</div>
        </div>
        <TableCell>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleRow(source.id)}
            className="h-8 w-8 border-none bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md"
          >
            {expandedRow === source.id ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded Mobile View */}
      {expandedRow === source.id && (
        <TableRow className="md:hidden">
          <TableCell colSpan={3}>
            <div className="rounded-md">
              <p className="flex items-center gap-4">{source.description}</p>
              <p className="flex items-center gap-[7.5rem] text-[1rem] pb-2">
                <span className="text-gray-500">Count</span>0
              </p>
              <p className="flex items-center gap-9 text-[1rem] pb-2">
                <span className="text-gray-500">Processing Rate</span>N/A
              </p>
              <p className="flex items-center gap-7 text-[1rem] pb-2">
                <span className="text-gray-500">Qualification Rate</span>N/A
              </p>
              <div className="flex items-center space-x-2 text-[1rem] pb-2">
                <span className="text-gray-500 mr-20">Webhook</span>
                <span className="truncate max-w-[120px]">
                  {source.webhook_url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyWebhook(source.webhook_url ?? "")}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-28 text-[1rem] pb-2">
                  <span className="text-gray-500">Status</span>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={source.status}
                      onCheckedChange={() => toggleWebhookStatus(source.id)}
                    />
                    <span
                      className={`text-sm ${
                        source.status ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {source.status ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-28 text-[1rem] pb-2 mt-2">
                  <span className="text-gray-500">Action</span>
                  <div className="flex gap-2">
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
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Desktop View */}
      <TableRow key={`${source.id}-desktop`} className="hidden md:table-row">
        <TableCell>{source.name}</TableCell>
        <TableCell>{source.type}</TableCell>
        <TableCell>{source.description}</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span className="truncate max-w-xs">{source.webhook_url}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyWebhook(source.webhook_url ?? "")}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Switch
              checked={source.status}
              onCheckedChange={() => toggleWebhookStatus(source.id)}
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
        <TableCell>
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
  )
);
SourceTableRow.displayName = "SourceTableRow";

const LeadSourceManager = memo(() => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );

  // RTK Query Hooks
  const { data: workspacesData, isLoading: workspaceLoading } =
    useGetActiveWorkspaceQuery();
  const workspaceId = workspacesData?.data.id;
  const { data: webhooks, isLoading: isWebhooksLoading } = useGetWebhooksQuery(
    { id: workspaceId },
    { skip: !workspaceId }
  );
  const [webhook, { isLoading: isWebhookAdding }] = useWebhookMutation();
  const [deleteWebhook, { isLoading: isDeleting }] = useDeleteWebhookMutation();
  const [updateWebhook, { isLoading: isUpdating }] = useUpdateWebhookMutation();
  const [changeWebhookStatus] = useChangeWebhookStatusMutation();

  // State Management
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Form Setup
  const form = useForm<z.infer<typeof sourceSchema>>({
    resolver: zodResolver(sourceSchema),
    defaultValues: { name: "", type: "", description: "" },
  });

  // Sync sources with fetched data
  useEffect(() => {
    if (webhooks?.data) {
      setSources(webhooks.data);
    }
  }, [webhooks]);

  // Memoized Handlers
  const resetDialog = useCallback(() => {
    form.reset({ name: "", type: "", description: "" });
    setSelectedSource(null);
    setDialogMode(null);
  }, [form]);

  const openCreateDialog = useCallback(() => {
    if (!workspacesData?.data.id) {
      toast.error("No workspace selected. Please select a workspace");
      return;
    }
    resetDialog();
    setDialogMode("create");
  }, [workspacesData, resetDialog]);

  const openEditDialog = useCallback(
    (source: Source) => {
      form.reset({
        name: source.name,
        type: source.type,
        description: source.description,
      });
      setSelectedSource(source);
      setDialogMode("edit");
    },
    [form]
  );

  const openDeleteDialog = useCallback((source: Source) => {
    setSelectedSource(source);
    setDialogMode("delete");
  }, []);

  const toggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const copyWebhook = useCallback((webhook: string) => {
    navigator.clipboard.writeText(webhook);
    toast.success("Webhook URL copied to clipboard");
  }, []);

  const toggleWebhookStatus = useCallback(
    async (sourceId: string) => {
      try {
        const currentStatus = sources.find(
          (source) => source.id === sourceId
        )?.status;
        await changeWebhookStatus({
          id: sourceId,
          status: !currentStatus,
        }).unwrap();
        setSources((prev) =>
          prev.map((source) =>
            source.id === sourceId
              ? { ...source, status: !source.status }
              : source
          )
        );
        toast.success("Webhook status updated successfully");
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to update webhook status");
      }
    },
    [sources, changeWebhookStatus]
  );

  const onSubmit = useCallback(
    async (data: z.infer<typeof sourceSchema>) => {
      if (dialogMode === "create") {
        try {
          if (!workspacesData?.data.id) {
            toast.error("No workspace selected. Please select a workspace");
            return;
          }
          const newId = uuidv4();
          const newWebhook = `${process.env.NEXT_PUBLIC_BASE_URL}/leads?action=getLeads&sourceId=${newId}&workspaceId=${workspacesData.data.id}`;
          await webhook({
            status: true,
            type: data.type,
            name: data.name,
            webhook_url: newWebhook,
            workspace_id: workspacesData.data.id,
          }).unwrap();
          setSources((prev) => [
            ...prev,
            {
              id: newId,
              ...data,
              webhook_url: newWebhook,
              description: data.description || "",
              workspace_id: workspacesData.data.id,
              status: true,
            },
          ]);
          toast.success("Lead source created successfully");
          resetDialog();
        } catch (error: any) {
          toast.error(error.data?.error || "Failed to create lead source");
        }
      } else if (dialogMode === "edit" && selectedSource) {
        try {
          await updateWebhook({ data, id: selectedSource.id }).unwrap();
          setSources((prev) =>
            prev.map((source) =>
              source.id === selectedSource.id
                ? { ...source, ...data, description: data.description || "" }
                : source
            )
          );
          toast.success("Lead source updated successfully");
          resetDialog();
        } catch (error: any) {
          toast.error(error.data?.error || "Failed to update lead source");
        }
      }
    },
    [
      dialogMode,
      selectedSource,
      workspacesData,
      webhook,
      updateWebhook,
      resetDialog,
    ]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteWebhook({ id }).unwrap();
        setSources((prev) => prev.filter((source) => source.id !== id));
        toast.success("Lead source deleted successfully");
        resetDialog();
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to delete lead source");
      }
    },
    [deleteWebhook, resetDialog]
  );

  // Memoized Loading State
  const isLoading = useMemo(
    () => workspaceLoading || isWebhooksLoading,
    [workspaceLoading, isWebhooksLoading]
  );

  // Memoized Container ClassName
  const containerClassName = useMemo(
    () =>
      `transition-all duration-500 ease-in-out px-2 py-6 w-auto ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } overflow-hidden`,
    [isCollapsed]
  );

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <Card className="w-full rounded-[16px] md:rounded-[4px] overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 md:bg-white md:dark:bg-gray-900 animate-pulse">
            <div className="h-6 w-40 bg-gray-300 rounded" />
            <div className="h-10 w-32 bg-gray-300 rounded" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <TableHead key={i} className="px-2 py-1">
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonTableRow key={i} />
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Card className="w-full rounded-[16px] md:rounded-[4px] overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 md:bg-white md:dark:bg-gray-900">
          <div className="flex gap-6">
            <div className="md:hidden lg:hidden w-2 h-2 pb-4 text-gray-700 dark:text-gray-300">
              <Users />
            </div>
            <CardTitle className="text-sm md:text-xl lg:text-2xl text-gray-900 dark:text-white">
              Lead Sources
            </CardTitle>
          </div>
          <Button
            onClick={openCreateDialog}
            className="md:w-auto bg-primary dark:bg-primary-dark text-white dark:text-gray-700"
          >
            <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4 text-gray-700 dark:text-gray-700" />
            Add Source
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Processing Rate</TableHead>
                  <TableHead>Qualification Rate</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <SourceTableRow
                    key={source.id}
                    source={source}
                    toggleRow={toggleRow}
                    expandedRow={expandedRow}
                    copyWebhook={copyWebhook}
                    toggleWebhookStatus={toggleWebhookStatus}
                    openEditDialog={openEditDialog}
                    openDeleteDialog={openDeleteDialog}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogMode === "create" || dialogMode === "edit"}
        onOpenChange={resetDialog}
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              <DialogFooter className="flex md:flex-col flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isWebhookAdding || isUpdating}
                >
                  {isWebhookAdding || isUpdating
                    ? "Processing..."
                    : dialogMode === "create"
                    ? "Add Source"
                    : "Update Source"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={resetDialog}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete the lead source &quot;
            {selectedSource?.name}&quot;?
          </p>
          <DialogFooter className="flex md:flex-col flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
              onClick={() => handleDelete(selectedSource?.id || "")}
              className="w-full sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

LeadSourceManager.displayName = "LeadSourceManager";

export default LeadSourceManager;
