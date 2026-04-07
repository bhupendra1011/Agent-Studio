import { getPipelines } from "@/lib/data/pipelines";
import { agentKeys, campaignKeys, pipelineKeys } from "@/lib/query-keys";
import type { AgentPipelineListParams } from "@/lib/types/api";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

type QueryKeysFactory<TParams extends object = Record<string, unknown>> = {
  all: readonly unknown[];
  list: (params: TParams) => QueryKey;
};

export function invalidateDeployedAgentsQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: agentKeys.all });
}

export function invalidateCampaignQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: campaignKeys.all });
}

function invalidateAndPrefetchMultiple<TParams extends object>(
  queryClient: QueryClient,
  queryKeys: QueryKeysFactory<TParams>,
  fetchFn: (params: TParams) => Promise<unknown>,
  paramsList: TParams[]
): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.all });
  for (const params of paramsList) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.list(params),
      queryFn: () => fetchFn(params),
    });
  }
}

export function invalidateAndPrefetchPipelineLists(
  queryClient: QueryClient,
  paramsList: AgentPipelineListParams[] = [{ page: 1, page_size: 10 }]
): void {
  invalidateAndPrefetchMultiple(
    queryClient,
    pipelineKeys,
    getPipelines,
    paramsList
  );
}

export function invalidateAndPrefetchList<TParams extends object>(
  queryClient: QueryClient,
  queryKeys: QueryKeysFactory<TParams>,
  fetchFn: (params: TParams) => Promise<unknown>,
  listParams?: TParams
): void {
  const defaultParams = { page: 1, page_size: 10 } as unknown as TParams;
  const params = listParams ?? defaultParams;
  queryClient.invalidateQueries({ queryKey: queryKeys.all });
  queryClient.prefetchQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => fetchFn(params),
  });
}
