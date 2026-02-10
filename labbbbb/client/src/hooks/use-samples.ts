import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSample } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSamples() {
  return useQuery({
    queryKey: [api.samples.list.path],
    queryFn: async () => {
      const res = await fetch(api.samples.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch samples");
      return api.samples.list.responses[200].parse(await res.json());
    },
  });
}

export function useSample(id: number) {
  return useQuery({
    queryKey: [api.samples.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.samples.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sample");
      return api.samples.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSample() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSample) => {
      const res = await fetch(api.samples.create.path, {
        method: api.samples.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create sample");
      }
      return api.samples.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.samples.list.path] });
      toast({ title: "Success", description: "Sample created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateSample() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertSample>) => {
      const url = buildUrl(api.samples.update.path, { id });
      const res = await fetch(url, {
        method: api.samples.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update sample");
      }
      return api.samples.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.samples.list.path] });
      toast({ title: "Success", description: "Sample updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
