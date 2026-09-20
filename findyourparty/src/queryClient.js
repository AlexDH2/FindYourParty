// src/queryClient.js
import { QueryClient } from "@tanstack/react-query";
import { PUBLIC_EVENTS_CACHE_VERSION } from "./constants/cache";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 min
      gcTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      cacheTime: 30 * 60 * 1000, // 30 min TTL for public events cache
    },
  },
});
