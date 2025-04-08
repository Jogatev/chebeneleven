import { format } from "date-fns";
import { 
  PlusCircle, 
  CheckCircle, 
  X, 
  Edit, 
  Archive, 
  UserCheck,
  UserX,
  FileText
} from "lucide-react";

interface ActivityProps {
  activity: {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    details: Record<string, any>;
    timestamp: string;
    entityInfo?: Record<string, any>;
  };
}

export function ActivityCard({ activity }: ActivityProps) {
  // Format timestamp
  const formattedDate = format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a");
  
  // Get icon based on action
  const getIcon = () => {
    switch (activity.action) {
      case "created_job":
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      case "updated_job_status":
        if (activity.details.newStatus === "filled") {
          return <CheckCircle className="h-5 w-5 text-blue-500" />;
        } else if (activity.details.newStatus === "closed") {
          return <X className="h-5 w-5 text-red-500" />;
        } else if (activity.details.newStatus === "archived") {
          return <Archive className="h-5 w-5 text-gray-500" />;
        }
        return <Edit className="h-5 w-5 text-orange-500" />;
      case "updated_job":
        return <Edit className="h-5 w-5 text-blue-500" />;
      case "deleted_job":
        return <X className="h-5 w-5 text-red-500" />;
      case "received_application":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "updated_application_status":
        if (activity.details.newStatus === "accepted") {
          return <UserCheck className="h-5 w-5 text-green-500" />;
        } else if (activity.details.newStatus === "rejected") {
          return <UserX className="h-5 w-5 text-red-500" />;
        }
        return <Edit className="h-5 w-5 text-blue-500" />;
      default:
        return <Edit className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get activity description
  const getDescription = () => {
    switch (activity.action) {
      case "created_job":
        return `Created job listing: ${activity.details.jobTitle || "Untitled job"}`;
      case "updated_job_status":
        return `Updated job status to "${activity.details.newStatus}" for: ${activity.details.jobTitle || "Untitled job"}`;
      case "updated_job":
        return `Updated details for job: ${activity.details.jobTitle || "Untitled job"}`;
      case "deleted_job":
        return `Deleted job listing: ${activity.details.jobTitle || "Untitled job"}`;
      case "received_application":
        return `Received application from: ${activity.details.applicantName || "Unknown applicant"} for ${activity.details.jobTitle || "Untitled job"}`;
      case "updated_application_status":
        return `Updated application status to "${activity.details.newStatus}" for: ${activity.details.applicantName || "Unknown applicant"}`;
      default:
        return `${activity.action.replace(/_/g, " ")} on ${activity.entityType} #${activity.entityId}`;
    }
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-full">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-gray-800">{getDescription()}</p>
          <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}

// Make sure to export the component as default
export default ActivityCard;