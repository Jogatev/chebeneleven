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
var wouter_1 = require("wouter");
var react_query_1 = require("@tanstack/react-query");
var header_1 = require("@/components/header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var use_toast_1 = require("@/hooks/use-toast");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var use_auth_1 = require("@/hooks/use-auth");
var application_card_1 = require("@/components/application-card");
var queryClient_1 = require("@/lib/queryClient");
var lucide_react_1 = require("lucide-react");
function JobDetails() {
    var _this = this;
    var user = use_auth_1.useAuth().user;
    var toast = use_toast_1.useToast().toast;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = wouter_1.useRoute("/job/:id"), params = _b[1];
    var jobId = params ? parseInt(params.id) : 0;
    var _c = react_query_1.useQuery({
        queryKey: ["/api/jobs", jobId],
        queryFn: function (_a) {
            var queryKey = _a.queryKey;
            return __awaiter(_this, void 0, void 0, function () {
                var id, response, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = queryKey[1];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, queryClient_1.apiRequest("GET", "/api/jobs/" + id)];
                        case 2:
                            response = _b.sent();
                            return [4 /*yield*/, response.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_1 = _b.sent();
                            console.error("Error fetching job:", error_1);
                            throw new Error(error_1 instanceof Error ? error_1.message : "Failed to load job");
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        enabled: !!jobId
    }), job = _c.data, jobLoading = _c.isLoading, jobError = _c.error;
    var _d = react_query_1.useQuery({
        queryKey: ["/api/jobs", jobId, "applications"],
        queryFn: function (_a) {
            var queryKey = _a.queryKey;
            return __awaiter(_this, void 0, void 0, function () {
                var id, response, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = queryKey[1];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, queryClient_1.apiRequest("GET", "/api/applications/job/" + id)];
                        case 2:
                            response = _b.sent();
                            return [4 /*yield*/, response.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_2 = _b.sent();
                            console.error("Error fetching applications:", error_2);
                            throw new Error(error_2 instanceof Error ? error_2.message : "Failed to load applications");
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        enabled: !!jobId
    }), applications = _d.data, applicationsLoading = _d.isLoading, applicationsError = _d.error;
    var updateStatusMutation = react_query_1.useMutation({
        mutationFn: function (_a) {
            var applicationId = _a.applicationId, status = _a.status;
            return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, queryClient_1.apiRequest("PATCH", "/api/applications/" + applicationId, { status: status })];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, res.json()];
                    }
                });
            });
        },
        onSuccess: function () {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId, "applications"] });
            toast({
                title: "Status updated",
                description: "Application status has been updated successfully."
            });
        },
        onError: function (error) {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    var handleStatusChange = react_1.useCallback(function (applicationId, status) {
        updateStatusMutation.mutate({ applicationId: applicationId, status: status });
    }, [updateStatusMutation]);
    var formatJobType = function (type) {
        return type
            .split("_")
            .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
            .join(" ");
    };
    var formatSalary = function (min, max) {
        if (!min && !max)
            return "Not specified";
        if (min && !max)
            return "$" + min.toLocaleString() + "/year+";
        if (!min && max)
            return "Up to $" + max.toLocaleString() + "/year";
        return "$" + (min === null || min === void 0 ? void 0 : min.toLocaleString()) + " - $" + (max === null || max === void 0 ? void 0 : max.toLocaleString()) + "/year";
    };
    if (jobLoading) {
        return (React.createElement("div", { className: "container mx-auto p-3 sm:p-4" },
            React.createElement(header_1["default"], { title: "Job Details", showBackButton: true, onBackClick: function () { return setLocation("/dashboard"); } }),
            React.createElement("div", { className: "flex flex-col justify-center items-center h-52 sm:h-64 mt-2 sm:mt-4" },
                React.createElement(lucide_react_1.Loader2, { className: "h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary mb-2" }),
                React.createElement("span", { className: "text-sm sm:text-base text-muted-foreground" }, "Loading job details..."))));
    }
    if (jobError) {
        return (React.createElement("div", { className: "container mx-auto p-3 sm:p-4" },
            React.createElement(header_1["default"], { title: "Job Details", showBackButton: true, onBackClick: function () { return setLocation("/dashboard"); } }),
            React.createElement("div", { className: "bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base mt-2 sm:mt-4" },
                "Error loading job details: ",
                jobError.message)));
    }
    if (!job) {
        return (React.createElement("div", { className: "container mx-auto p-3 sm:p-4" },
            React.createElement(header_1["default"], { title: "Job Details", showBackButton: true, onBackClick: function () { return setLocation("/dashboard"); } }),
            React.createElement("div", { className: "bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base mt-2 sm:mt-4" }, "Job not found")));
    }
    return (React.createElement("div", { className: "container mx-auto p-3 sm:p-4" },
        React.createElement(header_1["default"], { title: "Job Details", showBackButton: true, backText: "Back to Dashboard", onBackClick: function () { return setLocation("/dashboard"); }, franchiseeName: user === null || user === void 0 ? void 0 : user.franchiseeName }),
        React.createElement(tabs_1.Tabs, { defaultValue: "details", className: "w-full mt-2 sm:mt-4" },
            React.createElement(tabs_1.TabsList, { className: "mb-3 sm:mb-4 w-full sm:w-auto" },
                React.createElement(tabs_1.TabsTrigger, { value: "details", className: "flex-1 sm:flex-none" }, "Job Details"),
                React.createElement(tabs_1.TabsTrigger, { value: "applications", className: "flex-1 sm:flex-none" },
                    "Applications",
                    " ",
                    applications && applications.length > 0 && (React.createElement("span", { className: "ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs" }, applications.length)))),
            React.createElement(tabs_1.TabsContent, { value: "details" },
                React.createElement(card_1.Card, null,
                    "// In the CardHeader section where the Edit button is",
                    React.createElement(card_1.CardHeader, { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pb-4 sm:pb-6" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, { className: "text-xl sm:text-2xl" }, job.title),
                            React.createElement(card_1.CardDescription, { className: "mt-1" },
                                job.location,
                                " \u2022 ",
                                formatJobType(job.jobType || "full_time"))),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", className: "flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start", onClick: function () { return setLocation("/edit-job/" + job.id); } },
                                React.createElement(lucide_react_1.Edit, { size: 16 }),
                                " Edit Job"),
                            job.status !== "archived" && (React.createElement(button_1.Button, { variant: "outline", className: "flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start text-gray-600 hover:text-gray-900", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                    var error_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!confirm("Are you sure you want to archive the job \"" + job.title + "\"? It will no longer be visible to applicants.")) return [3 /*break*/, 4];
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, queryClient_1.apiRequest("PATCH", "/api/jobs/" + job.id, { status: "archived" })];
                                            case 2:
                                                _a.sent();
                                                toast({
                                                    title: "Job Archived",
                                                    description: "The job has been archived successfully"
                                                });
                                                queryClient_1.queryClient.invalidateQueries({ queryKey: ["/api/jobs", job.id] });
                                                return [3 /*break*/, 4];
                                            case 3:
                                                error_3 = _a.sent();
                                                toast({
                                                    title: "Archive failed",
                                                    description: error_3.message,
                                                    variant: "destructive"
                                                });
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); } },
                                React.createElement(lucide_react_1.Archive, { size: 16 }),
                                " Archive Job")))),
                    React.createElement(card_1.CardContent, { className: "px-4 sm:px-6" },
                        React.createElement("div", { className: "space-y-4 sm:space-y-6" },
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-base sm:text-lg font-semibold" }, "Job Description"),
                                React.createElement("p", { className: "mt-2 whitespace-pre-wrap text-sm sm:text-base" }, job.description)),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-base sm:text-lg font-semibold" }, "Details"),
                                React.createElement("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" },
                                    React.createElement("div", { className: "bg-muted/30 p-2 sm:p-3 rounded-md" },
                                        React.createElement("h4", { className: "text-xs sm:text-sm font-medium text-muted-foreground" }, "Location"),
                                        React.createElement("p", { className: "text-sm sm:text-base" }, job.location)),
                                    React.createElement("div", { className: "bg-muted/30 p-2 sm:p-3 rounded-md" },
                                        React.createElement("h4", { className: "text-xs sm:text-sm font-medium text-muted-foreground" }, "Job Type"),
                                        React.createElement("p", { className: "text-sm sm:text-base" }, formatJobType(job.jobType || "full_time"))),
                                    React.createElement("div", { className: "bg-muted/30 p-2 sm:p-3 rounded-md" },
                                        React.createElement("h4", { className: "text-xs sm:text-sm font-medium text-muted-foreground" }, "Salary Range"),
                                        React.createElement("p", { className: "text-sm sm:text-base" }, job.payRange || "Not specified")),
                                    React.createElement("div", { className: "bg-muted/30 p-2 sm:p-3 rounded-md" },
                                        React.createElement("h4", { className: "text-xs sm:text-sm font-medium text-muted-foreground" }, "Date Posted"),
                                        React.createElement("p", { className: "text-sm sm:text-base" }, new Date(job.createdAt || Date.now()).toLocaleDateString())))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-base sm:text-lg font-semibold" }, "Requirements"),
                                React.createElement("p", { className: "mt-2 whitespace-pre-wrap text-sm sm:text-base" }, job.requirements || "No specific requirements listed.")))))),
            React.createElement(tabs_1.TabsContent, { value: "applications" },
                React.createElement("div", { className: "space-y-3 sm:space-y-4" },
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("h2", { className: "text-lg sm:text-xl font-semibold" },
                            "Applications for ",
                            job.title)),
                    applicationsLoading ? (React.createElement("div", { className: "flex justify-center items-center h-40 sm:h-64" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" }),
                        React.createElement("span", { className: "ml-2 text-sm sm:text-base" }, "Loading applications..."))) : applicationsError ? (React.createElement("div", { className: "bg-destructive/10 p-3 sm:p-4 rounded-md text-destructive text-sm sm:text-base" },
                        "Error loading applications: ",
                        applicationsError.message)) : applications && applications.length > 0 ? (React.createElement("div", { className: "space-y-3 sm:space-y-4" }, applications.map(function (application) { return (React.createElement(application_card_1["default"], { key: application.id, application: __assign(__assign({}, application), { jobTitle: job.title, jobLocation: job.location }), jobTitle: job.title, onStatusChange: function (newStatus) {
                            return handleStatusChange(application.id, newStatus);
                        } })); }))) : (React.createElement("div", { className: "bg-muted/50 p-5 sm:p-8 rounded-md text-center" },
                        React.createElement("p", { className: "text-sm sm:text-base text-muted-foreground" }, "No applications have been submitted for this job yet."))))))));
}
exports["default"] = JobDetails;
