import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  // If we get a 401, consider the user as not authenticated (not loading)
  const isActuallyLoading = isLoading && !error;

  return {
    user,
    isLoading: isActuallyLoading,
    isAuthenticated: !!user,
  };
}
