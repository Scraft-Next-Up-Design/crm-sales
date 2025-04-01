"use client";
import { DynamicDataTable } from "@/components/dashboard/dynamic-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  createdAt: string;
};

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
] as ColumnDef<unknown>[];

const data = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc",
    status: "New",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    company: "Tech Corp",
    status: "In Progress",
    createdAt: "2024-01-02",
  },
] as unknown[];

export default function LeadsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Leads</CardTitle>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </CardHeader>
      <CardContent>
        <DynamicDataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
