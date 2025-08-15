import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // tune these to your app
      staleTime: 5 * 60 * 1000, // 5m: data considered fresh
      gcTime: 30 * 60 * 1000, // 30m: cache garbage collect time
      refetchOnWindowFocus: false, // avoid surprise refetches
      retry: 2, // light retry policy
    },
    mutations: {
      retry: 1,
    },
  },
});
