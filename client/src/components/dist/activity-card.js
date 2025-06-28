"use strict";
exports.__esModule = true;
exports.ActivityCard = void 0;
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
function ActivityCard(_a) {
    var activity = _a.activity;
    // Format timestamp
    var formattedDate = date_fns_1.format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a");
    // Get icon based on action
    var getIcon = function () {
        switch (activity.action) {
            case "created_job":
                return React.createElement(lucide_react_1.PlusCircle, { className: "h-5 w-5 text-green-500" });
            case "updated_job_status":
                if (activity.details.newStatus === "filled") {
                    return React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-blue-500" });
                }
                else if (activity.details.newStatus === "closed") {
                    return React.createElement(lucide_react_1.X, { className: "h-5 w-5 text-red-500" });
                }
                else if (activity.details.newStatus === "archived") {
                    return React.createElement(lucide_react_1.Archive, { className: "h-5 w-5 text-gray-500" });
                }
                return React.createElement(lucide_react_1.Edit, { className: "h-5 w-5 text-orange-500" });
            case "updated_job":
                return React.createElement(lucide_react_1.Edit, { className: "h-5 w-5 text-blue-500" });
            case "deleted_job":
                return React.createElement(lucide_react_1.X, { className: "h-5 w-5 text-red-500" });
            case "received_application":
                return React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-green-500" });
            case "updated_application_status":
                if (activity.details.newStatus === "accepted") {
                    return React.createElement(lucide_react_1.UserCheck, { className: "h-5 w-5 text-green-500" });
                }
                else if (activity.details.newStatus === "rejected") {
                    return React.createElement(lucide_react_1.UserX, { className: "h-5 w-5 text-red-500" });
                }
                return React.createElement(lucide_react_1.Edit, { className: "h-5 w-5 text-blue-500" });
            default:
                return React.createElement(lucide_react_1.Edit, { className: "h-5 w-5 text-gray-500" });
        }
    };
    // Get activity description
    var getDescription = function () {
        switch (activity.action) {
            case "created_job":
                return "Created job listing: " + (activity.details.jobTitle || "Untitled job");
            case "updated_job_status":
                return "Updated job status to \"" + activity.details.newStatus + "\" for: " + (activity.details.jobTitle || "Untitled job");
            case "updated_job":
                return "Updated details for job: " + (activity.details.jobTitle || "Untitled job");
            case "deleted_job":
                return "Deleted job listing: " + (activity.details.jobTitle || "Untitled job");
            case "received_application":
                return "Received application from: " + (activity.details.applicantName || "Unknown applicant") + " for " + (activity.details.jobTitle || "Untitled job");
            case "updated_application_status":
                return "Updated application status to \"" + activity.details.newStatus + "\" for: " + (activity.details.applicantName || "Unknown applicant");
            default:
                return activity.action.replace(/_/g, " ") + " on " + activity.entityType + " #" + activity.entityId;
        }
    };
    return (React.createElement("div", { className: "p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors" },
        React.createElement("div", { className: "flex items-start gap-3" },
            React.createElement("div", { className: "p-2 bg-gray-100 rounded-full" }, getIcon()),
            React.createElement("div", { className: "flex-grow" },
                React.createElement("p", { className: "font-medium text-gray-800" }, getDescription()),
                React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, formattedDate)))));
}
exports.ActivityCard = ActivityCard;
// Make sure to export the component as default
exports["default"] = ActivityCard;
