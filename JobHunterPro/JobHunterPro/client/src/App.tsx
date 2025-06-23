import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import JobSeekerDashboard from "@/pages/job-seeker-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import JobDetail from "@/pages/job-detail";
import CompanyProfile from "@/pages/company-profile";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/jobs/:id" component={JobDetail} />
          <Route path="/companies/:id" component={CompanyProfile} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={() => {
            if (user?.role === 'jobseeker') return <JobSeekerDashboard />;
            if (user?.role === 'employer') return <EmployerDashboard />;
            if (user?.role === 'admin') return <AdminDashboard />;
            return <Home />;
          }} />
          <Route path="/jobs/:id" component={JobDetail} />
          <Route path="/companies/:id" component={CompanyProfile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
