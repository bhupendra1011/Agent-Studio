"use client";

import { getProjectList } from "@/lib/services/project";
import type { ProjectListParams } from "@/lib/types/api";
import { useStudioGate } from "@/hooks/use-studio-gate";
import { useQuery } from "@tanstack/react-query";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params: ProjectListParams) =>
    [...projectKeys.all, "list", params] as const,
};

export function useProjects(params: ProjectListParams = { fetchAll: true }) {
  const { ready: gateReady } = useStudioGate();

  const query = useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => getProjectList(params),
    enabled: gateReady,
    staleTime: 2 * 60 * 1000,
  });

  return {
    projects: query.data?.items ?? [],
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load projects"
      : null,
    total: query.data?.total ?? 0,
    refetch: query.refetch,
  };
}
