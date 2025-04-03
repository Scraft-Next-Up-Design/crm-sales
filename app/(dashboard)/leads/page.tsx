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
import { skipToken } from "@reduxjs/toolkit/query";
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
import { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import * as z from "zod";
import FilterComponent from "./filter";

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

interface Lead {
  id: number;
  Name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  contact_method: string;
  owner: string;
  status: string;
  revenue: number;
  assign_to: string;
  createdAt: string;
  isDuplicate: boolean;
  is_email_valid: boolean;
  is_phone_valid: boolean;
  sourceId?: string | null;
}

const SkeletonTableRow = memo(() => (
  <TableRow className="animate-pulse">
    <TableCell className="px-2 py-1">
      <div className="w-4 h-4 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1">
      <div className="h-4 w-32 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1">
      <div className="h-4 w-48 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-32 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-4 w-24 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="flex space-x-1">
        <div className="h-6 w-6 bg-gray-300 rounded" />
        <div className="h-6 w-6 bg-gray-300 rounded" />
        <div className="h-6 w-6 bg-gray-300 rounded" />
      </div>
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-10 w-40 bg-gray-300 rounded" />
    </TableCell>
    <TableCell className="px-2 py-1 hidden md:table-cell">
      <div className="h-10 w-40 bg-gray-300 rounded" />
    </TableCell>
  </TableRow>
));
SkeletonTableRow.displayName = "SkeletonTableRow";

const LeadTableRow = memo(
  ({
    lead,
    selectedLeads,
    toggleLeadSelection,
    initiateDirectContact,
    openEditDialog,
    handleView,
    handleStatusChange,
    handleAssignChange,
    statusData,
    workspaceMembers,
    expandedRow,
    toggleRow,
  }: any) => (
    <>
      <TableRow
        key={lead.id}
        className="flex md:hidden items-center justify-between text-[14px] border-b border-gray-300 py-2 last:border-none"
      >
        <div className="flex gap-4">
          <TableCell className="px-2 py-1">
            <Checkbox
              checked={selectedLeads.includes(lead.id)}
              onCheckedChange={() => toggleLeadSelection(lead.id)}
            />
          </TableCell>
          <div>
            <div className="px-2 py-1">
              {lead.Name}
              {lead.isDuplicate && (
                <span
                  style={{ color: "red", fontSize: "0.7em" }}
                  className="hidden md:block"
                >
                  Duplicate Lead
                </span>
              )}
            </div>
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
                      lead.is_email_valid ? "text-emerald-800" : "text-red-800"
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
            className="h-8 w-8 border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"
          >
            {expandedRow === lead.id ? <ChevronUp /> : <ChevronDown />}
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
                    lead.is_phone_valid ? "text-emerald-800" : "text-red-800"
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
            <div className="px-2 py-1">{formatDate(lead.createdAt)}</div>
          </div>
          <div className="p-3 grid grid-cols-2 items-center">
            <span className="text-gray-600">Action</span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => initiateDirectContact(lead, lead.contact_method)}
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
              onValueChange={(value) => handleStatusChange(lead.id, value)}
            >
              <SelectTrigger className="group relative overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30"
                      style={{ backgroundColor: lead?.status?.color }}
                    />
                    <div
                      className="relative h-3 w-3 rounded-lg bg-gray-400"
                      style={{ backgroundColor: lead?.status?.color }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {lead?.status?.name}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
                {statusData?.data.map((status: any) => (
                  <SelectItem
                    key={status.name}
                    value={JSON.stringify({
                      name: status.name,
                      color: status.color,
                    })}
                    className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                  >
                    <div className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="relative">
                        <div
                          className="absolute -inset-1 rounded-lg opacity-20 blur-sm transition-all duration-200 group-hover:opacity-40"
                          style={{ backgroundColor: status.color }}
                        />
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
          </div>
          <div className="px-3 py-1 grid grid-cols-2 items-center">
            <span className="text-gray-600">Assign</span>
            <Select
              defaultValue={JSON.stringify({
                name: lead?.assign_to?.name || "Not Assigned",
                role: lead?.assign_to?.role || "(Not Assigned)",
              })}
              onValueChange={(value) => handleAssignChange(lead.id, value)}
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
                  value={JSON.stringify({ name: "Unassigned", role: "none" })}
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
                    (member: any) => member.name && member.name !== "null"
                  )
                  .map((member: any) => (
                    <SelectItem
                      key={member.name}
                      value={JSON.stringify({
                        name: member.name,
                        role: member.role,
                      })}
                      className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {member.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </TableRow>
      )}
      {/* Desktop View */}
      <TableRow key={`${lead.id}-desktop`} className="hidden md:table-row">
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
                  lead.is_email_valid ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {lead.email}
              </span>
              {!lead.is_email_valid && (
                <div className="text-xs text-red-600 mt-0.5">Invalid Email</div>
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
                  lead.is_phone_valid ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {lead.phone}
              </span>
              {!lead.is_phone_valid && (
                <div className="text-xs text-red-600 mt-0.5">Invalid Phone</div>
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
              onClick={() => initiateDirectContact(lead, lead.contact_method)}
              className="h-6 w-6"
              title={`Contact via ${lead.contact_method}`}
            >
              {lead.contact_method === "WhatsApp" && (
                <Send className="h-3 w-3" />
              )}
              {lead.contact_method === "Call" && <Phone className="h-3 w-3" />}
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
            onValueChange={(value) => handleStatusChange(lead.id, value)}
          >
            <SelectTrigger className="group relative w-[200px] overflow-hidden rounded-xl border-0 bg-white px-4 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="absolute -inset-1 rounded-lg bg-gray-400 opacity-20 blur-sm transition-opacity duration-200 group-hover:opacity-30"
                    style={{ backgroundColor: lead?.status?.color }}
                  />
                  <div
                    className="relative h-3 w-3 rounded-lg bg-gray-400"
                    style={{ backgroundColor: lead?.status?.color }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {lead?.status?.name}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="overflow-hidden rounded-xl border-0 bg-white p-2 shadow-2xl dark:bg-gray-800">
              {statusData?.data.map((status: any) => (
                <SelectItem
                  key={status.name}
                  value={JSON.stringify({
                    name: status.name,
                    color: status.color,
                  })}
                  className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                >
                  <div className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="relative">
                      <div
                        className="absolute -inset-1 rounded-lg opacity-20 blur-sm transition-all duration-200 group-hover:opacity-40"
                        style={{ backgroundColor: status.color }}
                      />
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
        <TableCell className="border-none hidden md:table-cell">
          <Select
            defaultValue={JSON.stringify({
              name: lead?.assign_to?.name || "Not Assigned",
              role: lead?.assign_to?.role || "(Not Assigned)",
            })}
            onValueChange={(value) => handleAssignChange(lead.id, value)}
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
                value={JSON.stringify({ name: "Unassigned", role: "none" })}
                className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Unassigned
                  </span>
                </div>
              </SelectItem>
              {workspaceMembers?.data
                .filter((member: any) => member.name && member.name !== "null")
                .map((member: any) => (
                  <SelectItem
                    key={member.name}
                    value={JSON.stringify({
                      name: member.name,
                      role: member.role,
                    })}
                    className="cursor-pointer rounded-lg outline-none transition-colors focus:bg-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {member.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </TableCell>
      </TableRow>
    </>
  )
);
LeadTableRow.displayName = "LeadTableRow";

const LeadManagement = memo(() => {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );
  const router = useRouter();

  // RTK Query Hooks
  const { data: activeWorkspace, isLoading: isLoadingWorkspace }: any =
    useGetActiveWorkspaceQuery();
  const workspaceId: any = activeWorkspace?.data?.id;
  const { data: leadSources, isLoading: isLoadingSources }: any =
    useGetWebhooksQuery({ id: workspaceId }, { skip: !workspaceId });
  const { data: workspaceData, isLoading: isLoadingLeads }: any =
    useGetLeadsByWorkspaceQuery(
      workspaceId ? { workspaceId: workspaceId.toString() } : skipToken,
      { skip: !workspaceId || isLoadingWorkspace, pollingInterval: 60000 }
    );
  const { data: workspaceMembers, isLoading: isLoadingMembers }: any =
    useGetWorkspaceMembersQuery(workspaceId, { skip: !workspaceId });
  const { data: statusData, isLoading: isLoadingStatus }: any =
    useGetStatusQuery(workspaceId, {
      skip: !workspaceId,
    });

  const [createLead]: any = useCreateLeadMutation();
  const [createManyLead]: any = useCreateManyLeadMutation();
  const [updateLeadData, { isLoading: isUpdateLoading }]: any =
    useUpdateLeadDataMutation();
  const [updateLead]: any = useUpdateLeadMutation();
  const [assignRole]: any = useAssignRoleMutation();
  const [deleteLeadsData]: any = useBulkDeleteLeadsMutation();

  const [searchQuery, setSearchQuery] = useState<any>("");
  const [expandedRow, setExpandedRow] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<any>(false);
  const [filters, setFilters] = useState<any>(initialFilters);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [editingLead, setEditingLead] = useState<any>(null);

  useEffect(() => {
    if (!isLoadingLeads && workspaceData?.data) {
      const fetchedLeads = workspaceData.data.map((lead: any, index: any) => ({
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
      }));

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

      const updatedLeads = fetchedLeads.map((lead: any) => ({
        ...lead,
        isDuplicate: duplicates.has(lead.id),
      }));

      setLeads(
        updatedLeads.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    }
  }, [workspaceData, isLoadingLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
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
        )
          return false;
      }
      if (filters.owner && !lead.assign_to?.name?.includes(filters.owner))
        return false;
      if (filters.leadSource && filters.leadSource !== "all") {
        const leadSourceId = leadSources?.data.find(
          (source: any) => source.name === filters.leadSource
        )?.id;
        if (lead.sourceId !== leadSourceId) return false;
      }
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
          (l: any) => l.email === lead.email || l.phone === lead.phone
        );
        if (duplicates.length <= 1) return false;
      }
      return true;
    });
  }, [leads, filters, searchQuery, leadSources]);

  const leadsPerPage = 10;
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * leadsPerPage;
    return filteredLeads.slice(startIndex, startIndex + leadsPerPage);
  }, [filteredLeads, currentPage]);

  const form = useForm({
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

  const toggleRow = (id: any) => setExpandedRow(expandedRow === id ? null : id);
  const handleFilterReset = () => {
    setFilters(initialFilters);
    setShowFilters(false);
  };
  const handleFilterChange = (newFilters: any) => setFilters(newFilters);
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
    form.reset(lead);
    setEditingLead(lead);
    setDialogMode("edit");
  };
  const toggleLeadSelection = (leadId: any) =>
    setSelectedLeads((prev: any) =>
      prev.includes(leadId)
        ? prev.filter((id: any) => id !== leadId)
        : [...prev, leadId]
    );
  const deselectAll = () => setSelectedLeads([]);
  const toggleSelectAllOnPage = () => {
    const currentPageLeadIds = paginatedLeads.map((lead: any) => lead.id);
    const allSelected = currentPageLeadIds.every((id: any) =>
      selectedLeads.includes(id)
    );
    setSelectedLeads((prev: any) =>
      allSelected
        ? prev.filter((id: any) => !currentPageLeadIds.includes(id))
        : Array.from(new Set([...prev, ...currentPageLeadIds]))
    );
  };

  const onSubmit = async (data: any) => {
    try {
      if (dialogMode === "create") {
        const response: any = await createLead({
          workspaceId,
          body: data,
        }).unwrap();
        setLeads((prev: any) => [
          ...prev,
          {
            ...data,
            id: response.data.id,
            createdAt: new Date().toISOString(),
            isDuplicate: false,
          },
        ]);
        toast.success("Lead created successfully");
      } else if (dialogMode === "edit" && editingLead) {
        await updateLeadData({ id: editingLead.id, leads: data }).unwrap();
        setLeads((prev: any) =>
          prev.map((lead: any) =>
            lead.id === editingLead.id ? { ...lead, ...data } : lead
          )
        );
        toast.success(CRM_MESSAGES.LEAD_UPDATED_SUCCESS);
      }
      resetDialog();
    } catch (error: any) {
      const errorMessage: any = error?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLeadsData({ id: selectedLeads, workspaceId }).unwrap();
      setLeads((prev: any) =>
        prev.filter((lead: any) => !selectedLeads.includes(lead.id))
      );
      setSelectedLeads([]);
      setDialogMode(null);
      toast.success("Selected leads deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete leads");
    }
  };

  const exportToCSV = () => {
    const formattedLeads = leads.map((lead: any) => {
      const matchedSource = leadSources?.data.find((source: any) =>
        source.webhook_url?.includes(lead.sourceId)
      );
      const formattedSourceDate = matchedSource
        ? new Date(matchedSource.created_at)
            .toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", "")
        : "";
      return {
        Name: lead.Name,
        email: lead.email.toLowerCase(),
        phone: lead.phone,
        company: lead.company,
        position: lead.position,
        contact_method: lead.contact_method,
        owner: lead.owner,
        status: lead.status ? String(lead.status.name) : "Unknown",
        revenue: lead.revenue,
        assign_to: lead.assign_to?.name || lead.assign_to,
        createdAt: new Date(lead.createdAt)
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", ""),
        isDuplicate: lead.isDuplicate,
        is_email_valid: lead.is_email_valid,
        is_phone_valid: lead.is_phone_valid,
        source: matchedSource
          ? `${matchedSource.name}-${formattedSourceDate}`
          : "No Source",
      };
    });
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

  const handleImportCSV = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result: any) => {
        const normalizedData = result.data.map((lead: any) => ({
          name: lead.Name?.trim() || "",
          email: lead.email,
          phone: String(lead.phone)
            .replace(/[^\d+]/g, "")
            .replace(/^([^+])/, "+$1")
            .trim(),
          company: lead.company || "",
          position: lead.position || "",
          contact_method: lead.contact_method || "",
          revenue: Number(lead.revenue) || 0,
        }));
        const validLeads = normalizedData.filter((lead: any) => {
          try {
            leadSchema.parse(lead);
            return true;
          } catch {
            return false;
          }
        });
        if (validLeads.length) {
          await createManyLead({ workspaceId, body: validLeads }).unwrap();
          setLeads((prev: any) => [...prev, ...validLeads]);
          toast.success("Leads imported successfully");
        } else {
          toast.error("No valid leads found.");
        }
        event.target.value = "";
      },
      error: () => toast.error("Invalid file format"),
    });
  };

  const initiateDirectContact = (lead: any, method: any) => {
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

  const handleView = (id: any) => router.push(`/leads/${id}`);

  const handleStatusChange = async (id: any, value: any) => {
    const { name, color } = JSON.parse(value);
    try {
      await updateLead({ id, leads: { status: { name, color } } }).unwrap();
      setLeads((prev: any) =>
        prev.map((lead: any) =>
          lead.id === id ? { ...lead, status: { name, color } } : lead
        )
      );
      toast.success(`Lead status updated to ${name}`);
    } catch {
      toast.error("Failed to update lead status");
    }
  };

  const handleAssignChange = async (id: any, value: any) => {
    const { name, role } = JSON.parse(value);
    try {
      await assignRole({ id, data: { name, role }, workspaceId }).unwrap();
      setLeads((prev: any) =>
        prev.map((lead: any) =>
          lead.id === id ? { ...lead, assign_to: { name, role } } : lead
        )
      );
      toast.success(`Lead assigned to ${name}`);
    } catch {
      toast.error("Failed to assign lead");
    }
  };

  const handleGoBack = () => router.push("/dashboard");

  const isLoading = useMemo(
    () =>
      isLoadingWorkspace ||
      isLoadingLeads ||
      isLoadingMembers ||
      isLoadingStatus ||
      isLoadingSources,
    [
      isLoadingWorkspace,
      isLoadingLeads,
      isLoadingMembers,
      isLoadingStatus,
      isLoadingSources,
    ]
  );

  const containerClassName = useMemo(
    () =>
      `transition-all duration-500 ease-in-out md:px-4 md:py-6 py-2 px-2 ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } w-auto overflow-hidden`,
    [isCollapsed]
  );

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <Card className="w-full rounded-[16px] md:rounded-[4px] overflow-hidden">
          <CardHeader className="grid grid-cols-6 items-center grid-rows-3 md:gap-4 md:flex md:flex-row md:justify-between p-0 md:p-3 border-b-2 border-gray-200 md:border-none animate-pulse">
            <div className="md:bg-white dark:md:bg-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-between col-start-1 col-end-7 p-3 md:p-0">
              <div className="h-6 w-40 bg-gray-300 rounded" />
              <div className="h-10 w-32 bg-gray-300 rounded md:hidden" />
            </div>
            <div className="relative w-full md:w-64 row-start-2 row-end-3 px-4 md:px-0 col-start-1 col-end-6">
              <div className="h-10 w-full bg-gray-300 rounded" />
            </div>
            <div className="hidden md:flex space-x-2">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-300 rounded" />
                ))}
            </div>
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
            className="mt-6 px-6 py-2 bg-primary text-white rounded-md shadow-md hover:bg-primary-dark"
            onClick={handleGoBack}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
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
          <div className="hidden md:flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />{" "}
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
                <Trash2 className="mr-2 h-4 w-4" /> Delete{" "}
                {selectedLeads.length} Selected
              </Button>
              <Button variant="secondary" onClick={deselectAll}>
                <X className="mr-2 h-4 w-4" /> Deselect All
              </Button>
            </div>
          )}
          <div className="text-xs">
            <Table className="text-xs">
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead className="px-2 py-1">
                    <Checkbox
                      checked={
                        paginatedLeads.length > 0 &&
                        paginatedLeads.every((lead: any) =>
                          selectedLeads.includes(lead.id)
                        )
                      }
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
                {paginatedLeads.map((lead: any) => (
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    selectedLeads={selectedLeads}
                    toggleLeadSelection={toggleLeadSelection}
                    initiateDirectContact={initiateDirectContact}
                    openEditDialog={openEditDialog}
                    handleView={handleView}
                    handleStatusChange={handleStatusChange}
                    handleAssignChange={handleAssignChange}
                    statusData={statusData}
                    workspaceMembers={workspaceMembers}
                    expandedRow={expandedRow}
                    toggleRow={toggleRow}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev: any) => Math.max(1, prev - 1))
              }
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
                setCurrentPage((prev: any) => Math.min(totalPages, prev + 1))
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
                <Button type="submit" disabled={isUpdateLoading}>
                  {isUpdateLoading
                    ? "Loading..."
                    : dialogMode === "create"
                    ? "Add Lead"
                    : "Update Lead"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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
});

LeadManagement.displayName = "LeadManagement";

export default LeadManagement;
