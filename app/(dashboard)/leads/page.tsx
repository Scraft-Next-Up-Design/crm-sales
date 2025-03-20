"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CRM_MESSAGES } from "@/lib/constant/crm";
import {
  useAssignRoleMutation,
  useBulkDeleteLeadsMutation,
  useCreateLeadMutation,
  useCreateManyLeadMutation,
  useGetLeadsByWorkspaceQuery,
  useUpdateLeadDataMutation,
  useUpdateLeadMutation,
} from "@/lib/store/services/leadsApi";
import { useGetStatusQuery } from "@/lib/store/services/status";
import { useGetWebhooksQuery } from "@/lib/store/services/webhooks";
import {
  useGetActiveWorkspaceQuery,
  useGetWorkspaceMembersQuery,
} from "@/lib/store/services/workspace";
import { RootState } from "@/lib/store/store";
import { formatDate } from "@/utils/date";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  FileUp,
  Filter,
  ListFilter,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Send,
  SquareCode,
  Trash2,
  UserIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import * as z from "zod";
import FilterComponent from "./filter";

// Zod schema for lead validation
const leadSchema = z.object({
  name: z.string().min(2, { message: "First name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  company: z.string().optional(),
  position: z.string().optional(),
  contact_method: z.enum(["WhatsApp", "SMS", "Call"], {
    required_error: "Please select a contact method",
  }),
  revenue: z.number().optional(),
});

// Initial filter state
const initialFilters = {
  leadSource: "",
  owner: "",
  status: "",
  contact_method: "",
  contactType: "",
  startDate: "",
  endDate: "",
  showDuplicates: false,
};

const LeadManagement: React.FC = () => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );
  const router = useRouter();

  // RTK Query hooks
  const [createLead, { isLoading: isCreateLoading, error: leadCreateError }] =
    useCreateLeadMutation();
  const [
    createManyLead,
    { isLoading: isCreateManyLoading, error: leadCreateManyError },
  ] = useCreateManyLeadMutation();
  const [
    updateLeadData,
    { isLoading: isUpdateLoading, error: leadUpdateError },
  ] = useUpdateLeadDataMutation();
  const [updateLead] = useUpdateLeadMutation();
  const [assignRole, { isLoading: isAssignLoading, error: roleAssignError }] =
    useAssignRoleMutation();
  const [deleteLeadsData] = useBulkDeleteLeadsMutation();
  const { data: activeWorkspace, isLoading: isLoadingWorkspace } =
    useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data?.id;

  const { data: leadSources, isLoading: isLoadingSources } =
    useGetWebhooksQuery({ id: workspaceId });
  const { data: workspaceData, isLoading: isLoadingLeads } =
    useGetLeadsByWorkspaceQuery(
      workspaceId ? { workspaceId: workspaceId.toString() } : {},
      { skip: !workspaceId || isLoadingWorkspace, pollingInterval: 60000 }
    );
  const { data: workspaceMembers, isLoading: isLoadingMembers } =
    useGetWorkspaceMembersQuery(workspaceId);
  const { data: statusData, isLoading: isLoadingStatus } =
    useGetStatusQuery(workspaceId);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [currentPage] = useState(1);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form setup with react-hook-form
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      contact_method: undefined,
      revenue: 0,
    },
  });

  // Fetch and process leads
  useEffect(() => {
    if (!isLoadingLeads && workspaceData?.data) {
      const fetchedLeads = workspaceData.data.map(
        (lead: any, index: number) => ({
          id: lead.id || index + 1,
          Name: lead.name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          company: lead.company || "",
          position: lead.position || "",
          contact_method: lead.contact_method,
          owner: lead.owner || "Unknown",
          status: lead.status || "New",
          revenue: lead.revenue || 0,
          assign_to: lead.assign_to || "Not Assigned",
          createdAt: lead.created_at
            ? new Date(lead.created_at).toISOString()
            : new Date().toISOString(),
          isDuplicate: false,
          is_email_valid: lead.is_email_valid,
          is_phone_valid: lead.is_phone_valid,
          sourceId: lead.lead_source_id || null,
        })
      );

      const duplicates = new Set();
      fetchedLeads.forEach((lead: any) => {
        const duplicate = fetchedLeads.find(
          (l: any) =>
            l.id !== lead.id &&
            (l.email === lead.email || l.phone === lead.phone)
        );
        if (duplicate) {
          duplicates.add(lead.id);
          duplicates.add(duplicate.id);
        }
      });

      const updatedLeads = fetchedLeads
        .map((lead: any) => ({ ...lead, isDuplicate: duplicates.has(lead.id) }))
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setLeads(updatedLeads);
    }
  }, [workspaceData, isLoadingLeads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (searchQuery) {
        const searchText = searchQuery.toLowerCase();
        const searchableFields = [
          lead.Name,
          lead.email,
          lead.phone,
          lead.company,
          lead.position,
          lead.status?.name,
          lead.assign_to?.name,
        ];
        if (
          !searchableFields.some((field) =>
            field?.toString().toLowerCase().includes(searchText)
          )
        ) {
          return false;
        }
      }

      if (filters.owner && !lead.assign_to.name?.includes(filters.owner))
        return false;

      const leadSourceId = leadSources?.data.find(
        (source: any) => source?.name === filters?.leadSource
      )?.id;
      if (
        filters.leadSource &&
        filters.leadSource !== "all" &&
        lead.sourceId !== leadSourceId
      )
        return false;

      if (filters.status && lead.status?.name !== filters.status) return false;
      if (
        filters.contact_method &&
        lead.contact_method !== filters.contact_method
      )
        return false;

      if (filters.contactType) {
        if (filters.contactType === "phone" && !lead.phone) return false;
        if (filters.contactType === "email" && !lead.email) return false;
        if (filters.contactType === "id" && !lead.id) return false;
      }

      if (
        filters.startDate &&
        new Date(lead.createdAt) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(lead.createdAt) > new Date(filters.endDate)
      )
        return false;

      if (filters.showDuplicates) {
        const duplicates = leads.filter(
          (l) => l.email === lead.email || l.phone === lead.phone
        );
        if (duplicates.length <= 1) return false;
      }

      return true;
    });
  }, [leads, filters, searchQuery, leadSources]);

  // Helper functions
  const toggleRow = (id: number) =>
    setExpandedRow(expandedRow === id ? null : id);
  const resetDialog = () => {
    form.reset();
    setEditingLead(null);
    setDialogMode(null);
  };
  const openCreateDialog = () => {
    resetDialog();
    setDialogMode("create");
  };
  const openEditDialog = (lead: any) => {
    form.reset({
      name: lead.Name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      contact_method: lead.contact_method,
      revenue: lead.revenue,
    });
    setEditingLead(lead);
    setDialogMode("edit");
  };

  const onSubmit = async (data: z.infer<typeof leadSchema>) => {
    if (dialogMode === "create") {
      try {
        const response = await createLead({ workspaceId, body: data }).unwrap();
        setLeads([
          ...leads,
          {
            ...data,
            company: data.company || "",
            position: data.position || "",
            revenue: data.revenue || 0,
          },
        ]);
        toast.success("Lead created successfully");
        resetDialog();
      } catch (error: any) {
        toast.error(
          error.data?.message || "An error occurred while creating the lead."
        );
      }
    } else if (dialogMode === "edit" && editingLead) {
      try {
        await updateLeadData({ id: editingLead.id, leads: data }).unwrap();
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === editingLead.id
              ? {
                  ...lead,
                  ...data,
                  company: data.company || "",
                  position: data.position || "",
                  revenue: data.revenue || 0,
                }
              : lead
          )
        );
        toast.success(CRM_MESSAGES.LEAD_UPDATED_SUCCESS);
        resetDialog();
      } catch (error) {
        toast.error(CRM_MESSAGES.LEAD_UPDATED_ERROR);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLeadsData({ id: selectedLeads, workspaceId }).unwrap();
      setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
      setDialogMode(null);
      toast.success("Selected leads deleted successfully");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to delete leads");
    }
  };

  const toggleLeadSelection = (leadId: number) =>
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  const deselectAll = () => setSelectedLeads([]);
  const toggleSelectAllOnPage = () => {
    const currentPageLeadIds = filteredLeads.map((lead) => lead.id);
    setSelectedLeads((prev) =>
      currentPageLeadIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !currentPageLeadIds.includes(id))
        : Array.from(new Set([...prev, ...currentPageLeadIds]))
    );
  };

  const exportToCSV = () => {
    const formattedLeads = leads.map((lead) => ({
      Name: lead.Name,
      email: lead.email.toLowerCase(),
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      contact_method: lead.contact_method,
      owner: lead.owner,
      status: lead.status?.name || "Unknown",
      revenue: lead.revenue,
      assign_to: lead.assign_to,
      createdAt: formatDate(lead.createdAt),
      isDuplicate: lead.isDuplicate,
      is_email_valid: lead.is_email_valid,
      is_phone_valid: lead.is_phone_valid,
      source:
        leadSources?.data.find((source: any) =>
          source.webhook_url.includes(lead.sourceId)
        )?.name || "No Source",
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads_export.csv");
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "leads_export.json");
    linkElement.click();
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (result: any) => {
          const normalizedData = result.data.map((lead: any) => ({
            id: lead.id,
            name: lead.Name?.trim() || "",
            email: lead.email,
            phone: String(lead.phone)
              .replace(/[^\d+]/g, "")
              .replace(/^([^+])/, "+$1")
              .trim(),
            company: lead.company || "",
            position: lead.position || "",
            contact_method: lead.contact_method || "",
            owner: lead.owner || "Unknown",
            status: lead.status || "Pending",
            revenue: Number(lead.revenue) || 0,
            assign_to: lead.assign_to || "",
            createdAt: lead.createdAt
              ? new Date(lead.createdAt).toISOString()
              : new Date().toISOString(),
            isDuplicate: lead.isDuplicate === "TRUE",
            is_email_valid: lead.is_email_valid === "TRUE",
            is_phone_valid: lead.is_phone_valid === "TRUE",
            sourceId: lead.sourceId,
          }));

          const validLeads = normalizedData.filter((lead: any) => {
            try {
              leadSchema.parse(lead);
              return true;
            } catch {
              return false;
            }
          });

          if (validLeads.length === 0) {
            toast.error("No valid leads found.");
            return;
          }

          try {
            await createManyLead({ workspaceId, body: validLeads }).unwrap();
            setLeads((prev) => [...prev, ...validLeads]);
            toast.success("Leads created successfully");
          } catch {
            toast.error("Error adding leads to database");
          }
          event.target.value = "";
        },
      });
    };
    reader.readAsText(file);
  };

  const initiateDirectContact = (lead: any, method: string) => {
    const sanitizedPhone = lead.phone.replace(/\D/g, "");
    switch (method) {
      case "WhatsApp":
        window.open(`https://wa.me/${sanitizedPhone}`, "_blank");
        break;
      case "Call":
        window.location.href = `tel:${lead.phone}`;
        break;
      case "SMS":
        window.location.href = `sms:${lead.phone}`;
        break;
    }
  };

  const handleView = (id: number) => router.push(`/leads/${id}`);
  const handleGoBack = () => router.push("/dashboard");
  const handleFilterReset = () => {
    setFilters(initialFilters);
    setShowFilters(false);
  };
  const handleFilterChange = (newFilters: any) => setFilters(newFilters);

  const handleStatusChange = async (id: number, value: string) => {
    const { name, color } = JSON.parse(value);
    try {
      await updateLead({ id, leads: { status: { name, color } } }).unwrap();
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: { name, color } } : lead
        )
      );
      toast.success(`Lead status updated to ${name}`);
    } catch {
      toast.error("Failed to update lead status");
    }
  };

  const handleAssignChange = async (id: number, assign: string) => {
    const { name, role } = JSON.parse(assign);
    try {
      await assignRole({ id, data: { name, role }, workspaceId }).unwrap();
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, assign_to: { name, role } } : lead
        )
      );
      toast.success(`Lead assigned to ${name}`);
    } catch {
      toast.error("Failed to assign lead");
    }
  };

  // Loading state with Skeleton
  if (
    isLoadingStatus ||
    isLoadingLeads ||
    isLoadingMembers ||
    isLoadingSources
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen overflow-hidden">
        <div className="space-y-4 w-full max-w-4xl p-4">
          <Skeleton className="h-8 w-1/4" /> {/* Title */}
          <Skeleton className="h-12 w-full" /> {/* Search bar */}
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" /> // Table rows
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (workspaceData?.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-lg w-full p-8 bg-white shadow-xl rounded-lg flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold text-center text-gray-800">
            No Leads Found in this Workspace
          </CardTitle>
          <CardDescription className="mt-2 text-lg text-gray-600 text-center">
            It seems there are no leads available in this workspace at the
            moment.
          </CardDescription>
          <Button
            className="mt-6 px-6 py-2 bg-primary text-white rounded-md shadow-md"
            onClick={handleGoBack}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-500 ease-in-out md:px-4 md:py-6 py-2 px-2 ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } w-auto overflow-hidden`}
    >
      <Card className="w-full rounded-[16px] md:rounded-[4px] overflow-hidden">
        {showFilters && (
          <FilterComponent
            values={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            status={statusData?.data}
            owner={workspaceMembers?.data}
            leadSources={leadSources?.data}
          />
        )}

        <CardHeader className="grid grid-cols-6 items-center grid-rows-3 md:gap-4 md:flex md:flex-row md:justify-between p-0 md:p-3 border-b-2 border-gray-200 md:border-none">
          <div className="md:bg-white dark:md:bg-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-between col-start-1 col-end-7 p-3 md:p-0">
            <div className="flex gap-2">
              <div className="md:hidden lg:hidden">
                <SquareCode />
              </div>
              <CardTitle className="flex mr-2 text-md md:text-xl lg:text-2xl text-gray-900 dark:text-gray-100">
                Lead Management
              </CardTitle>
            </div>
            <Button
              onClick={openCreateDialog}
              className="md:hidden lg:hidden bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>

          <div className="relative w-full md:w-64 row-start-2 row-end-3 px-4 md:px-0 col-start-1 col-end-6">
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <FileDown className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <input
              type="file"
              id="import-leads"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("import-leads")?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="row-start-2 row-end-3 col-start-6 col-end-7 p-1 flex md:hidden border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 items-center rounded-md justify-center"
          >
            <ListFilter className="mr-2 h-4 w-4" />
          </button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="col-start-1 col-end-3 mx-2 md:hidden lg:hidden"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportToJSON}
            className="col-start-3 col-end-5 mx-2 md:hidden lg:hidden px-1 py-1"
          >
            Export JSON
          </Button>
          <input
            type="file"
            id="import-leads-mobile"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button
            variant="outline"
            onClick={() =>
              document.getElementById("import-leads-mobile")?.click()
            }
            className="md:hidden lg:hidden mx-2 col-start-5 col-end-7"
          >
            Import CSV
          </Button>
        </CardHeader>

        <CardContent>
          {selectedLeads.length > 0 && (
            <div className="mb-4 flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => setDialogMode("delete")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {selectedLeads.length} Selected
              </Button>
              <Button variant="secondary" onClick={deselectAll}>
                <X className="mr-2 h-4 w-4" />
                Deselect All
              </Button>
            </div>
          )}

          <div className="text-xs">
            <Table className="text-xs">
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead className="px-2 py-1">
                    <Checkbox
                      checked={filteredLeads.every((lead) =>
                        selectedLeads.includes(lead.id)
                      )}
                      onCheckedChange={toggleSelectAllOnPage}
                    />
                  </TableHead>
                  <TableHead className="px-2 py-1">Name</TableHead>
                  <TableHead className="px-2 py-1">Email</TableHead>
                  <TableHead className="px-2 py-1">Phone</TableHead>
                  <TableHead className="px-2 py-1">Generated At</TableHead>
                  <TableHead className="px-2 py-1">Actions</TableHead>
                  <TableHead className="px-2 py-1">Status</TableHead>
                  <TableHead className="px-2 py-1">Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <React.Fragment key={lead.id}>
                    {/* Mobile View */}
                    <TableRow className="flex md:hidden lg:hidden items-center justify-between text-[14px] border-b border-gray-300 py-2 last:border-none">
                      <div className="flex gap-4">
                        <TableCell className="px-2 py-1">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                          />
                        </TableCell>
                        <div>
                          <div className="px-2 py-1">{lead.Name}</div>
                          {lead.isDuplicate && (
                            <span
                              style={{ color: "red", fontSize: "0.7em" }}
                              className="hidden md:block"
                            >
                              Duplicate Lead
                            </span>
                          )}
                          <div className="p-1 md:p-3">
                            <div className="flex items-center md:space-x-2">
                              {lead.is_email_valid ? (
                                <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                              ) : (
                                <X className="w-5 h-5 text-red-600 stroke-[3]" />
                              )}
                              <div>
                                <span
                                  className={`font-medium tracking-tight ${
                                    lead.is_email_valid
                                      ? "text-emerald-800"
                                      : "text-red-800"
                                  }`}
                                >
                                  {lead.email}
                                </span>
                                {!lead.is_email_valid && (
                                  <div className="text-xs text-red-600 mt-0.5">
                                    Invalid Email
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleRow(lead.id)}
                          className="h-8 w-8 border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-m"
                        >
                          {expandedRow === lead.id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRow === lead.id && (
                      <TableRow className="text-[14px]">
                        <div className="p-3 grid grid-cols-2 items-center">
                          <span className="text-gray-600">Phone</span>
                          <div className="flex items-center space-x-2">
                            {lead.is_phone_valid ? (
                              <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 stroke-[3]" />
                            )}
                            <div>
                              <span
                                className={`font-medium tracking-tight ${
                                  lead.is_phone_valid
                                    ? "text-emerald-800"
                                    : "text-red-800"
                                }`}
                              >
                                {lead.phone}
                              </span>
                              {!lead.is_phone_valid && (
                                <div className="text-xs text-red-600 mt-0.5">
                                  Invalid Phone
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 grid grid-cols-2 items-center">
                          <span className="text-gray-600">Generated At</span>
                          <div className="px-2 py-1">
                            {formatDate(lead.createdAt)}
                          </div>
                        </div>
                        <div className="p-3 grid grid-cols-2 items-center">
                          <span className="text-gray-600">Action</span>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                initiateDirectContact(lead, lead.contact_method)
                              }
                              className="h-6 w-6"
                              title={`Contact via ${lead.contact_method}`}
                            >
                              {lead.contact_method === "WhatsApp" && (
                                <Send className="h-3 w-3" />
                              )}
                              {lead.contact_method === "Call" && (
                                <Phone className="h-3 w-3" />
                              )}
                              {lead.contact_method === "SMS" && (
                                <MessageCircle className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(lead)}
                              className="h-6 w-6"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleView(lead.id)}
                              className="h-6 w-6"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="px-3 py-2 grid grid-cols-2 items-center">
                          <span className="text-gray-600">Status</span>
                          <Select
                            defaultValue={JSON.stringify({
                              name: lead.status?.name || "Pending",
                              color: lead.status?.color || "#ea1212",
                            })}
                            onValueChange={(value) =>
                              handleStatusChange(lead.id, value)
                            }
                          >
                            <SelectTrigger className="group relative overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30"
                                    style={{
                                      backgroundColor: lead?.status?.color,
                                    }}
                                  />
                                  <div
                                    className="relative h-3 w-3 rounded-lg bg-gray-400"
                                    style={{
                                      backgroundColor: lead?.status?.color,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {lead?.status?.name}
                                </span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                              {statusData?.data.map(
                                (status: { name: string; color: string }) => (
                                  <SelectItem
                                    key={status.name}
                                    value={JSON.stringify({
                                      name: status?.name,
                                      color: status?.color,
                                    })}
                                    className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                                  >
                                    <div className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                      <div className="relative">
                                        <div
                                          className="absolute -inset-1 rounded-lg opacity-20 blur-sm transition-all duration-200 group-hover:opacity-40"
                                          style={{
                                            backgroundColor: status?.color,
                                          }}
                                        />
                                        <div
                                          className="relative h-3 w-3 rounded-lg transition-transform duration-200 group-hover:scale-110"
                                          style={{
                                            backgroundColor: status?.color,
                                          }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {status.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="px-3 py-1 grid grid-cols-2 items-center">
                          <span className="text-gray-600">Assign</span>
                          <Select
                            defaultValue={JSON.stringify({
                              name: lead?.assign_to?.name || "Not Assigned",
                              role: lead?.assign_to?.role || "(Not Assigned)",
                            })}
                            onValueChange={(value) =>
                              handleAssignChange(lead?.id, value)
                            }
                          >
                            <SelectTrigger className="group relative overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30" />
                                  <div className="relative">
                                    <UserIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                </div>
                                <span className="text-sm font-medium">
                                  {lead?.assign_to?.name}
                                </span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                              <SelectItem
                                key="unassigned"
                                value={JSON.stringify({
                                  name: "Unassigned",
                                  role: "none",
                                })}
                                className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Unassigned
                                  </span>
                                </div>
                              </SelectItem>
                              {workspaceMembers?.data
                                .filter(
                                  (status: { name: string | null }) =>
                                    status.name && status.name !== "null"
                                )
                                .map(
                                  (status: { name: string; role: string }) => (
                                    <SelectItem
                                      key={status.name}
                                      value={JSON.stringify({
                                        name: status?.name,
                                        role: status?.role,
                                      })}
                                      className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                          {status.name}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableRow>
                    )}

                    {/* Desktop View */}
                    <TableRow
                      key={`${lead.id}-desktop`}
                      className="hidden md:table-row"
                    >
                      <TableCell className="px-2 py-1">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        {lead.Name}
                        {lead.isDuplicate && (
                          <span
                            style={{ color: "red", fontSize: "0.7em" }}
                            className="hidden md:block"
                          >
                            Duplicate Lead
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center space-x-2">
                          {lead.is_email_valid ? (
                            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                          ) : (
                            <X className="w-5 h-5 text-red-600 stroke-[3]" />
                          )}
                          <div>
                            <span
                              className={`font-medium tracking-tight ${
                                lead.is_email_valid
                                  ? "text-emerald-800"
                                  : "text-red-800"
                              }`}
                            >
                              {lead.email}
                            </span>
                            {!lead.is_email_valid && (
                              <div className="text-xs text-red-600 mt-0.5">
                                Invalid Email
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          {lead.is_phone_valid ? (
                            <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                          ) : (
                            <X className="w-5 h-5 text-red-600 stroke-[3]" />
                          )}
                          <div>
                            <span
                              className={`font-medium tracking-tight ${
                                lead.is_phone_valid
                                  ? "text-emerald-800"
                                  : "text-red-800"
                              }`}
                            >
                              {lead.phone}
                            </span>
                            {!lead.is_phone_valid && (
                              <div className="text-xs text-red-600 mt-0.5">
                                Invalid Phone
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-1 hidden md:table-cell">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell className="px-2 py-1 hidden md:table-cell">
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              initiateDirectContact(lead, lead.contact_method)
                            }
                            className="h-6 w-6"
                            title={`Contact via ${lead.contact_method}`}
                          >
                            {lead.contact_method === "WhatsApp" && (
                              <Send className="h-3 w-3" />
                            )}
                            {lead.contact_method === "Call" && (
                              <Phone className="h-3 w-3" />
                            )}
                            {lead.contact_method === "SMS" && (
                              <MessageCircle className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(lead)}
                            className="h-6 w-6"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(lead.id)}
                            className="h-6 w-6"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="border-none hidden md:table-cell">
                        <Select
                          defaultValue={JSON.stringify({
                            name: lead.status?.name || "Pending",
                            color: lead.status?.color || "#ea1212",
                          })}
                          onValueChange={(value) =>
                            handleStatusChange(lead.id, value)
                          }
                        >
                          <SelectTrigger className="group relative w-[200px] overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div
                                  className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30"
                                  style={{
                                    backgroundColor: lead?.status?.color,
                                  }}
                                />
                                <div
                                  className="relative h-3 w-3 rounded-lg bg-gray-400"
                                  style={{
                                    backgroundColor: lead?.status?.color,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {lead?.status?.name}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                            {statusData?.data.map(
                              (status: { name: string; color: string }) => (
                                <SelectItem
                                  key={status.name}
                                  value={JSON.stringify({
                                    name: status?.name,
                                    color: status?.color,
                                  })}
                                  className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                                >
                                  <div className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="relative">
                                      <div
                                        className="absolute -inset-1 rounded-lg opacity-20 blur-sm transition-all duration-200 group-hover:opacity-40"
                                        style={{
                                          backgroundColor: status?.color,
                                        }}
                                      />
                                      <div
                                        className="relative h-3 w-3 rounded-lg transition-transform duration-200 group-hover:scale-110"
                                        style={{
                                          backgroundColor: status?.color,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                      {status.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="border-none hidden md:table-cell">
                        <Select
                          defaultValue={JSON.stringify({
                            name: lead?.assign_to?.name || "Not Assigned",
                            role: lead?.assign_to?.role || "(Not Assigned)",
                          })}
                          onValueChange={(value) =>
                            handleAssignChange(lead?.id, value)
                          }
                        >
                          <SelectTrigger className="group relative w-[200px] overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30" />
                                <div className="relative">
                                  <UserIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                              <span className="text-sm font-medium">
                                {lead?.assign_to?.name}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                            <SelectItem
                              key="unassigned"
                              value={JSON.stringify({
                                name: "Unassigned",
                                role: "none",
                              })}
                              className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  Unassigned
                                </span>
                              </div>
                            </SelectItem>
                            {workspaceMembers?.data
                              .filter(
                                (status: { name: string | null }) =>
                                  status.name && status.name !== "null"
                              )
                              .map((status: { name: string; role: string }) => (
                                <SelectItem
                                  key={status.name}
                                  value={JSON.stringify({
                                    name: status?.name,
                                    role: status?.role,
                                  })}
                                  className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                      {status.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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
              {dialogMode === "create" ? "Add New Lead" : "Edit Lead"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Your Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="contact_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[1001]">
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter revenue"
                        type="number"
                        {...field}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isCreateLoading || isUpdateLoading}
                >
                  {isUpdateLoading || isCreateLoading ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2" /> Loading...
                    </>
                  ) : dialogMode === "create" ? (
                    "Add Lead"
                  ) : (
                    "Update Lead"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogMode === "delete"}
        onOpenChange={() => setDialogMode(null)}
      >
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Selected Leads</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete {selectedLeads?.length} lead(s)?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadManagement;
