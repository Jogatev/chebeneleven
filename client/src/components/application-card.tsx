import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "@shared/schema";
import { useState } from "react";
import { Loader2, Eye, Clock, Calendar, Mail, BriefcaseBusiness } from "lucide-react";
import ApplicationDetailsModal from "./application-details-modal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ApplicationCardProps {
  application: Application & { jobTitle: string; jobLocation: string };
  jobTitle: string;
  onStatusChange: (newStatus: string) => void;
}

export default function ApplicationCard({
  application,
  jobTitle,
  onStatusChange,
}: ApplicationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const isMobile = useIsMobile();
  
  // Format the status label for display with enhanced visuals
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return { 
          text: "New", 
          class: "bg-blue-100 text-blue-800",
          color: "border-l-4 border-blue-500",
          icon: "🔵"
        };
      case "under_review":
        return { 
          text: "Under Review", 
          class: "bg-yellow-100 text-yellow-800",
          color: "border-l-4 border-yellow-500",
          icon: "🟡"
        };
      case "interviewed":
        return { 
          text: "Interviewed", 
          class: "bg-green-100 text-green-800",
          color: "border-l-4 border-green-500",
          icon: "🟢"
        };
      case "accepted":
        return { 
          text: "Accepted", 
          class: "bg-emerald-100 text-emerald-800",
          color: "border-l-4 border-emerald-500",
          icon: "✅"
        };
      case "rejected":
        return { 
          text: "Rejected", 
          class: "bg-red-100 text-red-800",
          color: "border-l-4 border-red-500",
          icon: "❌"
        };
      default:
        return { 
          text: status, 
          class: "bg-gray-100 text-gray-800",
          color: "border-l-4 border-gray-400",
          icon: "⚪"
        };
    }
  };

  // Handle the review button click
  const handleReviewClick = () => {
    // Open details modal
    setShowDetailsModal(true);
    
    // If status is still 'submitted', update it to 'under_review'
    if (application.status === "submitted") {
      handleStatusChange("under_review");
    }
  };

  // Handle view details click
  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = getStatusLabel(application.status || "submitted");
  
  return (
    <>
      <div 
        className={`p-4 sm:p-6 hover:bg-neutral-50 transition-all rounded-md border mb-3 sm:mb-4 cursor-pointer shadow-sm hover:shadow ${statusInfo.color}`}
        onClick={handleViewDetails}>
        <div className="flex justify-between flex-col sm:flex-row">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800">
                {application.firstName} {application.lastName}
              </h3>
              <span className="text-sm">{statusInfo.icon}</span>
            </div>
            
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    <p>Applied for: {jobTitle}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <p>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5" />
                    <p>Experience: {application.experience?.replace(/_/g, " ")}
                      {application.experience === "5+" && " years"}
                    </p>
                  </div>
                  
                  {application.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail className="h-3.5 w-3.5" />
                      <p className="truncate max-w-[200px]">{application.email}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Applied for: {jobTitle}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                  <span className="text-gray-600 text-sm">
                    Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Experience: {application.experience?.replace(/_/g, " ")}
                    {application.experience === "5+" && " years"}
                  </p>
                  {application.email && (
                    <p className="mt-1">Contact: {application.email}</p>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            {isUpdating ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Updating...</span>
              </div>
            ) : (
              <>
                {application.status === "submitted" ? (
                  <Button
                    className="bg-[#ff7a00] hover:bg-orange-600 h-9 sm:h-10 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewClick();
                    }}
                  >
                    Review
                  </Button>
                ) : application.status === "under_review" ? (
                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("interviewed");
                    }}
                  >
                    {isMobile ? "Interviewed" : "Mark Interviewed"}
                  </Button>
                ) : application.status === "interviewed" ? (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange("accepted");
                      }}
                    >
                      Accept
                    </Button>
                  </>
                ) : (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={application.status}
                      onValueChange={(value) => {
                        handleStatusChange(value);
                      }}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-9 sm:h-10 w-[120px] sm:w-[140px] text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">New</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={application}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
