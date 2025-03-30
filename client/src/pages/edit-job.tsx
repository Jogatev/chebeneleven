import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { insertJobListingSchema, JobListing } from "@shared/schema";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const editJobSchema = insertJobListingSchema.extend({
  id: z.number(),
});

type EditJobFormValues = z.infer<typeof editJobSchema>;

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch job details
  const {
    data: job,
    isLoading,
    error,
  } = useQuery<JobListing>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !isNaN(jobId),
  });

  const form = useForm<EditJobFormValues>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      id: jobId,
      userId: user?.id || 0,
      title: "",
      description: "",
      location: "",
      requirements: "",
      payRange: "",
      jobType: "full_time",
      status: "active",
      department: "",
      benefits: "",
      tags: [],
    },
  });

  // Update form values when job data is loaded
  useEffect(() => {
    if (job) {
      form.reset({
        id: job.id,
        userId: job.userId,
        title: job.title,
        description: job.description || "",
        location: job.location || "",
        requirements: job.requirements || "",
        payRange: job.payRange || "",
        jobType: job.jobType || "full_time", 
        status: job.status || "active",
        department: job.department || "",
        benefits: job.benefits || "",
        tags: job.tags || [],
      });
    }
  }, [job, form]);

  // Check if the current user is the owner of this job
  useEffect(() => {
    if (job && user && job.userId !== user.id) {
      toast({
        variant: "destructive",
        title: "Not authorized",
        description: "You do not have permission to edit this job",
      });
      setLocation("/dashboard");
    }
  }, [job, user, setLocation, toast]);

  const updateJobMutation = useMutation({
    mutationFn: async (data: EditJobFormValues) => {
      const res = await apiRequest(
        "PATCH",
        `/api/jobs/${data.id}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      toast({
        title: "Job Updated",
        description: "The job listing has been updated successfully",
      });
      setLocation(`/job/${jobId}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: EditJobFormValues) => {
    updateJobMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          title="Edit Job"
          showBackButton
          onBackClick={() => setLocation(`/job/${jobId}`)}
        />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          title="Edit Job"
          showBackButton
          onBackClick={() => setLocation(`/job/${jobId}`)}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            Error loading job: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          title="Edit Job"
          showBackButton
          onBackClick={() => setLocation("/dashboard")}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            Job not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Edit Job Listing"
        showBackButton
        onBackClick={() => setLocation(`/job/${jobId}`)}
      />

      <div className="container py-6 max-w-2xl flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Edit Job Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Store Associate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 123 Main St, San Diego, CA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Range</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. $15-20/hr or $40,000-50,000/year"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the job responsibilities and requirements..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the requirements for this position..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/job/${jobId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateJobMutation.isPending}
                  >
                    {updateJobMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Job
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}