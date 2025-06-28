import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";
import { getFullApiPath } from "@/lib/utils";
import { API_ENDPOINTS } from "@shared/api-endpoints";
import { JobListing } from "@shared/schema";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, Calendar, MapPin, DollarSign } from "lucide-react";
import FileUpload from "@/components/file-upload";
import { useToast } from "@/hooks/use-toast";

const applicationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  experience: z.string().min(10, "Please describe your experience"),
  education: z.string().min(10, "Please describe your education"),
  coverLetter: z.string().min(20, "Cover letter is required"),
  availableShifts: z.array(z.string()).min(1, "Select at least one shift"),
  workAvailability: z.object({
    holidayWork: z.boolean(),
    weekdayWork: z.boolean(),
    weekendWork: z.boolean(),
    morningShift: z.boolean(),
    afternoonShift: z.boolean(),
    nightShift: z.boolean(),
  }),
  startDate: z.string().min(1, "Start date is required"),
  resumeUrl: z.string().optional(),
  certify: z.boolean().refine(val => val === true, "You must certify the information"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [jobId, setJobId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError
  } = useQuery<JobListing>({
    queryKey: [getFullApiPath(API_ENDPOINTS.JOBS.GET_BY_ID(jobId || ""))],
    enabled: !!jobId,
  });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      experience: "",
      education: "",
      coverLetter: "",
      availableShifts: [],
      workAvailability: {
        holidayWork: false,
        weekdayWork: false,
        weekendWork: false,
        morningShift: false,
        afternoonShift: false,
        nightShift: false,
      },
      startDate: format(new Date(), "yyyy-MM-dd"),
      resumeUrl: "",
      certify: false,
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      const res = await apiRequest("POST", getFullApiPath(API_ENDPOINTS.APPLICATIONS.CREATE), {
        ...data,
        jobId: jobId,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. You will receive a confirmation email shortly.",
      });
      setLocation("/applicant");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your application",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ApplicationFormValues) => {
    const submissionData = {
      ...data,
      jobId: jobId,
    };

    const shiftArray = Object.entries(data.workAvailability)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    const formattedData = {
      ...submissionData,
      availableShifts: shiftArray,
      startDate: new Date(data.startDate).toISOString(),
    };

    submitApplicationMutation.mutate(formattedData);
  };

  const handleBackToJobs = () => {
    setLocation("/applicant");
  };

  const availableShifts = [
    { value: "morning", label: "Morning (6 AM - 2 PM)" },
    { value: "afternoon", label: "Afternoon (2 PM - 10 PM)" },
    { value: "night", label: "Night (10 PM - 6 AM)" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("jobId");
    if (id) {
      setJobId(parseInt(id));
    }
  }, []);

  if (isJobLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} onBackClick={handleBackToJobs} />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading job details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} onBackClick={handleBackToJobs} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBackToJobs}>Back to Jobs</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} onBackClick={handleBackToJobs} />
      
      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Apply for Position</h1>
            <p className="text-gray-600">Complete the form below to submit your application</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                  <CardDescription>
                    Please fill out all required fields to complete your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...form.register("firstName")}
                          className="mt-1"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...form.register("lastName")}
                          className="mt-1"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          className="mt-1"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          {...form.register("phone")}
                          className="mt-1"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        className="mt-1"
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...form.register("city")}
                          className="mt-1"
                        />
                        {form.formState.errors.city && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...form.register("zipCode")}
                          className="mt-1"
                        />
                        {form.formState.errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.zipCode.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience">Work Experience *</Label>
                      <Textarea
                        id="experience"
                        {...form.register("experience")}
                        placeholder="Describe your relevant work experience..."
                        className="mt-1"
                        rows={4}
                      />
                      {form.formState.errors.experience && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.experience.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="education">Education *</Label>
                      <Textarea
                        id="education"
                        {...form.register("education")}
                        placeholder="Describe your educational background..."
                        className="mt-1"
                        rows={3}
                      />
                      {form.formState.errors.education && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.education.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        {...form.register("coverLetter")}
                        placeholder="Tell us why you're interested in this position..."
                        className="mt-1"
                        rows={5}
                      />
                      {form.formState.errors.coverLetter && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.coverLetter.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Available Shifts *</Label>
                      <div className="mt-2 space-y-2">
                        {availableShifts.map((shift) => (
                          <div key={shift.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={shift.value}
                              checked={form.watch("availableShifts").includes(shift.value)}
                              onCheckedChange={(checked) => {
                                const current = form.watch("availableShifts");
                                if (checked) {
                                  form.setValue("availableShifts", [...current, shift.value]);
                                } else {
                                  form.setValue("availableShifts", current.filter(s => s !== shift.value));
                                }
                              }}
                            />
                            <Label htmlFor={shift.value} className="text-sm font-normal">
                              {shift.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {form.formState.errors.availableShifts && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.availableShifts.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Work Availability</Label>
                      <div className="mt-2 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="holidayWork"
                              {...form.register("workAvailability.holidayWork")}
                            />
                            <Label htmlFor="holidayWork" className="text-sm font-normal">
                              Available on holidays
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="weekdayWork"
                              {...form.register("workAvailability.weekdayWork")}
                            />
                            <Label htmlFor="weekdayWork" className="text-sm font-normal">
                              Available weekdays
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="weekendWork"
                              {...form.register("workAvailability.weekendWork")}
                            />
                            <Label htmlFor="weekendWork" className="text-sm font-normal">
                              Available weekends
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="morningShift"
                              {...form.register("workAvailability.morningShift")}
                            />
                            <Label htmlFor="morningShift" className="text-sm font-normal">
                              Morning shifts
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="afternoonShift"
                              {...form.register("workAvailability.afternoonShift")}
                            />
                            <Label htmlFor="afternoonShift" className="text-sm font-normal">
                              Afternoon shifts
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="nightShift"
                              {...form.register("workAvailability.nightShift")}
                            />
                            <Label htmlFor="nightShift" className="text-sm font-normal">
                              Night shifts
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="startDate">Earliest Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...form.register("startDate")}
                        className="mt-1"
                      />
                      {form.formState.errors.startDate && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Resume Upload</Label>
                      <div className="mt-2">
                        {isUploading ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <FileUpload
                            onFileUpload={async (file) => {
                              setIsUploading(true);
                              try {
                                const formData = new FormData();
                                formData.append("resume", file);
                                
                                const response = await fetch("/api/upload-resume", {
                                  method: "POST",
                                  body: formData,
                                });
                                
                                if (!response.ok) {
                                  throw new Error("Upload failed");
                                }
                                
                                const result = await response.json();
                                form.setValue("resumeUrl", result.filePath);
                                toast({
                                  title: "Resume Uploaded",
                                  description: "Your resume has been successfully uploaded",
                                });
                              } catch (error) {
                                toast({
                                  title: "Upload Failed",
                                  description: "There was an error uploading your resume",
                                  variant: "destructive",
                                });
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                            acceptedFiles={[".pdf", ".doc", ".docx"]}
                            maxSize={5}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="certify"
                        {...form.register("certify")}
                      />
                      <Label htmlFor="certify" className="text-sm">
                        I certify that all information provided is true and accurate *
                      </Label>
                    </div>
                    {form.formState.errors.certify && (
                      <p className="text-red-500 text-sm">{form.formState.errors.certify.message}</p>
                    )}

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToJobs}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitApplicationMutation.isPending}
                      >
                        {submitApplicationMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Job Type</h4>
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </div>

                  {job.department && (
                    <div>
                      <h4 className="font-medium mb-2">Department</h4>
                      <p className="text-gray-600">{job.department}</p>
                    </div>
                  )}

                  {job.payRange && (
                    <div>
                      <h4 className="font-medium mb-2">Pay Range</h4>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.payRange}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{job.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-gray-600 text-sm">{job.requirements}</p>
                  </div>

                  {job.benefits && (
                    <div>
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <p className="text-gray-600 text-sm">{job.benefits}</p>
                    </div>
                  )}

                  {job.closingDate && (
                    <div>
                      <h4 className="font-medium mb-2">Closing Date</h4>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(job.closingDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 