import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Added import for Checkbox
import Header from "@/components/header";
import { JobListing, Application } from "@shared/schema";
import { Loader2, Search, X, LineChart } from "lucide-react";
import StoreLocationAutocomplete from "@/components/store-location-autocomplete";
import JobTemplateSelector from "@/components/job-template-selector";
import DashboardCharts from "@/components/dashboard-charts";

// Job creation schema
const createJobSchema = z.object({
  title: z.string().min(3, "Job title is required"),
  location: z.string().min(3, "Location is required"),
  description: z.string().min(10, "Description is required"),
  requirements: z.string().min(10, "Requirements are required"),
  jobType: z.string().min(1, "Job type is required"),
  department: z.string().optional(),
  payRange: z.string().optional(),
  closingDate: z.string().optional(),
  benefits: z.string().optional(),
  status: z.string().default("active"),
});

type CreateJobFormValues = z.infer<typeof createJobSchema>;

export default function FranchiseeDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("jobListings");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobSortOrder, setJobSortOrder] = useState<"newest" | "oldest" | "applications">("newest");
  const [showCharts, setShowCharts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedJobFilter, setSelectedJobFilter] = useState("all"); // Added state for job filter
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all"); // Added state for application status filter
  const [workAvailabilityFilter, setWorkAvailabilityFilter] = useState({ // Added state for work availability filter
    holidayWork: false,
    weekdayWork: false,
    weekendWork: false,
    morningShift: false,
    afternoonShift: false,
    nightShift: false,
  });


  // Queries for job listings
  const {
    data: jobs,
    isLoading: isJobsLoading,
    error: jobsError
  } = useQuery<JobListing[]>({
    queryKey: ["/api/my-jobs"],
  });

  // Query for applications
  const {
    data: applications,
    isLoading: isApplicationsLoading,
    error: applicationsError
  } = useQuery<Application[]>({
    queryKey: ["/api/my-applications"],
  });

  // Job creation form
  const jobForm = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      requirements: "",
      jobType: "",
      department: "",
      payRange: "",
      closingDate: format(new Date(), "yyyy-MM-dd") as any,
      benefits: "",
      status: "active",
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const res = await apiRequest("POST", "/api/jobs", jobData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Created",
        description: "Your job listing has been successfully created",
      });
      jobForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      setActiveTab("jobListings");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error creating the job listing",
        variant: "destructive",
      });
    },
  });

  // Update job status mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      toast({
        title: "Job Updated",
        description: "The job status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error updating the job",
        variant: "destructive",
      });
    },
  });

  // Auto-show charts when data is loaded
  useEffect(() => {
    if (jobs?.length && applications?.length && !isJobsLoading && !isApplicationsLoading) {
      setShowCharts(true);
    }
  }, [jobs, applications, isJobsLoading, isApplicationsLoading]);

  // Submit job form
  const onSubmitJobForm = (data: CreateJobFormValues) => {
    // Convert date string to ISO format for consistent handling
    if (data.closingDate) {
      // Send the date as a string in ISO format
      const formattedData = {
        ...data,
        closingDate: new Date(data.closingDate).toISOString()
      };
      createJobMutation.mutate(formattedData);
    } else {
      createJobMutation.mutate(data);
    }
  };

  // Handle job status change with confirmation
  const handleJobStatusChange = (jobId: number, newStatus: string) => {
    // Add confirmation for sensitive status changes
    if (newStatus === "closed") {
      if (window.confirm("Are you sure you want to close this job listing? It will no longer be visible to applicants.")) {
        updateJobMutation.mutate({ id: jobId, status: newStatus });
      }
    } else {
      updateJobMutation.mutate({ id: jobId, status: newStatus });
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Filter and sort jobs based on status, search query, and sort order
  const filteredJobs = jobs ? jobs.filter(job => {
    // First filter by status
    if (jobStatusFilter !== "all" && job.status !== jobStatusFilter) {
      return false;
    }

    // Then filter by search query if one exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    return true;
  })
    // Then sort the filtered jobs
    .sort((a, b) => {
      if (jobSortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (jobSortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (jobSortOrder === "applications") {
        const aCount = applications?.filter(app => app.jobId === a.id).length || 0;
        const bCount = applications?.filter(app => app.jobId === b.id).length || 0;
        return bCount - aCount;
      }
      return 0;
    }) : [];



  // Calculate dashboard stats
  const dashboardStats = {
    activeJobListings: jobs?.filter(job => job.status === "active").length || 0,
    positionsFilled: jobs?.filter(job => job.status === "filled").length || 0,
    totalApplications: applications?.length || 0,
    acceptedApplicants: applications?.filter(app => app.status === "accepted").length || 0,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Franchisee Dashboard"
        showBackButton={false}
        showLogout={true}
        onLogout={handleLogout}
        franchiseeName={user?.franchiseeName}
        franchiseeId={user?.franchiseeId}
      />

      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-6">Job Management Dashboard</h1>

            {/* Dashboard Stats Cards - Improved for mobile responsiveness */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 transition-all hover:shadow-md">
                <h3 className="text-blue-800 font-medium text-sm mb-1">Active Job Listings</h3>
                <p className="text-2xl font-bold text-blue-900">
                  {isJobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats.activeJobListings}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 transition-all hover:shadow-md">
                <h3 className="text-purple-800 font-medium text-sm mb-1">Positions Filled</h3>
                <p className="text-2xl font-bold text-purple-900">
                  {isJobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats.positionsFilled}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 transition-all hover:shadow-md">
                <h3 className="text-orange-800 font-medium text-sm mb-1">Total Applications</h3>
                <p className="text-2xl font-bold text-orange-900">
                  {isApplicationsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats.totalApplications}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100 transition-all hover:shadow-md">
                <h3 className="text-green-800 font-medium text-sm mb-1">Accepted Applicants</h3>
                <p className="text-2xl font-bold text-green-900">
                  {isApplicationsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : dashboardStats.acceptedApplicants}
                </p>
              </div>
            </div>

            {/* Analytics Charts Toggle */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">Analytics Overview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="flex items-center gap-2"
              >
                <LineChart size={16} />
                {showCharts ? "Hide Charts" : "Show Charts"}
              </Button>
            </div>

            {/* Dashboard Charts */}
            {showCharts && (isJobsLoading || isApplicationsLoading) ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">Loading analytics data...</p>
              </div>
            ) : showCharts && jobs && applications ? (
              <DashboardCharts jobs={jobs} applications={applications} />
            ) : null}

          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200">
                <TabsList className="flex rounded-none bg-transparent h-auto border-b border-b-transparent">
                  <TabsTrigger
                    value="jobListings"
                    className="data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none"
                  >
                    Job Listings
                  </TabsTrigger>
                  <TabsTrigger
                    value="createJob"
                    className="data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none"
                  >
                    Create Job
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content: Job Listings */}
              <TabsContent value="jobListings" className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
                    <h2 className="text-xl font-semibold text-neutral-800">Your Job Listings</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={jobStatusFilter}
                        onValueChange={setJobStatusFilter}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={jobSortOrder}
                        onValueChange={(value: "newest" | "oldest" | "applications") => setJobSortOrder(value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="applications">Most Applications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Search Box */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search job listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 py-2 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {isJobsLoading ? (
                    <div className="p-6 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p className="mt-2 text-gray-500">Loading your job listings...</p>
                    </div>
                  ) : jobsError ? (
                    <div className="p-6 text-center">
                      <p className="text-red-500">Error loading job listings</p>
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-6 text-center">
                      {searchQuery ? (
                        <>
                          <p className="text-gray-500">No job listings found matching "{searchQuery}"</p>
                          <Button
                            onClick={() => setSearchQuery("")}
                            className="mt-4"
                            variant="outline"
                          >
                            Clear Search
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-500">No job listings found</p>
                          <Button
                            onClick={() => setActiveTab("createJob")}
                            className="mt-4 bg-[#ff7a00] hover:bg-orange-600"
                          >
                            Create Your First Job
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-6 hover:bg-neutral-100 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/job/${job.id}`)}
                        >
                          <div className="flex justify-between flex-col sm:flex-row">
                            <div>
                              <h3 className="text-lg font-semibold text-neutral-800 mb-1">{job.title}</h3>
                              <p className="text-gray-600 mb-2">
                                Posted on {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.status === "active" && (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    Active
                                  </span>
                                )}
                                {job.status === "filled" && (
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    Filled
                                  </span>
                                )}
                                {job.status === "closed" && (
                                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                    Closed
                                  </span>
                                )}
                                <span className="bg-neutral-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                  {applications?.filter(app => app.jobId === job.id).length || 0} Applications
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                              {job.status === "active" ? (
                                <Button
                                  variant="outline"
                                  className="border-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobStatusChange(job.id, "closed");
                                  }}
                                >
                                  Close Position
                                </Button>
                              ) : job.status === "filled" ? (
                                <Button
                                  variant="outline"
                                  className="border-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobStatusChange(job.id, "closed");
                                  }}
                                >
                                  Close Position
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJobStatusChange(job.id, "active");
                                  }}
                                >
                                  Reactivate
                                </Button>
                              )}

                              <Button
                                variant="default"
                                className="bg-[#ff7a00] hover:bg-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/job/${job.id}`);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>



              {/* Tab Content: Create Job */}
              <TabsContent value="createJob" className="p-0">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">Create New Job Listing</h2>

                  <Form {...jobForm}>
                    <form onSubmit={jobForm.handleSubmit(onSubmitJobForm)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={jobForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Store Associate" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="jobType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Type*</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Full-time">Full-time</SelectItem>
                                  <SelectItem value="Part-time">Part-time</SelectItem>
                                  <SelectItem value="Temporary">Temporary</SelectItem>
                                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location*</FormLabel>
                              <FormControl>
                                <StoreLocationAutocomplete
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Store Operations">Store Operations</SelectItem>
                                  <SelectItem value="Food Service">Food Service</SelectItem>
                                  <SelectItem value="Management">Management</SelectItem>
                                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="payRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Range</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., $15-$18/hour" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="closingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Closing Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  value={typeof field.value === 'string' ? field.value : format(new Date(field.value || Date.now()), "yyyy-MM-dd")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description*</FormLabel>
                            <FormControl>
                              <JobTemplateSelector
                                type="responsibilities"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Requirements*</FormLabel>
                            <FormControl>
                              <JobTemplateSelector
                                type="requirements"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="benefits"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Benefits (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List any benefits or perks offered with this position"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-[#ff7a00] hover:bg-orange-600"
                          disabled={createJobMutation.isPending}
                        >
                          {createJobMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Job Listing"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}