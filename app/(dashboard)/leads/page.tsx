"use client";

import React, { useState, useMemo } from "react";
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
// Zod validation schema for lead
const leadSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number" }),
  company: z.string().optional(),
  position: z.string().optional(),
  contactMethod: z.enum(["WhatsApp", "SMS", "Call"], {
    required_error: "Please select a contact method",
  }),
  notes: z.string().optional(),
});

const LeadManagement: React.FC = () => {
  const router = useRouter();

  const [leads, setLeads] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+15551234567",
      company: "Acme Corp",
      position: "Sales Manager",
      contactMethod: "WhatsApp",
      notes: "Potential big client",
    },
  ]);

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
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      contactMethod: undefined,
      notes: "",
    },
  });

  // Reset dialog state
  const resetDialog = () => {
    form.reset();
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
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      contactMethod: lead.contactMethod,
      notes: lead.notes,
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
          notes: data.notes || "",
        },
      ]);
    } else if (dialogMode === "edit" && editingLead) {
      // Update existing lead
      setLeads(
        leads.map((lead) =>
          lead.id === editingLead.id
            ? {
                id: editingLead.id,
                ...data,
                company: data.company || "",
                position: data.position || "",
                notes: data.notes || "",
              }
            : lead
        )
      );
    }
    resetDialog();
  };

  // Delete selected leads
  const handleDelete = () => {
    setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
    setDialogMode(null);
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
      // toast({
      //   title: "Contact Method Error",
      //   description: "Invalid contact method selected.",
      //   variant: "destructive"
      // });
    }
  };
  const handleView = (id: number) => {
    router.push(`/leads/${id}`);
  };
  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <CardTitle className="text-lg md:text-xl lg:text-2xl">
            Lead Management
          </CardTitle>
          <div className="flex space-x-2">
            {/* Import Button */}
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
                    <TableCell>{`${lead.firstName} ${lead.lastName}`}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.contactMethod}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            initiateDirectContact(lead, lead.contactMethod)
                          }
                          className="h-8 w-8"
                          title={`Contact via ${lead.contactMethod}`}
                        >
                          {lead.contactMethod === "WhatsApp" && (
                            <Send className="h-4 w-4" />
                          )}
                          {lead.contactMethod === "Call" && (
                            <Phone className="h-4 w-4" />
                          )}
                          {lead.contactMethod === "SMS" && (
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
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
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
                name="contactMethod"
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
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
              />
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
