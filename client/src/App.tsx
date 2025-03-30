import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ApplicantPortal from "@/pages/applicant-portal";
import ApplicationForm from "@/pages/application-form";
import FranchiseeDashboard from "@/pages/franchisee-dashboard";
import JobDetails from "@/pages/job-details";
import EditJobPage from "@/pages/edit-job";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/applicant" component={ApplicantPortal} />
      <Route path="/apply/:id" component={ApplicationForm} />
      <ProtectedRoute path="/dashboard" component={FranchiseeDashboard} />
      <ProtectedRoute path="/job/:id" component={JobDetails} />
      <ProtectedRoute path="/edit-job/:id" component={EditJobPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
