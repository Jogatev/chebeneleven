"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var react_query_1 = require("@tanstack/react-query");
var header_1 = require("@/components/header");
var job_card_1 = require("@/components/job-card");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
function ApplicantPortal() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), keyword = _b[0], setKeyword = _b[1];
    var _c = react_1.useState(""), location = _c[0], setLocationFilter = _c[1];
    var _d = react_1.useState("newest"), sortOrder = _d[0], setSortOrder = _d[1];
    var _e = react_1.useState(""), minSalary = _e[0], setMinSalary = _e[1];
    var _f = react_1.useState(""), maxSalary = _f[0], setMaxSalary = _f[1];
    // Fetch job listings
    var _g = react_query_1.useQuery({
        queryKey: ["/api/jobs"]
    }), jobs = _g.data, isLoading = _g.isLoading, error = _g.error;
    var handleSearch = function (e) {
        e.preventDefault();
        console.log("Searching for:", { keyword: keyword, location: location, minSalary: minSalary, maxSalary: maxSalary });
    };
    var handleJobSelect = function (jobId) {
        setLocation("/apply/" + jobId);
    };
    var handleBackToSelection = function () {
        setLocation("/");
    };
    var filteredJobs = jobs
        ? jobs.filter(function (job) {
            var matchesKeyword = !keyword || keyword === "all" ||
                job.title.toLowerCase().includes(keyword.toLowerCase()) ||
                job.description.toLowerCase().includes(keyword.toLowerCase());
            var matchesLocation = !location ||
                job.location.toLowerCase().includes(location.toLowerCase());
            var matchesSalary = true;
            if (job.payRange) {
                var salaryNumbers = job.payRange.match(/\d+/g);
                if (salaryNumbers && salaryNumbers.length > 0) {
                    var jobMinSalary = parseInt(salaryNumbers[0]);
                    var jobMaxSalary = salaryNumbers.length > 1 ?
                        parseInt(salaryNumbers[salaryNumbers.length - 1]) :
                        jobMinSalary;
                    if (minSalary && parseInt(minSalary) > jobMaxSalary) {
                        matchesSalary = false;
                    }
                    if (maxSalary && parseInt(maxSalary) < jobMinSalary) {
                        matchesSalary = false;
                    }
                }
            }
            else if (minSalary) {
                matchesSalary = false;
            }
            return matchesKeyword && matchesLocation && matchesSalary;
        })
        : [];
    var sortedJobs = __spreadArrays(filteredJobs).sort(function (a, b) {
        if (sortOrder === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        else if (sortOrder === "relevance") {
            return a.title.localeCompare(b.title);
        }
        else { // "a-z"
            return a.title.localeCompare(b.title);
        }
    });
    return (React.createElement("div", { className: "min-h-screen flex flex-col" },
        React.createElement(header_1["default"], { showBackButton: true, onBackClick: handleBackToSelection, backText: "Back to Selection" }),
        React.createElement("main", { className: "flex-grow p-4" },
            React.createElement("div", { className: "max-w-7xl mx-auto" },
                React.createElement("div", { className: "bg-[#00703c] text-white rounded-lg p-6 md:p-10 mb-8" },
                    React.createElement("h1", { className: "text-3xl md:text-4xl font-bold mb-4" }, "Find Your Career at 7-Eleven"),
                    React.createElement("p", { className: "text-lg mb-6" }, "Discover opportunities with 7-Eleven franchisees in your area"),
                    React.createElement("form", { onSubmit: handleSearch, className: "bg-white rounded-lg p-4 text-neutral-800" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Position"),
                                    React.createElement(select_1.Select, { value: keyword, onValueChange: setKeyword },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Select position" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "all" }, "All Positions"), jobs === null || jobs === void 0 ? void 0 :
                                            jobs.map(function (job) { return (React.createElement(select_1.SelectItem, { key: job.id, value: job.title }, job.title)); })))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Location"),
                                    React.createElement(input_1.Input, { placeholder: "City or province in Philippines", value: location, onChange: function (e) { return setLocationFilter(e.target.value); } }))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" },
                                    "Salary Range ",
                                    (minSalary || maxSalary) && React.createElement("span", { className: "text-green-600 text-xs ml-1" }, "(Active)")),
                                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                    React.createElement("div", null,
                                        React.createElement(input_1.Input, { type: "number", placeholder: "Min salary", value: minSalary, onChange: function (e) { return setMinSalary(e.target.value); }, className: "w-full " + (minSalary ? "border-green-500" : "") })),
                                    React.createElement("div", null,
                                        React.createElement(input_1.Input, { type: "number", placeholder: "Max salary", value: maxSalary, onChange: function (e) { return setMaxSalary(e.target.value); }, className: "w-full " + (maxSalary ? "border-green-500" : "") })))),
                            React.createElement("div", { className: "flex justify-end" },
                                React.createElement(button_1.Button, { type: "submit", className: "bg-[#00703c] hover:bg-green-700 transition-colors" }, "Search Jobs"))))),
                React.createElement("div", { className: "bg-white rounded-lg shadow-md overflow-hidden mb-8" },
                    React.createElement("div", { className: "p-6 border-b border-gray-200" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h2", { className: "text-2xl font-semibold text-neutral-800" }, "Available Positions"),
                            React.createElement("div", { className: "flex space-x-2" },
                                React.createElement(select_1.Select, { value: sortOrder, onValueChange: function (value) { return setSortOrder(value); } },
                                    React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Sort by" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "newest" }, "Sort by: Newest"),
                                        React.createElement(select_1.SelectItem, { value: "relevance" }, "Sort by: Relevance"),
                                        React.createElement(select_1.SelectItem, { value: "a-z" }, "Sort by: A-Z")))))),
                    React.createElement("div", { className: "divide-y divide-gray-200" }, isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map(function (_, i) { return (React.createElement("div", { key: i, className: "p-6" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("div", { className: "w-3/4" },
                                React.createElement(skeleton_1.Skeleton, { className: "h-6 w-48 mb-2" }),
                                React.createElement(skeleton_1.Skeleton, { className: "h-4 w-32 mb-2" }),
                                React.createElement(skeleton_1.Skeleton, { className: "h-4 w-40 mb-4" }),
                                React.createElement(skeleton_1.Skeleton, { className: "h-20 w-full mb-3" }),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(skeleton_1.Skeleton, { className: "h-6 w-20" }),
                                    React.createElement(skeleton_1.Skeleton, { className: "h-6 w-20" }))),
                            React.createElement("div", { className: "flex flex-col items-end" },
                                React.createElement(skeleton_1.Skeleton, { className: "h-4 w-24 mb-4" }),
                                React.createElement(skeleton_1.Skeleton, { className: "h-10 w-32" }))))); })) : error ? (React.createElement("div", { className: "p-6 text-center" },
                        React.createElement("p", { className: "text-red-500" }, "Error loading jobs. Please try again later."))) : sortedJobs.length === 0 ? (React.createElement("div", { className: "p-6 text-center" },
                        React.createElement("p", { className: "text-gray-500" }, "No job listings found. Try adjusting your search criteria."))) : (sortedJobs.map(function (job) { return (React.createElement(job_card_1["default"], { key: job.id, job: job, onClick: function () { return handleJobSelect(job.id); } })); }))),
                    jobs && jobs.length > 0 && (React.createElement("div", { className: "p-6 border-t border-gray-200" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("span", { className: "text-gray-600" },
                                "Showing 1-",
                                Math.min(sortedJobs.length, jobs.length),
                                " of ",
                                jobs.length,
                                " jobs"),
                            React.createElement("div", { className: "flex space-x-2" },
                                React.createElement(button_1.Button, { variant: "outline", disabled: true }, "Previous"),
                                React.createElement(button_1.Button, { variant: "outline", disabled: sortedJobs.length >= jobs.length }, "Next"))))))))));
}
exports["default"] = ApplicantPortal;
