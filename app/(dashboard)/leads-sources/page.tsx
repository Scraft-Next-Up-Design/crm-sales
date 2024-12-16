'use client'

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Zod validation schema
const sourceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.enum(["Digital", "Personal", "Event"], { 
    required_error: "Please select a source type" 
  }),
  webhook: z.string().url({ message: "Invalid webhook URL" }).optional()
});

const LeadSourceManager: React.FC = () => {
  const [sources, setSources] = useState([
    { id: 1, name: 'Website', type: 'Digital', webhook: 'https://example.com/website-webhook' },
    { id: 2, name: 'Referral', type: 'Personal', webhook: '' },
    { id: 3, name: 'Social Media', type: 'Digital', webhook: 'https://example.com/social-webhook' }
  ]);
  const [selectedSource, setSelectedSource] = useState<z.infer<typeof sourceSchema> & { id?: number } | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'delete' | null>(null);

  // Form setup
  const form = useForm<z.infer<typeof sourceSchema>>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      type: undefined,
      webhook: "",
    }
  });

  // Reset form and dialog state
  const resetDialog = () => {
    form.reset();
    setSelectedSource(null);
    setDialogMode(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetDialog();
    setDialogMode('create');
  };

  // Open edit dialog
  const openEditDialog = (source: typeof sources[number]) => {
    form.reset({
      name: source.name,
      type: source.type as any,
      webhook: source.webhook
    });
    setSelectedSource({ ...source, type: source.type as "Digital" | "Personal" | "Event" });
    setDialogMode('edit');
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (source: typeof sources[number]) => {
    setSelectedSource({ ...source, type: source.type as "Digital" | "Personal" | "Event" });
    setDialogMode('delete');
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof sourceSchema>) => {
    if (dialogMode === 'create') {
      // Add new source
      setSources([
        ...sources, 
        { 
          id: sources.length + 1, 
          ...data, 
          webhook: data.webhook || '' 
        }
      ]);
    } else if (dialogMode === 'edit' && selectedSource) {
      // Update existing source
      setSources(sources.map(source => 
        source.id === selectedSource.id 
          ? { id: selectedSource.id, ...data, webhook: data.webhook || '' }
          : source
      ));
    }
    resetDialog();
  };

  // Handle delete source
  const handleDelete = () => {
    if (selectedSource) {
      setSources(sources.filter(source => source.id !== selectedSource.id));
      resetDialog();
    }
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <CardTitle className="text-lg md:text-xl lg:text-2xl">Lead Sources</CardTitle>
          <Button 
            onClick={openCreateDialog} 
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Source
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Webhook</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id} className="flex flex-col md:table-row">
                    <TableCell className="flex justify-between md:table-cell">
                      <span className="md:hidden font-bold">Name:</span>
                      {source.name}
                    </TableCell>
                    <TableCell className="flex justify-between md:table-cell">
                      <span className="md:hidden font-bold">Type:</span>
                      {source.type}
                    </TableCell>
                    <TableCell className="flex justify-between md:table-cell hidden lg:table-cell">
                      <span className="md:hidden font-bold">Webhook:</span>
                      {source.webhook || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-end">
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogMode === 'create' || dialogMode === 'edit'} 
        onOpenChange={() => resetDialog()}
      >
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Add New Lead Source' : 'Edit Lead Source'}
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
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Digital">Digital</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webhook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter webhook URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="w-full sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">
                  {dialogMode === 'create' ? 'Add Source' : 'Update Source'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={dialogMode === 'delete'} 
        onOpenChange={() => resetDialog()}
      >
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Are you sure you want to delete the lead source "{selectedSource?.name}"?</p>
          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadSourceManager;