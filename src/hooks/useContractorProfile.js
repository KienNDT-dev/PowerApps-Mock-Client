import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";

export function useContractorProfile() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["contractorProfile"],
    queryFn: async () => {
      const data = await api.get("/contractor-auth/me");
      return data?.contractor;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!accessToken,
  });
}
