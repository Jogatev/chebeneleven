import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type JobListing } from "@shared/schema";
import Header from "@/components/header";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/file-upload";

// Application form schema
const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  resumeUrl: z.string().optional(),
  experience: z.string(),
  education: z.string(),
  coverLetter: z.string().optional(),
  availableShifts: z.array(z.string()),
  startDate: z.string().optional(),
  desiredPay: z.string().optional(),
  certify: z.boolean().refine(val => val === true, {
    message: "You must certify that the information is accurate"
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationForm() {
  const params = useParams<{ id: string }>();
  const jobId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch job details
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery<JobListing>({
    queryKey: [`/api/jobs/${jobId}`],
  });

  // Form definition
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
      experience: "less_than_1",
      education: "high_school",
      coverLetter: "",
      resumeUrl: "",
      availableShifts: [],
      startDate: format(new Date(), "yyyy-MM-dd"),
      desiredPay: "",
      certify: false,
    },
  });

  // Handle application submission
  const applicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const res = await apiRequest("POST", "/api/applications", applicationData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
      // Redirect back to jobs page after successful submission
      setTimeout(() => {
        setLocation("/applicant");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    
    // Prepare data for submission - remove certify field and add jobId
    const { certify, ...submissionData } = data;
    
    applicationMutation.mutate({
      ...submissionData,
      jobId,
      // Convert shift array to proper format
      availableShifts: data.availableShifts,
      // Format date properly
      startDate: data.startDate ? new Date(data.startDate) : undefined,
    });
  };

  // Handle back to jobs
  const handleBackToJobs = () => {
    setLocation("/applicant");
  };

  // Available shifts options
  const shiftOptions = [
    { id: "morning", label: "Morning (6am-2pm)" },
    { id: "afternoon", label: "Afternoon (2pm-10pm)" },
    { id: "night", label: "Night (10pm-6am)" },
    { id: "weekends", label: "Weekends" },
  ];

  if (isJobLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          showBackButton={true} 
          onBackClick={handleBackToJobs} 
          backText="Back to Jobs"
        />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#00703c]" />
        </main>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          showBackButton={true} 
          onBackClick={handleBackToJobs} 
          backText="Back to Jobs"
        />
        <main className="flex-grow p-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-red-600">Error Loading Job</h1>
            <p className="mt-2">The job listing could not be found or there was an error loading it.</p>
            <Button onClick={handleBackToJobs} className="mt-4">Return to Job Listings</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        showBackButton={true} 
        onBackClick={handleBackToJobs} 
        backText="Back to Jobs"
      />

      <main className="flex-grow p-3 sm:p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 bg-[#00703c] text-white">
              <h1 className="text-xl sm:text-2xl font-bold">{job.title}</h1>
              <p className="mt-1 text-sm sm:text-base">7-Eleven - {job.location}</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-3 sm:mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">First Name*</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="h-10 sm:h-11 px-3" 
                            />
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
                          <FormLabel className="text-sm sm:text-base">Last Name*</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="h-10 sm:h-11 px-3" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Email Address*</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              inputMode="email" 
                              autoComplete="email" 
                              {...field} 
                              className="h-10 sm:h-11 px-3" 
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
                          <FormLabel className="text-sm sm:text-base">Phone Number*</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              inputMode="tel" 
                              autoComplete="tel" 
                              {...field} 
                              className="h-10 sm:h-11 px-3" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-1 sm:col-span-2">
                          <FormLabel className="text-sm sm:text-base">Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              autoComplete="street-address" 
                              className="h-10 sm:h-11 px-3" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">City/Municipality</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              autoComplete="address-level2" 
                              placeholder="City or municipality in Philippines"
                              className="h-10 sm:h-11 px-3" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Postal Code</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              inputMode="numeric" 
                              autoComplete="postal-code"
                              placeholder="Philippine postal code"
                              className="h-10 sm:h-11 px-3" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Experience & Qualifications */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-3 sm:mb-4">Experience & Qualifications</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="resumeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Resume/CV Upload</FormLabel>
                          <FormControl>
                            <FileUpload
                              accept="application/pdf,.doc,.docx"
                              maxSize={5}
                              isUploading={isUploading}
                              onFileUpload={(file) => {
                                // Show uploading state
                                setIsUploading(true);
                                
                                // Upload the file
                                const formData = new FormData();
                                formData.append("resume", file);
                                
                                fetch("/api/upload-resume", {
                                  method: "POST",
                                  body: formData,
                                })
                                  .then((response) => {
                                    if (!response.ok) {
                                      throw new Error("Upload failed");
                                    }
                                    return response.json();
                                  })
                                  .then((data) => {
                                    // Set the resume URL field with the returned path
                                    field.onChange(data.path);
                                    toast({
                                      title: "Upload Successful",
                                      description: "Your resume has been uploaded successfully.",
                                    });
                                  })
                                  .catch((error) => {
                                    console.error("Upload error:", error);
                                    toast({
                                      title: "Upload Failed",
                                      description: "There was an error uploading your resume. Please try again.",
                                      variant: "destructive",
                                    });
                                  })
                                  .finally(() => {
                                    setIsUploading(false);
                                  });
                              }}
                              onFileUploadError={(error) => {
                                toast({
                                  title: "Upload Failed",
                                  description: error,
                                  variant: "destructive",
                                });
                              }}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Upload your resume (PDF, DOC, or DOCX format, max 5MB)
                            <span className="block sm:hidden mt-1 text-xs text-muted-foreground italic">
                              Tap to select file or take a photo of your document
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Years of Relevant Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 sm:h-11">
                                  <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                                <SelectItem value="1-2">1-2 years</SelectItem>
                                <SelectItem value="3-5">3-5 years</SelectItem>
                                <SelectItem value="5+">5+ years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Highest Education Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 sm:h-11">
                                  <SelectValue placeholder="Select education" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high_school">High School</SelectItem>
                                <SelectItem value="some_college">Some College</SelectItem>
                                <SelectItem value="associates">Associate's Degree</SelectItem>
                                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                                <SelectItem value="masters">Master's Degree or higher</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Cover Letter or Additional Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3}
                              placeholder="Tell us why you're a good fit for this position..."
                              className="min-h-[100px] sm:min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Availability & Preferences */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-3 sm:mb-4">Availability & Preferences</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium mb-2">Work Availability*</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="workAvailability.holidayWork"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Holiday Work
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="workAvailability.weekdayWork"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Weekday Work (Mon-Fri)
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="workAvailability.weekendWork"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Weekend Work
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="workAvailability.morningShift"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Morning Shift (6am-2pm)
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="workAvailability.afternoonShift"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Afternoon Shift (2pm-10pm)
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="workAvailability.nightShift"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Night Shift (10pm-6am)
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Earliest Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="h-10 sm:h-11 px-3"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="certify"
                  render={({ field }) => (
                    <FormItem className="flex items-start sm:items-center space-x-2 my-3 sm:my-4">
                      <FormControl>
                        <Checkbox
                          className="h-5 w-5 sm:h-4 sm:w-4 mt-0.5 sm:mt-0"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        I certify that the information provided is accurate and complete*
                      </FormLabel>
                      <FormMessage className="mt-0" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center sm:justify-end">
                  <Button 
                    type="submit" 
                    className="bg-[#ff7a00] hover:bg-orange-600 w-full sm:w-auto h-12 sm:h-11 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
