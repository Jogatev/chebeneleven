import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Application } from "@shared/schema";

interface ApplicationDetailsModalProps {
  application: Application & { jobTitle: string; jobLocation: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: string) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-500" },
  under_review: { label: "Under Review", color: "bg-yellow-500" },
  interviewed: { label: "Interviewed", color: "bg-purple-500" },
  accepted: { label: "Accepted", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
};

export default function ApplicationDetailsModal({
  application,
  open,
  onOpenChange,
  onStatusChange,
}: ApplicationDetailsModalProps) {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    zipCode,
    experience,
    education,
    coverLetter,
    resumeUrl,
    availableShifts,
    submittedAt,
    status,
    jobTitle,
    jobLocation,
    startDate,
  } = application;

  // Format experience for display
  const formatExperience = (exp: string | null) => {
    if (!exp) return "Not specified";
    if (exp === "less_than_1") return "Less than 1 year";
    if (exp === "1_to_3") return "1-3 years";
    if (exp === "3_to_5") return "3-5 years";
    if (exp === "5_to_10") return "5-10 years";
    if (exp === "more_than_10") return "More than 10 years";
    return exp;
  };

  // Format education for display
  const formatEducation = (edu: string | null) => {
    if (!edu) return "Not specified";
    if (edu === "high_school") return "High School";
    if (edu === "associate") return "Associate Degree";
    if (edu === "bachelor") return "Bachelor's Degree";
    if (edu === "master") return "Master's Degree";
    if (edu === "doctorate") return "Doctorate";
    return edu;
  };

  // Format shifts for display
  const formatShifts = (shifts: string[] | null) => {
    if (!shifts || shifts.length === 0) return "Not specified";
    return shifts.map(shift => shift.charAt(0).toUpperCase() + shift.slice(1)).join(", ");
  };

  const currentStatus = status || "submitted";
  const formattedSubmitDate = submittedAt ? format(new Date(submittedAt), "PPP") : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Application from {firstName} {lastName}
          </DialogTitle>
          <DialogDescription>
            For position: <span className="font-medium">{jobTitle}</span> in{" "}
            <span className="font-medium">{jobLocation}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <Badge className={statusLabels[currentStatus].color}>
              {statusLabels[currentStatus].label}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Submitted: {formattedSubmitDate}
            </div>
          </div>

          <div className="border rounded-lg p-4 grid gap-3">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{phone || "Not provided"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p>{address || "Not provided"}</p>
              <p>{city || "Unknown"}, {zipCode || "Unknown"}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 grid gap-3">
            <h3 className="font-semibold text-lg">Qualifications</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p>{formatExperience(experience)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Education</p>
                <p>{formatEducation(education)}</p>
              </div>
            </div>
            {resumeUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Resume</p>
                <a 
                  href={resumeUrl.startsWith('/uploads') ? resumeUrl : resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline hover:text-blue-800 flex items-center"
                >
                  {resumeUrl.startsWith('/uploads') ? "View Uploaded Resume" : "View Resume"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 grid gap-3">
            <h3 className="font-semibold text-lg">Availability</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Available Shifts</p>
                <p>{formatShifts(availableShifts || [])}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p>{startDate ? format(new Date(startDate), "PPP") : "Flexible"}</p>
              </div>
            </div>
          </div>

          {coverLetter && (
            <div className="border rounded-lg p-4 grid gap-2">
              <h3 className="font-semibold text-lg">Cover Letter</h3>
              <p className="whitespace-pre-wrap">{coverLetter}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onStatusChange("under_review")}>
              Mark as Reviewing
            </Button>
            <Button variant="outline" onClick={() => onStatusChange("interviewed")}>
              Mark as Interviewed
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="destructive" 
              onClick={() => onStatusChange("rejected")}
            >
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => onStatusChange("accepted")}
            >
              Hire
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}