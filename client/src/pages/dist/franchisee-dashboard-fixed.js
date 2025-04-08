"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var wouter_1 = require("wouter");
var queryClient_1 = require("@/lib/queryClient");
var use_auth_1 = require("@/hooks/use-auth");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var activity_card_1 = require("@/components/activity-card");
var date_fns_1 = require("date-fns");
var use_toast_1 = require("@/hooks/use-toast");
var tabs_1 = require("@/components/ui/tabs");
var report_actions_1 = require("@/components/report-actions");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var button_1 = require("@/components/ui/button");
var header_1 = require("@/components/header");
var application_card_1 = require("@/components/application-card");
var lucide_react_1 = require("lucide-react");
// Job creation schema
var createJobSchema = zod_2.z.object({
    title: zod_2.z.string().min(3, "Job title is required"),
    location: zod_2.z.string().min(3, "Location is required"),
    description: zod_2.z.string().min(10, "Description is required"),
    requirements: zod_2.z.string().min(10, "Requirements are required"),
    jobType: zod_2.z.string().min(1, "Job type is required"),
    department: zod_2.z.string().optional(),
    payRange: zod_2.z.string().optional(),
    closingDate: zod_2.z.string().optional(),
    benefits: zod_2.z.string().optional(),
    status: zod_2.z.string()["default"]("active")
});
function FranchiseeDashboard() {
    var _this = this;
    var _a = use_auth_1.useAuth(), user = _a.user, logoutMutation = _a.logoutMutation;
    var toast = use_toast_1.useToast().toast;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState("jobListings"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = react_1.useState("all"), jobStatusFilter = _d[0], setJobStatusFilter = _d[1];
    var _e = react_1.useState("all"), selectedJobFilter = _e[0], setSelectedJobFilter = _e[1];
    var _f = react_1.useState("all"), applicationStatusFilter = _f[0], setApplicationStatusFilter = _f[1];
    var _g = react_1.useState(""), searchQuery = _g[0], setSearchQuery = _g[1];
    var searchInputRef = react_1.useRef(null);
    // Add this with your other queries
    var _h = react_query_1.useQuery({
        queryKey: ["/api/my-activities"],
        // Only fetch when the activities tab is active
        enabled: activeTab === "activities"
    }), activities = _h.data, isActivitiesLoading = _h.isLoading, activitiesError = _h.error;
    // Queries for job listings
    var _j = react_query_1.useQuery({
        queryKey: ["/api/my-jobs"]
    }), jobs = _j.data, isJobsLoading = _j.isLoading, jobsError = _j.error;
    // Query for applications
    var _k = react_query_1.useQuery({
        queryKey: ["/api/my-applications"]
    }), applications = _k.data, isApplicationsLoading = _k.isLoading, applicationsError = _k.error;
    // Job creation form
    var jobForm = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createJobSchema),
        defaultValues: {
            title: "",
            location: "",
            description: "",
            requirements: "",
            jobType: "",
            department: "",
            payRange: "",
            closingDate: date_fns_1.format(new Date(), "yyyy-MM-dd"),
            benefits: "",
            status: "active"
        }
    });
    // Create job mutation
    var createJobMutation = react_query_1.useMutation({
        mutationFn: function (jobData) { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryClient_1.apiRequest("POST", "/api/jobs", jobData)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Job Created",
                description: "Your job listing has been successfully created"
            });
            jobForm.reset();
            queryClient_1.queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
            setActiveTab("jobListings");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "There was an error creating the job listing",
                variant: "destructive"
            });
        }
    });
    // Update job status mutation
    var updateJobMutation = react_query_1.useMutation({
        mutationFn: function (_a) {
            var id = _a.id, status = _a.status;
            return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, queryClient_1.apiRequest("PATCH", "/api/jobs/" + id, { status: status })];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, res.json()];
                    }
                });
            });
        },
        onSuccess: function () {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
            toast({
                title: "Job Updated",
                description: "The job status has been updated"
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "There was an error updating the job",
                variant: "destructive"
            });
        }
    });
    // Update application status mutation
    var updateApplicationMutation = react_query_1.useMutation({
        mutationFn: function (_a) {
            var id = _a.id, status = _a.status;
            return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, queryClient_1.apiRequest("PATCH", "/api/applications/" + id, { status: status })];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, res.json()];
                    }
                });
            });
        },
        onSuccess: function () {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
            toast({
                title: "Application Updated",
                description: "The application status has been updated"
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "There was an error updating the application",
                variant: "destructive"
            });
        }
    });
    // Submit job form
    var onSubmitJobForm = function (data) {
        // Convert date string to ISO format for consistent handling
        if (data.closingDate) {
            // Send the date as a string in ISO format
            var formattedData = __assign(__assign({}, data), { closingDate: new Date(data.closingDate).toISOString() });
            createJobMutation.mutate(formattedData);
        }
        else {
            createJobMutation.mutate(data);
        }
    };
    // Handle job status change
    var handleJobStatusChange = function (jobId, newStatus) {
        if (newStatus === "archived")
            if (window.confirm("Are you sure you want to archive this job listing? It will no longer be visible to applicants.")) {
                updateJobMutation.mutate({ id: jobId, status: newStatus });
            }
            else {
                updateJobMutation.mutate({ id: jobId, status: newStatus });
            }
    };
    // Handle application status change
    var handleApplicationStatusChange = function (applicationId, newStatus) {
        updateApplicationMutation.mutate({ id: applicationId, status: newStatus });
    };
    // Handle logout
    var handleLogout = function () {
        logoutMutation.mutate();
    };
    // Filter jobs based on status and search query
    var filteredJobs = jobs ? jobs.filter(function (job) {
        // First filter by status
        if (jobStatusFilter !== "all" && job.status !== jobStatusFilter) {
            return false;
        }
        // Then filter by search query if one exists
        if (searchQuery) {
            var query = searchQuery.toLowerCase();
            return (job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query));
        }
        return true;
    }) : [];
    // Filter applications based on job and status
    var filteredApplications = applications ? applications.filter(function (app) {
        var matchesJob = selectedJobFilter === "all" || app.jobId === selectedJobFilter;
        var matchesStatus = applicationStatusFilter === "all" || app.status === applicationStatusFilter;
        return matchesJob && matchesStatus;
    }) : [];
    // Calculate dashboard stats
    var dashboardStats = {
        activeJobListings: (jobs === null || jobs === void 0 ? void 0 : jobs.filter(function (job) { return job.status === "active"; }).length) || 0,
        newApplications: (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "submitted"; }).length) || 0,
        underReview: (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.status === "under_review"; }).length) || 0,
        positionsFilled: (jobs === null || jobs === void 0 ? void 0 : jobs.filter(function (job) { return job.status === "filled"; }).length) || 0
    };
    return (React.createElement("div", { className: "min-h-screen flex flex-col" },
        React.createElement(header_1["default"], { title: "Franchisee Dashboard", showBackButton: false, showLogout: true, onLogout: handleLogout, franchiseeName: user === null || user === void 0 ? void 0 : user.franchiseeName, franchiseeId: user === null || user === void 0 ? void 0 : user.franchiseeId }),
        React.createElement("main", { className: "flex-grow p-4" },
            React.createElement("div", { className: "max-w-7xl mx-auto" },
                React.createElement("div", { className: "bg-white rounded-lg shadow-md p-6 mb-8" },
                    React.createElement("h1", { className: "text-2xl font-bold text-neutral-800 mb-6" }, "Job Management Dashboard"),
                    React.createElement("div", { className: "grid md:grid-cols-4 gap-4" },
                        React.createElement("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-100" },
                            React.createElement("h3", { className: "text-blue-800 font-medium text-sm mb-1" }, "Active Job Listings"),
                            React.createElement("p", { className: "text-2xl font-bold text-blue-900" }, isJobsLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }) : dashboardStats.activeJobListings)),
                        React.createElement("div", { className: "bg-green-50 rounded-lg p-4 border border-green-100" },
                            React.createElement("h3", { className: "text-green-800 font-medium text-sm mb-1" }, "New Applications"),
                            React.createElement("p", { className: "text-2xl font-bold text-green-900" }, isApplicationsLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }) : dashboardStats.newApplications)),
                        React.createElement("div", { className: "bg-yellow-50 rounded-lg p-4 border border-yellow-100" },
                            React.createElement("h3", { className: "text-yellow-800 font-medium text-sm mb-1" }, "Under Review"),
                            React.createElement("p", { className: "text-2xl font-bold text-yellow-900" }, isApplicationsLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }) : dashboardStats.underReview)),
                        React.createElement("div", { className: "bg-purple-50 rounded-lg p-4 border border-purple-100" },
                            React.createElement("h3", { className: "text-purple-800 font-medium text-sm mb-1" }, "Positions Filled"),
                            React.createElement("p", { className: "text-2xl font-bold text-purple-900" }, isJobsLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }) : dashboardStats.positionsFilled)))),
                React.createElement("div", { className: "bg-white rounded-lg shadow-md overflow-hidden mb-8" },
                    React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                        React.createElement("div", { className: "border-b border-gray-200" },
                            React.createElement(tabs_1.TabsList, { className: "flex rounded-none bg-transparent h-auto border-b border-b-transparent" },
                                React.createElement(tabs_1.TabsTrigger, { value: "jobListings", className: "data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none" }, "Job Listings"),
                                React.createElement(tabs_1.TabsTrigger, { value: "applications", className: "data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none" }, "Applications"),
                                React.createElement(tabs_1.TabsTrigger, { value: "createJob", className: "data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none" }, "Create Job"),
                                React.createElement(tabs_1.TabsTrigger, { value: "activities", className: "data-[state=active]:text-[#ff7a00] data-[state=active]:border-[#ff7a00] py-4 px-6 font-medium data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent rounded-none" }, "Activities"))),
                        React.createElement(tabs_1.TabsContent, { value: "jobListings", className: "p-0" },
                            React.createElement("div", { className: "p-6 border-b border-gray-200" },
                                React.createElement("div", { className: "flex justify-between items-center flex-col sm:flex-row gap-3" },
                                    React.createElement("h2", { className: "text-xl font-semibold text-neutral-800" }, "Your Job Listings"),
                                    React.createElement("div", { className: "flex space-x-2 items-center" },
                                        React.createElement(report_actions_1["default"], { reportTitle: "7-Eleven Job Listings Report", reportData: filteredJobs, columns: [
                                                { header: "Job Title", accessor: "title" },
                                                { header: "Location", accessor: "location" },
                                                { header: "Job Type", accessor: "jobType" },
                                                { header: "Pay Range", accessor: "payRange" },
                                                { header: "Status", accessor: "status" },
                                                { header: "Created", accessor: "createdAt" },
                                            ] }),
                                        React.createElement(select_1.Select, { value: jobStatusFilter, onValueChange: setJobStatusFilter },
                                            React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                                React.createElement(select_1.SelectItem, { value: "filled" }, "Filled"),
                                                React.createElement(select_1.SelectItem, { value: "closed" }, "Closed"),
                                                React.createElement(select_1.SelectItem, { value: "archived" }, "Archived")))))),
                            React.createElement("div", { className: "p-4 border-b border-gray-200" },
                                React.createElement("div", { className: "relative" },
                                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", size: 18 }),
                                    React.createElement(input_1.Input, { ref: searchInputRef, type: "text", placeholder: "Search job listings...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 pr-10 py-2 border-gray-300 focus:ring-orange-500 focus:border-orange-500" }),
                                    searchQuery && (React.createElement("button", { onClick: function () {
                                            var _a;
                                            setSearchQuery("");
                                            (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                                        }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" },
                                        React.createElement(lucide_react_1.X, { size: 18 }))))),
                            React.createElement("div", { className: "divide-y divide-gray-200" }, isJobsLoading ? (React.createElement("div", { className: "p-6 text-center" },
                                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto" }),
                                React.createElement("p", { className: "mt-2 text-gray-500" }, "Loading your job listings..."))) : jobsError ? (React.createElement("div", { className: "p-6 text-center" },
                                React.createElement("p", { className: "text-red-500" }, "Error loading job listings"))) : filteredJobs.length === 0 ? (React.createElement("div", { className: "p-6 text-center" }, searchQuery ? (React.createElement(React.Fragment, null,
                                React.createElement("p", { className: "text-gray-500" },
                                    "No job listings found matching \"",
                                    searchQuery,
                                    "\""),
                                React.createElement(button_1.Button, { onClick: function () { return setSearchQuery(""); }, className: "mt-4", variant: "outline" }, "Clear Search"))) : (React.createElement(React.Fragment, null,
                                React.createElement("p", { className: "text-gray-500" }, "No job listings found"),
                                React.createElement(button_1.Button, { onClick: function () { return setActiveTab("createJob"); }, className: "mt-4 bg-[#ff7a00] hover:bg-orange-600" }, "Create Your First Job"))))) : (filteredJobs.map(function (job) { return (React.createElement("div", { key: job.id, className: "p-6 hover:bg-neutral-100 transition-colors cursor-pointer", onClick: function () { return setLocation("/jobs/" + job.id); } },
                                React.createElement("div", { className: "flex justify-between flex-col sm:flex-row" },
                                    React.createElement("div", null,
                                        React.createElement("h3", { className: "text-lg font-semibold text-neutral-800 mb-1" }, job.title),
                                        React.createElement("p", { className: "text-gray-600 mb-2" },
                                            "Posted on ",
                                            new Date(job.createdAt).toLocaleDateString()),
                                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                                            job.status === "active" && (React.createElement("span", { className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm" }, "Active")),
                                            job.status === "filled" && (React.createElement("span", { className: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" }, "Filled")),
                                            job.status === "closed" && (React.createElement("span", { className: "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm" }, "Closed")),
                                            React.createElement("span", { className: "bg-neutral-100 text-gray-700 px-3 py-1 rounded-full text-sm" },
                                                (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.jobId === job.id; }).length) || 0,
                                                " Applications"))),
                                    React.createElement("div", { className: "flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0", onClick: function (e) { return e.stopPropagation(); } },
                                        React.createElement(button_1.Button, { variant: "outline", className: "border-gray-300", onClick: function (e) {
                                                e.stopPropagation();
                                                toast({
                                                    title: "Feature Coming Soon",
                                                    description: "Job editing will be available in a future update"
                                                });
                                            } }, "Edit"),
                                        job.status === "active" ? (React.createElement(button_1.Button, { variant: "outline", className: "border-gray-300", onClick: function (e) {
                                                e.stopPropagation();
                                                handleJobStatusChange(job.id, "closed");
                                            } }, "Close")) : (React.createElement(button_1.Button, { variant: "outline", className: "border-gray-300", onClick: function (e) {
                                                e.stopPropagation();
                                                handleJobStatusChange(job.id, "active");
                                            } }, "Reactivate")),
                                        React.createElement(button_1.Button, { variant: "default", className: "bg-[#ff7a00] hover:bg-orange-600", onClick: function (e) {
                                                e.stopPropagation();
                                                setLocation("/jobs/" + job.id);
                                            } }, "View Details"))))); })))),
                        React.createElement(tabs_1.TabsContent, { value: "applications", className: "p-0" },
                            React.createElement("div", { className: "p-6 border-b border-gray-200" },
                                React.createElement("div", { className: "flex justify-between items-center flex-col sm:flex-row gap-3" },
                                    React.createElement("h2", { className: "text-xl font-semibold text-neutral-800" }, "Job Applications"),
                                    React.createElement("div", { className: "flex space-x-2 flex-col sm:flex-row gap-2" },
                                        React.createElement(select_1.Select, { value: selectedJobFilter === "all" ? "all" : String(selectedJobFilter), onValueChange: function (value) { return setSelectedJobFilter(value === "all" ? "all" : parseInt(value)); } },
                                            React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Filter by job" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "all" }, "All Jobs"), jobs === null || jobs === void 0 ? void 0 :
                                                jobs.map(function (job) { return (React.createElement(select_1.SelectItem, { key: job.id, value: String(job.id) }, job.title)); }))),
                                        React.createElement(select_1.Select, { value: applicationStatusFilter, onValueChange: setApplicationStatusFilter },
                                            React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                                React.createElement(select_1.SelectItem, { value: "submitted" }, "New"),
                                                React.createElement(select_1.SelectItem, { value: "under_review" }, "Under Review"),
                                                React.createElement(select_1.SelectItem, { value: "interviewed" }, "Interviewed"),
                                                React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))))),
                            React.createElement("div", { className: "divide-y divide-gray-200" }, isApplicationsLoading || isJobsLoading ? (React.createElement("div", { className: "p-6 text-center" },
                                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto" }),
                                React.createElement("p", { className: "mt-2 text-gray-500" }, "Loading applications..."))) : applicationsError ? (React.createElement("div", { className: "p-6 text-center" },
                                React.createElement("p", { className: "text-red-500" }, "Error loading applications"))) : filteredApplications.length === 0 ? (React.createElement("div", { className: "p-6 text-center" },
                                React.createElement("p", { className: "text-gray-500" }, "No applications found"))) : (filteredApplications.map(function (application) {
                                // Find the job this application is for
                                var job = jobs === null || jobs === void 0 ? void 0 : jobs.find(function (j) { return j.id === application.jobId; });
                                if (!job)
                                    return null;
                                // Create an enhanced application with job details
                                var enhancedApplication = __assign(__assign({}, application), { jobTitle: job.title, jobLocation: job.location });
                                return (React.createElement(application_card_1["default"], { key: application.id, application: enhancedApplication, jobTitle: job.title, onStatusChange: function (newStatus) { return handleApplicationStatusChange(application.id, newStatus); } }));
                            })))),
                        React.createElement(tabs_1.TabsContent, { value: "activities", className: "p-0" },
                            React.createElement("div", { className: "p-6" },
                                React.createElement("div", { className: "flex justify-between items-center mb-4" },
                                    React.createElement("h2", { className: "text-xl font-semibold text-neutral-800" }, "Recent Activities"),
                                    React.createElement(report_actions_1["default"], { reportTitle: "7-Eleven Activities Report", reportData: activities || [], columns: [
                                            { header: "Action", accessor: "action" },
                                            { header: "Entity Type", accessor: "entityType" },
                                            { header: "Details", accessor: function (row) { return JSON.stringify(row.details); } },
                                            { header: "Date", accessor: "timestamp" },
                                        ] })),
                                React.createElement("div", { className: "space-y-4 mt-6" }, isActivitiesLoading ? (React.createElement("div", { className: "text-center py-8" },
                                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto" }),
                                    React.createElement("p", { className: "mt-2 text-gray-500" }, "Loading activities..."))) : (activities === null || activities === void 0 ? void 0 : activities.length) ? (activities.map(function (activity) { return (React.createElement(activity_card_1["default"], { key: activity.id, activity: activity })); })) : (React.createElement("div", { className: "text-center py-8 border border-dashed border-gray-300 rounded-md" },
                                    React.createElement("p", { className: "text-gray-500" }, "No activities found.")))))),
                        React.createElement(tabs_1.TabsContent, { value: "createJob", className: "p-0" },
                            React.createElement("div", { className: "p-6" },
                                React.createElement("h2", { className: "text-xl font-semibold text-neutral-800 mb-6" }, "Create New Job Listing"),
                                React.createElement(form_1.Form, __assign({}, jobForm),
                                    React.createElement("form", { onSubmit: jobForm.handleSubmit(onSubmitJobForm), className: "space-y-6" },
                                        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "title", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Job Title*"),
                                                        React.createElement(form_1.FormControl, null,
                                                            React.createElement(input_1.Input, __assign({ placeholder: "e.g., Store Associate" }, field))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } }),
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "jobType", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Job Type*"),
                                                        React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                                            React.createElement(form_1.FormControl, null,
                                                                React.createElement(select_1.SelectTrigger, null,
                                                                    React.createElement(select_1.SelectValue, { placeholder: "Select job type" }))),
                                                            React.createElement(select_1.SelectContent, null,
                                                                React.createElement(select_1.SelectItem, { value: "Full-time" }, "Full-time"),
                                                                React.createElement(select_1.SelectItem, { value: "Part-time" }, "Part-time"),
                                                                React.createElement(select_1.SelectItem, { value: "Temporary" }, "Temporary"),
                                                                React.createElement(select_1.SelectItem, { value: "Seasonal" }, "Seasonal"))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } }),
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "location", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Location*"),
                                                        React.createElement(form_1.FormControl, null,
                                                            React.createElement(input_1.Input, __assign({ placeholder: "City, State" }, field))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } }),
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "department", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Department"),
                                                        React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                                            React.createElement(form_1.FormControl, null,
                                                                React.createElement(select_1.SelectTrigger, null,
                                                                    React.createElement(select_1.SelectValue, { placeholder: "Select department" }))),
                                                            React.createElement(select_1.SelectContent, null,
                                                                React.createElement(select_1.SelectItem, { value: "Store Operations" }, "Store Operations"),
                                                                React.createElement(select_1.SelectItem, { value: "Food Service" }, "Food Service"),
                                                                React.createElement(select_1.SelectItem, { value: "Management" }, "Management"),
                                                                React.createElement(select_1.SelectItem, { value: "Maintenance" }, "Maintenance"))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } }),
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "payRange", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Pay Range"),
                                                        React.createElement(form_1.FormControl, null,
                                                            React.createElement(input_1.Input, __assign({ placeholder: "e.g., $15-$18/hour" }, field))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } }),
                                            React.createElement(form_1.FormField, { control: jobForm.control, name: "closingDate", render: function (_a) {
                                                    var field = _a.field;
                                                    return (React.createElement(form_1.FormItem, null,
                                                        React.createElement(form_1.FormLabel, null, "Closing Date"),
                                                        React.createElement(form_1.FormControl, null,
                                                            React.createElement(input_1.Input, __assign({ type: "date" }, field, { value: typeof field.value === 'string' ? field.value : date_fns_1.format(new Date(field.value || Date.now()), "yyyy-MM-dd") }))),
                                                        React.createElement(form_1.FormMessage, null)));
                                                } })),
                                        React.createElement(form_1.FormField, { control: jobForm.control, name: "description", render: function (_a) {
                                                var field = _a.field;
                                                return (React.createElement(form_1.FormItem, null,
                                                    React.createElement(form_1.FormLabel, null, "Job Description*"),
                                                    React.createElement(form_1.FormControl, null,
                                                        React.createElement(textarea_1.Textarea, __assign({ placeholder: "Describe the job responsibilities and duties", className: "min-h-[120px]" }, field))),
                                                    React.createElement(form_1.FormMessage, null)));
                                            } }),
                                        React.createElement(form_1.FormField, { control: jobForm.control, name: "requirements", render: function (_a) {
                                                var field = _a.field;
                                                return (React.createElement(form_1.FormItem, null,
                                                    React.createElement(form_1.FormLabel, null, "Job Requirements*"),
                                                    React.createElement(form_1.FormControl, null,
                                                        React.createElement(textarea_1.Textarea, __assign({ placeholder: "List the qualifications and skills required", className: "min-h-[120px]" }, field))),
                                                    React.createElement(form_1.FormMessage, null)));
                                            } }),
                                        React.createElement(form_1.FormField, { control: jobForm.control, name: "benefits", render: function (_a) {
                                                var field = _a.field;
                                                return (React.createElement(form_1.FormItem, null,
                                                    React.createElement(form_1.FormLabel, null, "Benefits (Optional)"),
                                                    React.createElement(form_1.FormControl, null,
                                                        React.createElement(textarea_1.Textarea, __assign({ placeholder: "List any benefits or perks offered with this position", className: "min-h-[80px]" }, field))),
                                                    React.createElement(form_1.FormMessage, null)));
                                            } }),
                                        React.createElement("div", { className: "flex justify-end" },
                                            React.createElement(button_1.Button, { type: "submit", className: "bg-[#ff7a00] hover:bg-orange-600", disabled: createJobMutation.isPending }, createJobMutation.isPending ? (React.createElement(React.Fragment, null,
                                                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                                                "Creating...")) : ("Create Job Listing")))))))))))));
}
exports["default"] = FranchiseeDashboard;
