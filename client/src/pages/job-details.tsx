import { useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { JobListing, Application } from "@shared/schema";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import ApplicationCard from "@/components/application-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Edit } from "lucide-react";

export default function JobDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ id: string }>("/job/:id");
  const jobId = params ? parseInt(params.id) : 0;

  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery<JobListing, Error>({
    queryKey: ["/api/jobs", jobId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return fetch(`/api/jobs/${id}`).then((res) => {
        if (!res.ok) throw new Error("Failed to load job");
        return res.json();
      });
    },
    enabled: !!jobId,
  });

  const {
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useQuery<Application[], Error>({
    queryKey: ["/api/jobs", jobId, "applications"],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return fetch(`/api/jobs/${id}/applications`).then((res) => {
        if (!res.ok) throw new Error("Failed to load applications");
        return res.json();
      });
    },
    enabled: !!jobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${applicationId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId, "applications"] });
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = useCallback(
    (applicationId: number, status: string) => {
      updateStatusMutation.mutate({ applicationId, status });
    },
    [updateStatusMutation]
  );

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && !max) return `$${min.toLocaleString()}/year+`;
    if (!min && max) return `Up to $${max.toLocaleString()}/year`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}/year`;
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto p-3 sm:p-4">
        <Header
          title="Job Details"
          showBackButton
          onBackClick={() => setLocation("/dashboard")}
        />
        <div className="flex flex-col justify-center items-center h-52 sm:h-64 mt-2 sm:mt-4">
          <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary mb-2" />
          <span className="text-sm sm:text-base text-muted-foreground">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="container mx-auto p-3 sm:p-4">
        <Header
          title="Job Details"
          showBackButton
          onBackClick={() => setLocation("/dashboard")}
        />
        <div className="bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base mt-2 sm:mt-4">
          Error loading job details: {jobError.message}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-3 sm:p-4">
        <Header
          title="Job Details"
          showBackButton
          onBackClick={() => setLocation("/dashboard")}
        />
        <div className="bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base mt-2 sm:mt-4">
          Job not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4">
      <Header
        title="Job Details"
        showBackButton
        backText="Back to Dashboard"
        onBackClick={() => setLocation("/dashboard")}
        franchiseeName={user?.franchiseeName}
      />

      <Tabs defaultValue="details" className="w-full mt-2 sm:mt-4">
        <TabsList className="mb-3 sm:mb-4 w-full sm:w-auto">
          <TabsTrigger value="details" className="flex-1 sm:flex-none">Job Details</TabsTrigger>
          <TabsTrigger value="applications" className="flex-1 sm:flex-none">
            Applications{" "}
            {applications && applications.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {applications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pb-4 sm:pb-6">
              <div>
                <CardTitle className="text-xl sm:text-2xl">{job.title}</CardTitle>
                <CardDescription className="mt-1">
                  {job.location} • {formatJobType(job.jobType || "full_time")}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
                onClick={() => setLocation(`/edit-job/${job.id}`)}
              >
                <Edit size={16} /> Edit Job
              </Button>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Job Description</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm sm:text-base">{job.description}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Details</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="text-sm sm:text-base">{job.location}</p>
                    </div>
                    <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Job Type</h4>
                      <p className="text-sm sm:text-base">{formatJobType(job.jobType || "full_time")}</p>
                    </div>
                    <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Salary Range</h4>
                      <p className="text-sm sm:text-base">{job.payRange || "Not specified"}</p>
                    </div>
                    <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Date Posted</h4>
                      <p className="text-sm sm:text-base">{new Date(job.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Requirements</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm sm:text-base">{job.requirements || "No specific requirements listed."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">
                Applications for {job.title}
              </h2>
            </div>

            {applicationsLoading ? (
              <div className="flex justify-center items-center h-40 sm:h-64">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm sm:text-base">Loading applications...</span>
              </div>
            ) : applicationsError ? (
              <div className="bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base">
                Error loading applications: {applicationsError.message}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={{
                      ...application,
                      jobTitle: job.title,
                      jobLocation: job.location,
                    }}
                    jobTitle={job.title}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(application.id, newStatus)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 p-5 sm:p-8 rounded-md text-center">
                <p className="text-sm sm:text-base text-muted-foreground">
                  No applications have been submitted for this job yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}