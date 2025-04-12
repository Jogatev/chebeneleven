"use strict";
exports.__esModule = true;
var date_fns_1 = require("date-fns");
function ApplicationsTable(_a) {
    var applications = _a.applications;
    // Helper function to get applicant name
    var getApplicantName = function (app) {
        return ((app.firstName || '') + " " + (app.lastName || '')).trim() || 'Unknown';
    };
    // Format date safely
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        try {
            var date = new Date(dateString);
            if (isNaN(date.getTime()))
                return 'N/A';
            return date_fns_1.format(date, 'MMM d, yyyy');
        }
        catch (e) {
            return 'N/A';
        }
    };
    return (React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
        React.createElement("thead", { className: "bg-orange-500 text-white" },
            React.createElement("tr", null,
                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" }, "Applicant"),
                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" }, "Status"),
                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" }, "Applied Date"),
                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" }, "Email"),
                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" }, "Phone"))),
        React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, applications.length === 0 ? (React.createElement("tr", null,
            React.createElement("td", { colSpan: 5, className: "px-6 py-4 whitespace-nowrap text-center text-gray-500" }, "No applications found"))) : (applications.map(function (app) { return (React.createElement("tr", { key: app.id, className: "hover:bg-gray-50" },
            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" }, getApplicantName(app)),
            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" }, app.status || 'submitted'),
            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" }, formatDate(app.submittedAt)),
            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" }, app.email),
            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" }, app.phone))); })))));
}
exports["default"] = ApplicationsTable;
