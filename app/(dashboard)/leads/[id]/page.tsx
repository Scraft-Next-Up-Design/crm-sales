
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Building,
  Tag,
  Calendar,
  MessageSquare,
  Database,
  Loader2,
  Clipboard,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetLeadByIdQuery, useAddNotesMutation } from "@/lib/store/services/leadsApi";
import { formatDate } from "@/utils/date";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from "@/lib/supabaseClient";
interface Lead {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
  };
  companyInfo: {
    name: string;
    position: string;
    department?: string;
  };
  contactDetails: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  leadInfo: {
    source: string;
    status: "New" | "Contacted" | "Qualified" | "Unqualified";
    rating?: number;
    tags?: string[];
  };
  interactions: Array<{
    date: string;
    type: "Call" | "Email" | "Meeting";
    notes: string;
  }>;
  notes?: string[];
  createdAt: Date;
  lastUpdated: Date;
}


const IndividualLeadPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [addNotes] = useAddNotesMutation();
  const leadId = params?.id as string;
  const { data: leadsData, isLoading, error } = useGetLeadByIdQuery({ id: leadId });
  const leads = leadsData?.data
  const [notes, setNotes] = useState(leads?.notes || []);
  const [newNote, setNewNote] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user session on component mount
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user?.user_metadata);
    };

    fetchUser();
  }, []);
  console.log(user)
  const handleAddNote = () => {
    if (newNote.trim()) {
      // Combine the note text and author into a single string
      console.log(user)
      const author = user?.firstName
        || user.name || "Unknown"; // Provide a fallback for author
      const newNoteText = `${newNote} (added by ${author})`;

      // Update the notes array
      const updatedNotes = [...notes, { message: newNoteText }];
      setNotes(updatedNotes);
      setNewNote("");

      console.log(updatedNotes);

      // Pass the updated notes to the updateNotes function
      addNotes({ id: leadId, Note: updatedNotes });
    }
  };

  console.log()
  // Mock Lead Data - Replace with actual data fetching
  const lead: Lead = {
    id: "LEAD-001",
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
    },
    companyInfo: {
      name: "Tech Innovations Inc.",
      position: "Senior Product Manager",
      department: "Product Development",
    },
    contactDetails: {
      address: "123 Innovation Street",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      postalCode: "94105",
    },
    leadInfo: {
      source: "Conference",
      status: "Qualified",
      rating: 4,
      tags: ["Enterprise", "High Potential"],
    },
    interactions: [
      {
        date: "2024-01-15",
        type: "Call",
        notes: "Discussed product features and potential integration",
      },
      {
        date: "2024-02-03",
        type: "Email",
        notes: "Sent product demo invitation",
      },
    ],
    notes: [
      "Interested in premium solution",
      "Requires custom enterprise package",
    ],
    createdAt: new Date("2024-01-10"),
    lastUpdated: new Date("2024-02-05"),
  };
  if (!leads) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }
  const handleGoBack = () => {
    router.push("/leads");
  };

  const { custom_data } = leads[0]

  // const [copiedIndex, setCopiedIndex] = useState<any>(null);

  // const handleCopy = (value: string, index: number) => {
  //   navigator.clipboard.writeText(value);
  //   setCopiedIndex(index);
  //   setTimeout(() => setCopiedIndex(null), 2000);
  // };


  return (
    <div className="container mx-auto pt-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {leads[0]?.name}
            </CardTitle>
            <CardDescription className="my-4">
              <Badge>{leads[0]?.lead_source_id}</Badge>
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Leads
            </Button>
            <Button>Edit Lead</Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="mr-2 text-gray-500" size={20} />
                        <span>{leads[0]?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 text-gray-500" size={20} />
                        <span>{leads[0]?.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-gray-500" size={20} />
                        <span>{formatDate(leads[0]?.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Building className="mr-2 text-gray-500" size={20} />
                      <span>{lead.companyInfo.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="mr-2 text-gray-500 my-5" size={20} />
                      <span>{lead.companyInfo.position}</span>
                    </div>
                    <Card className="relative border-border/40">
                      <CardHeader className="space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-1">
                            <Database className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-foreground">
                            Custom Fields
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="grid gap-3">
                            {Object.entries(custom_data).map(([key, value], index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                  <div className="group relative flex items-center rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:bg-accent hover:border-accent">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-4">
                                        <div className="min-w-[120px]">
                                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
                                            {key}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <span className="block text-sm text-muted-foreground break-all">
                                            {value as string}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCopy(value as string, index);
                                      }}
                                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-accent rounded-md"
                                    >
                                      {copiedIndex === index ? (
                                        <Check className="h-4 w-4 text-primary" />
                                      ) : (
                                        <Clipboard className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                      )}
                                    </button> */}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover">
                                  <p className="text-popover-foreground">Click to copy</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Status and Tags */}
              <div className="mt-6 flex items-center space-x-4">
                <Badge variant="secondary">
                  Status: {leads[0]?.status?.name || "Pending"}
                </Badge>
                {/* {lead.leadInfo.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))} */}
              </div>
            </TabsContent>

            <TabsContent value="interactions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lead.interactions.map((interaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{interaction.date}</TableCell>
                      <TableCell>{interaction.type}</TableCell>
                      <TableCell>{interaction.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardContent className="pt-6">
                  {/* Text Area and Add Button */}
                  <div className="mb-4">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write a new note..."
                      rows={6}
                      className="w-full resize-vertical"
                    />
                    <Button
                      onClick={handleAddNote}
                      className="mt-2"
                      variant="default"
                    >
                      Add Note
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="grid gap-3">
                    {notes.map((dataItem: { message: string }, index: number) =>
                      Object.entries(dataItem).map(([key, value]) => (
                        <Tooltip key={`${key}-${index}`}>
                          <TooltipTrigger asChild>
                            <div className="group relative flex items-center rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:bg-accent hover:border-accent">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4">
                                  <div className="min-w-[120px]">
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
                                      {key}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="block text-sm text-muted-foreground break-all">
                                      {value as string}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover">
                            <p className="text-popover-foreground">Click to copy</p>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualLeadPage;
