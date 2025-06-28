import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  UserPlus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Archive,
  Edit,
  Trash2,
  Activity
} from "lucide-react";

interface ActivityCardProps {
  activity: {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    details: Record<string, any>;
    timestamp: string | Date;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const timestamp = new Date(activity.timestamp);
  const formattedTime = format(timestamp, "MMM dd, yyyy 'at' h:mm a");

  const getIcon = (action: string) => {
    switch (action) {
      case "created_job":
        return <Briefcase className="h-5 w-5" />;
      case "updated_job":
        return <Edit className="h-5 w-5" />;
      case "deleted_job":
        return <Trash2 className="h-5 w-5" />;
      case "archived_job":
        return <Archive className="h-5 w-5" />;
      case "received_application":
        return <UserPlus className="h-5 w-5" />;
      case "updated_application_status":
        return <CheckCircle className="h-5 w-5" />;
      case "viewed_application":
        return <Eye className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    const { action, details } = activity;
    
    switch (action) {
      case "created_job":
        return `Created job listing: "${details.jobTitle}" in ${details.location}`;
      case "updated_job":
        return `Updated job listing: "${details.jobTitle}" (${details.updatedFields?.join(", ") || "general updates"})`;
      case "deleted_job":
        return `Deleted job listing: "${details.jobTitle}" from ${details.location}`;
      case "archived_job":
        return `Archived job listing: "${details.jobTitle}"`;
      case "received_application":
        return `Received application from ${details.applicantName} for "${details.jobTitle}"`;
      case "updated_application_status":
        return `Updated ${details.applicantName}'s application status from ${details.previousStatus} to ${details.newStatus}`;
      case "viewed_application":
        return `Viewed application from ${details.applicantName}`;
      default:
        return `Performed ${action.replace(/_/g, " ")}`;
    }
  };

  const getStatusColor = (action: string) => {
    switch (action) {
      case "created_job":
      case "received_application":
        return "bg-green-100 text-green-800";
      case "updated_job":
      case "updated_application_status":
        return "bg-blue-100 text-blue-800";
      case "deleted_job":
      case "archived_job":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(activity.action)}`}>
              {getIcon(activity.action)}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {getActivityDescription(activity)}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                {formattedTime}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {activity.entityType}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

export default ActivityCard;