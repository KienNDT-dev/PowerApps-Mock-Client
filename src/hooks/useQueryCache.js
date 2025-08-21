import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useQueryCache(queryKey, selector = (data) => data) {
  const queryClient = useQueryClient();
  const [data, setData] = useState(() => {
    const cached = queryClient.getQueryData(queryKey);
    return selector(cached);
  });

  useEffect(() => {
    const updateData = () => {
      const cached = queryClient.getQueryData(queryKey);
      const selected = selector(cached);
      setData(selected);
    };

    updateData();

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        JSON.stringify(event.query.queryKey) === JSON.stringify(queryKey)
      ) {
        updateData();
      }
    });

    return unsubscribe;
  }, [queryClient, JSON.stringify(queryKey), selector]);

  return data;
}
