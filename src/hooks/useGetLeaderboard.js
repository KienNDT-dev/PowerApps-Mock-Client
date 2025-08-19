import authAxios from "@/lib/authAxios";
import { useQuery } from "@tanstack/react-query";

export function useGetLeaderboard(bidPackageId, options = {}) {
  return useQuery({
    queryKey: ["leaderboard", bidPackageId],
    queryFn: async () => {
      if (!bidPackageId) {
        throw new Error("Bid package ID is required");
      }
      const response = await authAxios.get(`/bid/bid-packages/${bidPackageId}/leaderboard`);
      return response.data;
    },
    enabled: !!bidPackageId,
    refetchInterval: 30000,
    staleTime: 10000,
    ...options,
  });
}
