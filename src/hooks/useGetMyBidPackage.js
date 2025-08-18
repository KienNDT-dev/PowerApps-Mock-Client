import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";

export function useGetMyBidPackage(options = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["myBidPackage"],
    queryFn: async () => {
      const data = await api.get("/bid/my-bid-package");
      return data.bidPackage;
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}
