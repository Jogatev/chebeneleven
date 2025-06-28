"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_to_print_1 = require("react-to-print");
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function ReportActions(_a) {
    var reportTitle = _a.reportTitle, _b = _a.reportData, reportData = _b === void 0 ? [] : _b, _c = _a.columns, columns = _c === void 0 ? [] : _c, _d = _a.jobs, jobs = _d === void 0 ? [] : _d, _e = _a.applications, applications = _e === void 0 ? [] : _e, dashboardStats = _a.dashboardStats, DashboardCharts = _a.DashboardCharts;
    var reportRef = react_1.useRef(null);
    // Handle printing
    var handlePrint = react_to_print_1.useReactToPrint({
        content: function () { return reportRef.current; },
        documentTitle: reportTitle,
        onAfterPrint: function () { return console.log("Print completed"); }
    });
    // Parse and prettify JSON data
    var prettifyJSON = function (jsonString) {
        try {
            // Check if the value is a JSON string
            if (typeof jsonString === 'string' &&
                (jsonString.startsWith('{') || jsonString.startsWith('['))) {
                var parsed = JSON.parse(jsonString);
                // Format different data types appropriately
                if (parsed.applicantName && parsed.jobTitle) {
                    return "Applicant: " + parsed.applicantName + "\nJob: " + parsed.jobTitle + "\n" + (parsed.previousStatus ? "Previous Status: " + parsed.previousStatus + "\n" : '') + "New Status: " + parsed.newStatus;
                }
                // For other JSON objects, return formatted key-value pairs
                return Object.entries(parsed)
                    .map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return key + ": " + value;
                })
                    .join('\n');
            }
            return jsonString;
        }
        catch (e) {
            return jsonString;
        }
    };
    // Function to get cell value based on accessor
    var getCellValue = function (row, accessor) {
        if (typeof accessor === 'function') {
            return accessor(row);
        }
        return row[accessor] !== undefined ? row[accessor] : '';
    };
    // Format date if it's a valid date string
    var formatDate = function (dateStr) {
        try {
            if (!dateStr)
                return '';
            var date = new Date(dateStr);
            if (isNaN(date.getTime()))
                return dateStr;
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        catch (e) {
            return dateStr;
        }
    };
    // Handle PDF export
    var handleExportPDF = function () {
        var _a, _b;
        var doc = new jspdf_1["default"]();
        // Format current date and time
        var now = new Date();
        var formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        var formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        var fullDateTime = formattedDate + " " + formattedTime;
        // Add title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 22);
        // Add date with time
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Generated on: " + fullDateTime, 14, 30);
        // Add 7-Eleven logo text
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 130, 72); // 7-Eleven green
        doc.text("7-ELEVEN", 170, 15);
        doc.setTextColor(255, 130, 0); // 7-Eleven orange
        doc.text("PHILIPPINES", 170, 22);
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFont('helvetica', 'normal');
        // Add a horizontal line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, 35, 196, 35);
        // Add dashboard stats summary if provided
        if (dashboardStats) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Dashboard Summary", 14, 45);
            doc.setFont('helvetica', 'normal');
            // Use different colors for different stats boxes
            var statColors = [
                [100, 149, 237],
                [106, 90, 205],
                [255, 165, 0],
                [46, 139, 87] // Green
            ];
            jspdf_autotable_1["default"](doc, {
                head: [["Metric", "Value"]],
                body: [
                    ["Active Jobs", dashboardStats.activeJobListings.toString()],
                    ["Filled Positions", dashboardStats.positionsFilled.toString()],
                    ["Total Applications", dashboardStats.totalApplications.toString()],
                    ["Accepted Applicants", dashboardStats.acceptedApplicants.toString()]
                ],
                startY: 50,
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [0, 130, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                bodyStyles: { textColor: [50, 50, 50] }
            });
        }
        // Add report data if available
        if (reportData.length > 0 && columns.length > 0) {
            var startY = dashboardStats ? (((_a = doc.lastAutoTable) === null || _a === void 0 ? void 0 : _a.finalY) || 100) + 15 : 45;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Report Data", 14, startY);
            // Extract column headers
            var headers = columns.map(function (col) { return col.header; });
            // Prepare table data with formatted values
            var tableData = reportData.map(function (row) {
                return columns.map(function (col) {
                    var value = getCellValue(row, col.accessor);
                    // Format date strings if the column is a timestamp or date
                    if (col.header.toLowerCase().includes('date') || col.accessor === 'timestamp') {
                        return formatDate(value);
                    }
                    // For details column, format JSON data
                    if (col.header === 'Details' || col.accessor === 'details') {
                        return prettifyJSON(value);
                    }
                    return value;
                });
            });
            jspdf_autotable_1["default"](doc, {
                head: [headers],
                body: tableData,
                startY: startY + 5,
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak',
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [0, 102, 51],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 'auto' } // Details column (auto width)
                },
                alternateRowStyles: { fillColor: [245, 250, 245] },
                bodyStyles: { textColor: [50, 50, 50] },
                didDrawCell: function (data) {
                    // Add proper cell padding for better text appearance
                    if (data.column.index === 2 && data.cell.section === 'body') {
                        // For the details column, apply additional formatting
                        doc.setFontSize(8);
                    }
                }
            });
        }
        // Add job listings with application counts
        if (jobs.length > 0) {
            // Calculate startY based on previous content
            var startY = ((_b = doc.lastAutoTable) === null || _b === void 0 ? void 0 : _b.finalY) ? (doc.lastAutoTable.finalY + 15)
                : 100;
            // Check if we need a new page
            if (startY > 240) {
                doc.addPage();
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text("Job Listings", 14, 20);
            }
            else {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text("Job Listings", 14, startY);
            }
            // Prepare job data with application count
            var jobData = jobs.map(function (job) {
                var jobApps = applications.filter(function (app) { return app.jobId === job.id; });
                var interviewing = jobApps.filter(function (app) { return app.status === "under_review" || app.status === "interview"; }).length;
                return [
                    job.title,
                    job.location,
                    job.status,
                    jobApps.length.toString(),
                    interviewing.toString(),
                    job.jobType,
                    job.payRange || "Not specified"
                ];
            });
            jspdf_autotable_1["default"](doc, {
                head: [["Job Title", "Location", "Status", "Applications", "Interviewing", "Type", "Pay Range"]],
                body: jobData,
                startY: (startY > 240) ? 25 : startY + 5,
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [0, 102, 51],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 250, 245] },
                bodyStyles: { textColor: [50, 50, 50] }
            });
        }
        // Add a detailed job-applications breakdown if we have both
        if (jobs.length > 0 && applications.length > 0) {
            // Add a new page for detailed breakdown
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text("Detailed Job Application Breakdown", 14, 20);
            doc.setFont('helvetica', 'normal');
            var currentY_1 = 30;
            // Loop through each job and show its applications
            jobs.forEach(function (job) {
                var _a;
                var jobApps = applications.filter(function (app) { return app.jobId === job.id; });
                // If we're too close to the bottom of the page, add a new page
                if (currentY_1 > 240) {
                    doc.addPage();
                    currentY_1 = 20;
                }
                // Job title and stats
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 130, 72); // 7-Eleven green
                doc.text(job.title + " (" + job.status + ")", 14, currentY_1);
                doc.setTextColor(0, 0, 0); // Reset to black
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text("Location: " + job.location, 14, currentY_1 + 7);
                doc.text("Applications: " + jobApps.length, 14, currentY_1 + 14);
                currentY_1 += 25;
                // If the job has applications, list them
                if (jobApps.length > 0) {
                    var appData = jobApps.map(function (app) { return [
                        app.applicantName,
                        app.status,
                        new Date(app.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        app.email || "Not provided",
                        app.phone || "Not provided"
                    ]; });
                    jspdf_autotable_1["default"](doc, {
                        head: [["Applicant", "Status", "Applied Date", "Email", "Phone"]],
                        body: appData,
                        startY: currentY_1,
                        styles: { fontSize: 9, cellPadding: 4, lineWidth: 0.1 },
                        headStyles: { fillColor: [255, 122, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [255, 245, 235] },
                        bodyStyles: { textColor: [50, 50, 50] }
                    });
                    currentY_1 = ((_a = doc.lastAutoTable) === null || _a === void 0 ? void 0 : _a.finalY) || currentY_1 + 50;
                }
                else {
                    doc.text("No applications for this position", 14, currentY_1);
                    currentY_1 += 15;
                }
                // Add a divider
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.5);
                doc.line(14, currentY_1 + 5, 196, currentY_1 + 5);
                currentY_1 += 15;
            });
        }
        // Add footer with page numbers
        var pageCount = doc.internal.getNumberOfPages();
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("Page " + i + " of " + pageCount + " - 7-Eleven Franchisee Report", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
        }
        // Save PDF with timestamp in filename
        var dateForFile = now.toISOString().split('T')[0];
        var timeForFile = now.toTimeString().split(' ')[0].replace(/:/g, '-').substring(0, 5);
        doc.save(reportTitle.replace(/\s+/g, '_') + "_" + dateForFile + "_" + timeForFile + ".pdf");
    };
    return (React.createElement("div", { className: "flex gap-2" },
        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "flex items-center gap-1" },
            React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" }),
            "Print"),
        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExportPDF, className: "flex items-center gap-1" },
            React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
            "Export PDF"),
        React.createElement("div", { className: "hidden" },
            React.createElement("div", { ref: reportRef, className: "p-8" },
                React.createElement("div", { className: "text-center mb-6" },
                    React.createElement("div", { className: "flex justify-center mb-2" },
                        React.createElement("div", { className: "font-bold" },
                            React.createElement("span", { className: "text-[#008c48]" }, "7-ELEVEN"),
                            React.createElement("span", { className: "text-[#ff7a00] ml-1" }, "PHILIPPINES"))),
                    React.createElement("h1", { className: "text-2xl font-bold" }, reportTitle),
                    React.createElement("p", { className: "text-gray-500" },
                        "Generated on: ",
                        new Date().toLocaleDateString(),
                        " ",
                        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))),
                dashboardStats && (React.createElement("div", { className: "mb-8" },
                    React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Dashboard Summary"),
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" },
                        React.createElement("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-100" },
                            React.createElement("h3", { className: "text-blue-800 font-medium text-sm mb-1" }, "Active Job Listings"),
                            React.createElement("p", { className: "text-2xl font-bold text-blue-900" }, dashboardStats.activeJobListings)),
                        React.createElement("div", { className: "bg-purple-50 rounded-lg p-4 border border-purple-100" },
                            React.createElement("h3", { className: "text-purple-800 font-medium text-sm mb-1" }, "Positions Filled"),
                            React.createElement("p", { className: "text-2xl font-bold text-purple-900" }, dashboardStats.positionsFilled)),
                        React.createElement("div", { className: "bg-orange-50 rounded-lg p-4 border border-orange-100" },
                            React.createElement("h3", { className: "text-orange-800 font-medium text-sm mb-1" }, "Total Applications"),
                            React.createElement("p", { className: "text-2xl font-bold text-orange-900" }, dashboardStats.totalApplications)),
                        React.createElement("div", { className: "bg-green-50 rounded-lg p-4 border border-green-100" },
                            React.createElement("h3", { className: "text-green-800 font-medium text-sm mb-1" }, "Accepted Applicants"),
                            React.createElement("p", { className: "text-2xl font-bold text-green-900" }, dashboardStats.acceptedApplicants))))),
                reportData.length > 0 && columns.length > 0 && (React.createElement("div", { className: "mb-8" },
                    React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Activity Log"),
                    React.createElement("table", { className: "w-full border-collapse" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "bg-green-800 text-white" }, columns.map(function (column, idx) { return (React.createElement("th", { key: idx, className: "border p-2 text-left" }, column.header)); }))),
                        React.createElement("tbody", null, reportData.map(function (row, rowIdx) { return (React.createElement("tr", { key: rowIdx, className: rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white" }, columns.map(function (column, colIdx) {
                            var value = getCellValue(row, column.accessor);
                            // Format based on column type
                            var displayValue = value;
                            // Format date columns
                            if (column.header.toLowerCase().includes('date') ||
                                column.accessor === 'timestamp') {
                                displayValue = formatDate(value);
                            }
                            // Format JSON data in details column
                            if (column.header === 'Details' || column.accessor === 'details') {
                                var prettyValue = prettifyJSON(value);
                                // Replace newlines with <br> for HTML display
                                if (typeof prettyValue === 'string' && prettyValue.includes('\n')) {
                                    return (React.createElement("td", { key: colIdx, className: "border p-2 whitespace-pre-wrap" }, prettyValue.split('\n').map(function (line, i) { return (React.createElement("div", { key: i }, line)); })));
                                }
                                displayValue = prettyValue;
                            }
                            return (React.createElement("td", { key: colIdx, className: "border p-2" }, displayValue));
                        }))); }))))),
                DashboardCharts && jobs && applications && (React.createElement("div", { className: "mb-8" },
                    React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Analytics Charts"),
                    React.createElement(DashboardCharts, { jobs: jobs, applications: applications }))),
                jobs.length > 0 && (React.createElement("div", { className: "mb-8" },
                    React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Job Listings"),
                    React.createElement("table", { className: "w-full border-collapse" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "bg-green-800 text-white" },
                                React.createElement("th", { className: "border p-2 text-left" }, "Job Title"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Location"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Status"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Applications"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Interviewing"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Job Type"),
                                React.createElement("th", { className: "border p-2 text-left" }, "Pay Range"))),
                        React.createElement("tbody", null, jobs.map(function (job, index) {
                            var jobApps = applications.filter(function (app) { return app.jobId === job.id; });
                            var interviewing = jobApps.filter(function (app) {
                                return app.status === "under_review" || app.status === "interview";
                            }).length;
                            return (React.createElement("tr", { key: job.id, className: index % 2 === 0 ? "bg-gray-50" : "bg-white" },
                                React.createElement("td", { className: "border p-2" }, job.title),
                                React.createElement("td", { className: "border p-2" }, job.location),
                                React.createElement("td", { className: "border p-2" }, job.status),
                                React.createElement("td", { className: "border p-2" }, jobApps.length),
                                React.createElement("td", { className: "border p-2" }, interviewing),
                                React.createElement("td", { className: "border p-2" }, job.jobType),
                                React.createElement("td", { className: "border p-2" }, job.payRange || "Not specified")));
                        }))))),
                jobs.length > 0 && applications.length > 0 && (React.createElement("div", null,
                    React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Detailed Job Application Breakdown"),
                    jobs.map(function (job) {
                        var jobApps = applications.filter(function (app) { return app.jobId === job.id; });
                        return (React.createElement("div", { key: job.id, className: "mb-8" },
                            React.createElement("h3", { className: "text-lg font-medium text-green-800" },
                                job.title,
                                " (",
                                job.status,
                                ")"),
                            React.createElement("p", { className: "mb-1" },
                                "Location: ",
                                job.location),
                            React.createElement("p", { className: "mb-4" },
                                "Applications: ",
                                jobApps.length),
                            jobApps.length > 0 ? (React.createElement("table", { className: "w-full border-collapse" },
                                React.createElement("thead", null,
                                    React.createElement("tr", { className: "bg-orange-500 text-white" },
                                        React.createElement("th", { className: "border p-2 text-left" }, "Applicant"),
                                        React.createElement("th", { className: "border p-2 text-left" }, "Status"),
                                        React.createElement("th", { className: "border p-2 text-left" }, "Applied Date"),
                                        React.createElement("th", { className: "border p-2 text-left" }, "Email"),
                                        React.createElement("th", { className: "border p-2 text-left" }, "Phone"))),
                                React.createElement("tbody", null, jobApps.map(function (app, idx) { return (React.createElement("tr", { key: app.id, className: idx % 2 === 0 ? "bg-gray-50" : "bg-white" },
                                    React.createElement("td", { className: "border p-2" }, app.applicantName),
                                    React.createElement("td", { className: "border p-2" }, app.status),
                                    React.createElement("td", { className: "border p-2" }, new Date(app.createdAt).toLocaleDateString()),
                                    React.createElement("td", { className: "border p-2" }, app.email || "Not provided"),
                                    React.createElement("td", { className: "border p-2" }, app.phone || "Not provided"))); })))) : (React.createElement("p", { className: "italic text-gray-500" }, "No applications for this position"))));
                    })))))));
}
exports["default"] = ReportActions;
