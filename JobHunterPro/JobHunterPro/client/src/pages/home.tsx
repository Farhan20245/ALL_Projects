import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import JobSeekerDashboard from "./job-seeker-dashboard";
import EmployerDashboard from "./employer-dashboard";
import AdminDashboard from "./admin-dashboard";
import Landing from "./landing";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to role-specific dashboard
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  // Show role-specific dashboard
  switch (user.role) {
    case 'jobseeker':
      return <JobSeekerDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Landing />;
  }
}
