// "use client";

// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   MapPin,
//   Mail,
//   Phone,
//   Building,
//   Tag,
//   Calendar,
//   MessageSquare,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// // Comprehensive Lead Interface
// interface Lead {
//   id: string;
//   personalInfo: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     dateOfBirth?: string;
//   };
//   companyInfo: {
//     name: string;
//     position: string;
//     department?: string;
//   };
//   contactDetails: {
//     address?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     postalCode?: string;
//   };
//   leadInfo: {
//     source: string;
//     status: "New" | "Contacted" | "Qualified" | "Unqualified";
//     rating?: number;
//     tags?: string[];
//   };
//   interactions: Array<{
//     date: string;
//     type: "Call" | "Email" | "Meeting";
//     notes: string;
//   }>;
//   notes?: string[];
//   createdAt: Date;
//   lastUpdated: Date;
// }

// const IndividualLeadPage: React.FC = () => {
//   const router = useRouter();

//   // Mock Lead Data - Replace with actual data fetching
//   const lead: Lead = {
//     id: "LEAD-001",
//     personalInfo: {
//       firstName: "John",
//       lastName: "Doe",
//       email: "john.doe@example.com",
//       phone: "+1 (555) 123-4567",
//       dateOfBirth: "1985-06-15",
//     },
//     companyInfo: {
//       name: "Tech Innovations Inc.",
//       position: "Senior Product Manager",
//       department: "Product Development",
//     },
//     contactDetails: {
//       address: "123 Innovation Street",
//       city: "San Francisco",
//       state: "CA",
//       country: "United States",
//       postalCode: "94105",
//     },
//     leadInfo: {
//       source: "Conference",
//       status: "Qualified",
//       rating: 4,
//       tags: ["Enterprise", "High Potential"],
//     },
//     interactions: [
//       {
//         date: "2024-01-15",
//         type: "Call",
//         notes: "Discussed product features and potential integration",
//       },
//       {
//         date: "2024-02-03",
//         type: "Email",
//         notes: "Sent product demo invitation",
//       },
//     ],
//     notes: [
//       "Interested in premium solution",
//       "Requires custom enterprise package",
//     ],
//     createdAt: new Date("2024-01-10"),
//     lastUpdated: new Date("2024-02-05"),
//   };

//   const handleGoBack = () => {
//     router.push("/leads");
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle>
//               {lead.personalInfo.firstName} {lead.personalInfo.lastName}
//             </CardTitle>
//             <CardDescription>
//               {lead.companyInfo.position} at {lead.companyInfo.name}
//             </CardDescription>
//           </div>
//           <div className="flex space-x-2">
//             <Button variant="outline" onClick={handleGoBack}>
//               Back to Leads
//             </Button>
//             <Button>Edit Lead</Button>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="overview">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="interactions">Interactions</TabsTrigger>
//               <TabsTrigger value="notes">Notes</TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview">
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Personal Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Personal Information</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       <div className="flex items-center">
//                         <Mail className="mr-2 text-gray-500" size={20} />
//                         <span>{lead.personalInfo.email}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Phone className="mr-2 text-gray-500" size={20} />
//                         <span>{lead.personalInfo.phone}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Calendar className="mr-2 text-gray-500" size={20} />
//                         <span>{lead.personalInfo.dateOfBirth}</span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Company Information */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Company Details</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       <div className="flex items-center">
//                         <Building className="mr-2 text-gray-500" size={20} />
//                         <span>{lead.companyInfo.name}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <Tag className="mr-2 text-gray-500" size={20} />
//                         <span>{lead.companyInfo.position}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <MapPin className="mr-2 text-gray-500" size={20} />
//                         <span>
//                           {lead.contactDetails.address},{" "}
//                           {lead.contactDetails.city},{lead.contactDetails.state}{" "}
//                           {lead.contactDetails.postalCode}
//                         </span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Lead Status and Tags */}
//               <div className="mt-6 flex items-center space-x-4">
//                 <Badge variant="secondary">
//                   Status: {lead.leadInfo.status}
//                 </Badge>
//                 {lead.leadInfo.tags?.map((tag) => (
//                   <Badge key={tag} variant="outline">
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             </TabsContent>

//             <TabsContent value="interactions">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Notes</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {lead.interactions.map((interaction, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{interaction.date}</TableCell>
//                       <TableCell>{interaction.type}</TableCell>
//                       <TableCell>{interaction.notes}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TabsContent>

//             <TabsContent value="notes">
//               <Card>
//                 <CardContent className="pt-6">
//                   {lead.notes?.map((note, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center mb-2 p-3 bg-gray-50 rounded"
//                     >
//                       <MessageSquare className="mr-2 text-gray-500" size={20} />
//                       {note}
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default IndividualLeadPage;









"use client";
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
  MapPin,
  Mail,
  Phone,
  Building,
  Tag,
  Calendar,
  MessageSquare,
  Loader,
  Database,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetLeadByIdQuery } from "@/lib/store/services/leadsApi";
import { formatDate } from "@/utils/date";

// Comprehensive Lead Interface
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
  const leadId = params?.id as string;
  const { data: leadsData, isLoading, error } = useGetLeadByIdQuery({ id: leadId });
  const leads = leadsData?.data
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
  console.log(leads[0])
  return (
    <div className="container mx-auto p-6">
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
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="mr-2 text-gray-500" size={20} />
                        <span>{lead.companyInfo.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="mr-2 text-gray-500" size={20} />
                        <span>{lead.companyInfo.position}</span>
                      </div>
                      <div className="flex items-center">
                        <Database className="mr-2 text-gray-500" size={20} />
                        {/* <span>
                          {lead.contactDetails.address},{" "}
                          {lead.contactDetails.city},{lead.contactDetails.state}{" "}
                          {lead.contactDetails.postalCode}
                        </span> */}

                        {leads[0]?.custom_data?.data?.length > 0 && (
                          <div>
                            {leads[0]?.custom_data?.data?.map((field: any, index: number) => (
                              <div key={index} className="flex items-center">
                                <span className="font-semibold mr-2">{field.name}:</span>
                                <span>{field.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Status and Tags */}
              <div className="mt-6 flex items-center space-x-4">
                <Badge variant="secondary">
                  Status: {lead.leadInfo.status}
                </Badge>
                {lead.leadInfo.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
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
                  {lead.notes?.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-center mb-2 p-3 bg-gray-50 rounded"
                    >
                      <MessageSquare className="mr-2 text-gray-500" size={20} />
                      {note}
                    </div>
                  ))}
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
