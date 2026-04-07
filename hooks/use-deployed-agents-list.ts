"use client";

import { getDeployedAgentList } from "@/lib/services/deployed-agent";
import { agentKeys } from "@/lib/query-keys";
import type { DeployedAgent, DeployedAgentListParams } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export function useDeployedAgentsList(initial: DeployedAgentListParams = {}) {
  const [params, setParams] = useState<DeployedAgentListParams>({
    page: 1,
    page_size: 50,
    ...initial,
  });

  const key = useMemo(() => agentKeys.list(params), [params]);

  const query = useQuery({
    queryKey: key,
    queryFn: () => getDeployedAgentList(params),
    staleTime: 60 * 1000,
  });

  return {
    agents: (query.data?.list ?? []) as DeployedAgent[],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    params,
    setParams,
    refetch: query.refetch,
  };
}
