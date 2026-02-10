import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useRecalls() {
  return useQuery({
    queryKey: [api.recalls.list.path],
    queryFn: async () => {
      const res = await fetch(api.recalls.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recalls");
      return api.recalls.list.responses[200].parse(await res.json());
    },
  });
}
