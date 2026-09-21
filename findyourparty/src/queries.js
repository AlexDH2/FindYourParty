import { useQuery } from "@tanstack/react-query";
import { supabase } from "./lib/supabase";
import { cacheService } from "./services/cacheService";
import { PUBLIC_EVENTS_CACHE_VERSION } from "./constants/cache";

const PAGE_SIZE = 12;

export async function fetchPublicEvents(page = 1) {
  if (page === 1) {
    const cached = cacheService.get();
    if (cached) return cached;
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, date, location, image, banner_position, banner_zoom, price, prices_json, publication_status, whatsapp, promo_active, promo_image_url, promo_expires_at"
    )
    .eq("publication_status", "published")
    .order("date", { ascending: true })
    .range(from, to);

  if (error) throw error;

  if (page === 1 && data) {
    cacheService.set(data);
  }

  return data ?? [];
}

export function usePublicEvents(page = 1) {
  return useQuery({
    queryKey: ["public-events", PUBLIC_EVENTS_CACHE_VERSION, page],
    queryFn: () => fetchPublicEvents(page),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

export function usePublicEvent(slugOrId) {
  return useQuery({
    queryKey: ["public-event", PUBLIC_EVENTS_CACHE_VERSION, slugOrId],
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      let query = supabase.from("events").select("*").eq("publication_status", "published");
      
      if (isUuid) {
        query = query.eq("id", slugOrId);
      } else {
        query = query.eq("slug", slugOrId);
      }
      
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
