"use client";
import { Filter, Loader2 } from "lucide-react";
import FilterComponent from "./filter";
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  FileDown,
  FileUp,
  Phone,
  MessageCircle,
  Send,
  Eye,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CRM_MESSAGES } from "@/lib/constant/crm";
import { useGetLeadsByWorkspaceQuery, useUpdateLeadMutation, useUpdateLeadDataMutation } from "@/lib/store/services/leadsApi";
import { useGetActiveWorkspaceQuery } from "@/lib/store/services/workspace";
import { useGetStatusQuery } from "@/lib/store/services/status";
import { Badge } from "@/components/ui/badge";
// Zod validation schema for lead
const leadSchema = z.object({
  name: z.string().min(2, { message: "First name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number" }),
  company: z.string().optional(),
  position: z.string().optional(),
  contact_method: z.enum(["WhatsApp", "SMS", "Call"], {
    required_error: "Please select a contact method",
  }),
});

const initialFilters: any = {
  owner: "",
  status: "",
  contact_method: "",
  contactType: "",
  startDate: "",
  endDate: "",
  showDuplicates: false,
};

const LeadManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [updateLeadData, { isLoading: isUpdateLoading, error: leadUpdateError }] = useUpdateLeadDataMutation();
  const [updateLead] = useUpdateLeadMutation();
  const { data: activeWorkspace, isLoading: isLoadingWorkspace } = useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data.id;

  const { data: workspaceData, isLoading: isLoadingLeads }: any = useGetLeadsByWorkspaceQuery(
    workspaceId ? ({ workspaceId: workspaceId.toString() } as { workspaceId: string }) : ({} as { workspaceId: string }),
    {
      skip: !workspaceId || isLoadingWorkspace, // Skip if workspaceId is undefined or still loading
    }
  );
  const { data: statusData, isLoading: isLoadingStatus }: any = useGetStatusQuery(workspaceId);
  useEffect(() => {
    if (!isLoadingLeads && workspaceData?.data) {
      // Assuming workspaceData.data contains the leads array
      const fetchedLeads = workspaceData?.data.map((lead: any, index: number) => ({
        id: lead.id || index + 1, // Ensure each lead has a unique ID
        Name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        position: lead.position || "",
        contact_method: lead.contact_method, // Default value if not provided
        owner: lead.owner || "Unknown", // Adjust according to your data schema
        status: lead.status || "New", // Default status
        createdAt: lead.createdAt || new Date().toISOString(), // Default to current date
      }));

      setLeads(fetchedLeads);
    }
  }, [workspaceData, isLoadingLeads]);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);


  const [filters, setFilters] = useState<any>(initialFilters);
  const [leads, setLeads] = useState<any[]>([]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters(initialFilters);
    setShowFilters(false);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Owner filter
      if (
        filters.owner &&
        !lead.owner.toLowerCase().includes(filters.owner.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status && lead.status !== filters.status) {
        return false;
      }

      // Contact Method filter
      if (
        filters.contact_method &&
        lead.contact_method !== filters.contact_method
      ) {
        return false;
      }

      // Contact Type filter
      if (filters.contact_method) {
        if (filters.contact_method === "phone" && !lead.phone) return false;
        if (filters.contact_method === "email" && !lead.email) return false;
        if (filters.contact_method === "id" && !lead.id) return false;
      }

      // Date range filter
      if (
        filters.startDate &&
        new Date(lead.createdAt) < new Date(filters.startDate)
      ) {
        return false;
      }
      if (
        filters.endDate &&
        new Date(lead.createdAt) > new Date(filters.endDate)
      ) {
        return false;
      }

      // Duplicate check
      if (filters.showDuplicates) {
        const duplicates = leads.filter(
          (l) => l.email === lead.email || l.phone === lead.phone
        );
        if (duplicates.length <= 1) return false;
      }

      return true;
    });
  }, [leads, filters]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLead, setEditingLead] = useState<any>(null);

  // Pagination
  const leadsPerPage = 10;
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * leadsPerPage;
    return leads.slice(startIndex, startIndex + leadsPerPage);
  }, [leads, currentPage]);

  // Form setup
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      contact_method: undefined,
    },
  });

  // Reset dialog state
  const resetDialog = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      contact_method: undefined,
    })
    setEditingLead(null);
    setDialogMode(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetDialog();
    setDialogMode("create");
  };

  // Open edit dialog
  const openEditDialog = (lead: any) => {
    form.reset({
      name: "",
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      contact_method: lead.contact_method,
    });
    setEditingLead(lead);
    setDialogMode("edit");
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof leadSchema>) => {
    if (dialogMode === "create") {
      // Add new lead
      setLeads([
        ...leads,
        {
          id: leads.length + 1,
          ...data,
          company: data.company || "",
          position: data.position || "",
        },
        // console.log(leads),
      ]);
      // toast.success(CRM_MESSAGES.LEAD_ADDED_SUCCESS);
    } else if (dialogMode === "edit" && editingLead) {
      // Update existing lead
      try {
        updateLeadData({ id: editingLead.id, leads: data });
        setLeads((prevLeads) =>
          prevLeads.map((lead) => (lead.id === editingLead.id ? { ...lead, ...data } : lead))
        );
        setEditingLead(null);
      } catch (error) {
        console.error("Error updating lead", error);
        toast.error(CRM_MESSAGES.LEAD_UPDATED_ERROR);
      }
    }
    toast.success(CRM_MESSAGES.LEAD_UPDATED_SUCCESS);
    resetDialog();
  };

  // Delete selected leads
  const handleDelete = () => {
    setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
    setDialogMode(null);
    toast.success("Selected leads deleted successfully");
  };

  // Toggle lead selection
  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Select all leads on current page
  const toggleSelectAllOnPage = () => {
    const currentPageLeadIds = paginatedLeads.map((lead) => lead.id);
    const allSelected = currentPageLeadIds.every((id) =>
      selectedLeads.includes(id)
    );

    setSelectedLeads((prev) =>
      allSelected
        ? prev.filter((id) => !currentPageLeadIds.includes(id))
        : Array.from(new Set([...prev, ...currentPageLeadIds]))
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads_export.csv");
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "leads_export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import leads
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate imported data against schema
        const validLeads = data.filter((lead: any) => {
          try {
            leadSchema.parse(lead);
            return true;
          } catch {
            return false;
          }
        });

        setLeads((prev) => [
          ...prev,
          ...validLeads.map((lead: any) => ({
            ...lead,
            id: prev.length + validLeads.indexOf(lead) + 1,
          })),
        ]);
      } catch (error) {
        console.error("Invalid file format", error);
        alert("Invalid file format. Please upload a valid JSON file.");
      }
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
      default:
    }
  };
  const handleView = (id: number) => {
    router.push(`/leads/${id}`);
  };

  const handleStatusChange = async (id: number, value: string) => {
    const { name, color } = JSON.parse(value);

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, status: { name, color } } : lead
      )
    );
    updateLead({ id, leads: { name, color } });
    toast.success(`Lead status updated to ${name}`);
  };

  const handleAssignChange = (id: number, assign: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, assign } : lead
      )
    );
  };
  if (isLoadingStatus) return <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>;
  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Card className="w-full">
        {showFilters && (
          <FilterComponent
            values={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        )}
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <CardTitle className="text-lg md:text-xl lg:text-2xl">
            Lead Management
          </CardTitle>
          <div className="flex space-x-2">
            {/* Import Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <input
              type="file"
              id="import-leads"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("import-leads")?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" /> Import
            </Button>

            {/* Export Buttons */}
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <FileDown className="mr-2 h-4 w-4" /> Export JSON
            </Button>

            {/* Add Lead Button */}
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Delete Selected Button */}
          {selectedLeads.length > 0 && (
            <div className="mb-4">
              <Button
                variant="destructive"
                onClick={() => setDialogMode("delete")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {selectedLeads.length} Selected
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        paginatedLeads.length > 0 &&
                        paginatedLeads.every((lead) =>
                          selectedLeads.includes(lead.id)
                        )
                      }
                      onCheckedChange={toggleSelectAllOnPage}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Contact Method</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                      />
                    </TableCell>
                    <TableCell>{lead.Name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>

                    <TableCell>{lead.contact_method}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            initiateDirectContact(lead, lead.contact_method)
                          }
                          className="h-8 w-8"
                          title={`Contact via ${lead.contact_method}`}
                        >
                          {lead.contact_method === "WhatsApp" && (
                            <Send className="h-4 w-4" />
                          )}
                          {lead.contact_method === "Call" && (
                            <Phone className="h-4 w-4" />
                          )}
                          {lead.contact_method === "SMS" && (
                            <MessageCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(lead)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(lead.id)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="border-none">
                      <Select
                        defaultValue={JSON.stringify({
                          name: lead.status?.name || "Pending",
                          color: lead.status?.color || "#ea1212",
                        })}
                        onValueChange={(value) => handleStatusChange(lead.id, value)} // Uncomment and use for status change handler
                      >
                        <SelectTrigger
                          className="group relative w-[200px] overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30" style={{ backgroundColor: lead?.status?.color }} />
                              <div className="relative h-3 w-3 rounded-lg bg-gray-400" style={{ backgroundColor: lead?.status?.color }} />
                            </div>
                            <span className="text-sm font-medium">{lead.status.name}</span>
                          </div>
                        </SelectTrigger>

                        <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                          {statusData.data.map((status: { name: string; color: string }) => (
                            <SelectItem
                              key={status.name}
                              value={JSON.stringify({ name: status.name, color: status.color })}
                              className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                            >
                              <div className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="relative">
                                  {/* Glow effect */}
                                  <div
                                    className="absolute -inset-1 rounded-lg opacity-20 blur-sm transition-all duration-200 group-hover:opacity-40"
                                    style={{ backgroundColor: status.color }}
                                  />
                                  {/* Main dot */}
                                  <div
                                    className="relative h-3 w-3 rounded-lg transition-transform duration-200 group-hover:scale-110"
                                    style={{ backgroundColor: status.color }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  {status.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>

                      </Select>
                    </TableCell>


                    <TableCell className="border-none">
                      <Select
                        value={lead.assigne || "Pending"}
                        onValueChange={(value) => handleAssignChange(lead.id, value)} // Uncomment and use for status change handler
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-600">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-600">
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={dialogMode === "create" || dialogMode === "edit"}
        onOpenChange={() => resetDialog()}
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
                {/* <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
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
                      <SelectContent>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Email">Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the lead"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {dialogMode === "create" ? "Add Lead" : "Update Lead"}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Leads</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedLeads.length} lead(s)?</p>
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
