"use client";

import { useAgentPipelines } from "@/hooks/use-agent-pipelines";
import { updateDeployedAgentStatus } from "@/lib/services/deployed-agent";
import type { LocalAgentPipeline } from "@/lib/types";
import {
  getPipelineStatus,
  hasPipelineDeployments,
} from "@/lib/utils/pipeline-status";
import {
  invalidateAndPrefetchPipelineLists,
  invalidateDeployedAgentsQueries,
} from "@/lib/utils/query-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export interface MergedAgent {
  id: string;
  name: string;
  type: string;
  description: string;
  icon_url: string;
  creator: string;
  create_time: string;
  update_time: string;
  last_deployed_time?: string;
  status: "draft" | "live" | "paused";
  agent_id?: string;
  project_name?: string;
  project_id?: string;
  app_id?: string;
  deploy_uuid?: string;
  deploy_vid?: number;
  pipeline_id: string;
  pipeline_uuid?: string;
  deploy_app_ids?: string[];
  deploy_uuids?: string[];
  source: "pipeline";
  deploy_status?: number;
}

interface UseAgentsResult {
  agents: MergedAgent[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  search: (keyword: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  deleteAgent: (id: string) => Promise<void>;
  renameAgent: (id: string, name: string) => Promise<void>;
  duplicateAgent: (agent: MergedAgent) => Promise<void>;
  toggleAgentStatus: (agent: MergedAgent) => Promise<void>;
}

export interface UseAgentsOptions {
  onParamsChange?: (next: {
    keyword?: string;
    page?: number;
    page_size?: number;
  }) => void;
}

export function useAgents(
  initialParams: {
    page?: number;
    page_size?: number;
    keyword?: string;
  } = {},
  options?: UseAgentsOptions
): UseAgentsResult {
  const queryClient = useQueryClient();
  const isControlled = Boolean(options?.onParamsChange);
  const [pageSize, setPageSize] = useState(initialParams.page_size ?? 10);

  const pipelineParams = isControlled
    ? {
        page: initialParams.page ?? 1,
        page_size: initialParams.page_size ?? 10,
        ...(initialParams.keyword && { keyword: initialParams.keyword }),
      }
    : { page_size: pageSize };

  const {
    pipelines,
    total,
    loading,
    isFetching,
    error,
    refetch: refetchPipelines,
    search: searchPipelines,
    deletePipeline,
    updateAgentPipelineName,
    duplicatePipeline,
    setPage: setPipelinesPage,
    setPageSize: setPipelinesPageSize,
    currentPage,
    pageSize: pipelinePageSize,
  } = useAgentPipelines(pipelineParams, {
    onParamsChange: isControlled ? options?.onParamsChange : undefined,
  });

  const agents = useMemo(() => {
    type Deployment = {
      id: string;
      appId: string;
      appName: string;
      project_id?: string | number;
      uuid?: string;
      vid?: number;
      status?: number;
    };

    const expandedAgents: MergedAgent[] = pipelines.flatMap(
      (
        pipeline: LocalAgentPipeline & { deployments?: Deployment[] }
      ): MergedAgent[] => {
        const deployments =
          (pipeline as LocalAgentPipeline & { deployments?: Deployment[] })
            .deployments || [];
        const deployAppIds = pipeline.deploy_app_ids || [];
        const deployUuids = pipeline.deploy_uuids || [];
        const deployVids = pipeline.deploy_vids || [];

        const hasDeps = hasPipelineDeployments({
          deployments,
          deploy_app_ids: deployAppIds,
        });

        if (!hasDeps) {
          return [
            {
              id: String(pipeline.id),
              name: pipeline.name,
              type: pipeline.type,
              description: pipeline.description,
              icon_url: pipeline.icon_url,
              creator: pipeline.creator,
              create_time: pipeline.create_time,
              update_time: pipeline.update_time,
              last_deployed_time: pipeline.last_deployed_time,
              status: "draft",
              pipeline_id: String(pipeline.id),
              pipeline_uuid: pipeline.id,
              deploy_app_ids: [],
              deploy_uuids: [],
              source: "pipeline",
              deploy_status: pipeline.deploy_status,
              agent_id: undefined,
              project_name: undefined,
              project_id: undefined,
              app_id: undefined,
              deploy_uuid: undefined,
              deploy_vid: undefined,
            },
          ];
        }

        if (deployments.length > 0) {
          return deployments.map((deployment: Deployment) => {
            const deploymentStatus =
              deployment.status !== undefined
                ? deployment.status
                : pipeline.deploy_status;
            const status: "draft" | "live" | "paused" =
              deploymentStatus === 0 ? "paused" : "live";

            return {
              id: `${pipeline.id}__${deployment.id}`,
              name: pipeline.name,
              type: pipeline.type,
              description: pipeline.description,
              icon_url: pipeline.icon_url,
              creator: pipeline.creator,
              create_time: pipeline.create_time,
              update_time: pipeline.update_time,
              last_deployed_time: pipeline.last_deployed_time,
              status,
              pipeline_id: String(pipeline.id),
              pipeline_uuid: pipeline.id,
              deploy_app_ids: deployAppIds,
              deploy_uuids: deployUuids,
              source: "pipeline",
              deploy_status: pipeline.deploy_status,
              agent_id: deployment.id,
              app_id: deployment.appId || deployment.id,
              project_name: deployment.appName || undefined,
              project_id: deployment.project_id?.toString(),
              deploy_uuid: deployment.uuid,
              deploy_vid: deployment.vid,
            };
          });
        }

        return deployAppIds.map((appId, index) => {
          const status = getPipelineStatus({
            deploy_app_ids: deployAppIds,
            deploy_status: pipeline.deploy_status,
          });

          return {
            id: `${pipeline.id}__${appId}`,
            name: pipeline.name,
            type: pipeline.type,
            description: pipeline.description,
            icon_url: pipeline.icon_url,
            creator: pipeline.creator,
            create_time: pipeline.create_time,
            update_time: pipeline.update_time,
            last_deployed_time: pipeline.last_deployed_time,
            status,
            pipeline_id: String(pipeline.id),
            pipeline_uuid: pipeline.id,
            deploy_app_ids: deployAppIds,
            deploy_uuids: deployUuids,
            source: "pipeline",
            deploy_status: pipeline.deploy_status,
            app_id: appId,
            project_name: undefined,
            project_id: undefined,
            deploy_uuid: deployUuids[index],
            deploy_vid: deployVids[index],
            agent_id: undefined,
          };
        });
      }
    );

    return expandedAgents;
  }, [pipelines]);

  const effectivePageSize = isControlled ? pipelinePageSize : pageSize;
  const totalPages = Math.ceil(total / effectivePageSize);

  const refetch = useCallback(async () => {
    await refetchPipelines();
  }, [refetchPipelines]);

  const search = useCallback(
    async (keyword: string) => {
      await searchPipelines(keyword);
    },
    [searchPipelines]
  );

  const handleSetPage = useCallback(
    (page: number) => {
      setPipelinesPage(page);
    },
    [setPipelinesPage]
  );

  const handleSetPageSize = useCallback(
    (size: number) => {
      if (!isControlled) setPageSize(size);
      setPipelinesPageSize(size);
    },
    [isControlled, setPipelinesPageSize]
  );

  const deleteAgent = useCallback(
    async (id: string) => {
      await deletePipeline(id);
    },
    [deletePipeline]
  );

  const renameAgent = useCallback(
    async (id: string, name: string) => {
      await updateAgentPipelineName(parseInt(id, 10), name);
    },
    [updateAgentPipelineName]
  );

  const duplicateAgent = useCallback(
    async (agent: MergedAgent) => {
      const pipeline = pipelines.find(
        (p: LocalAgentPipeline) => String(p.id) === agent.pipeline_id
      );
      if (pipeline) {
        await duplicatePipeline(pipeline);
      }
    },
    [pipelines, duplicatePipeline]
  );

  const toggleAgentStatusMutation = useMutation({
    mutationFn: ({
      projectId,
      deployId,
      status,
    }: {
      projectId: string;
      deployId: string;
      status: number;
    }) => updateDeployedAgentStatus(projectId, deployId, status),
    onSuccess: () => {
      invalidateDeployedAgentsQueries(queryClient);
      invalidateAndPrefetchPipelineLists(queryClient);
    },
  });

  const toggleAgentStatus = useCallback(
    async (agent: MergedAgent) => {
      if (!agent.project_id || !agent.agent_id) {
        throw new Error("Missing project_id or agent_id for pause/resume");
      }

      const currentStatus = agent.status === "live" ? 1 : 0;
      const nextStatus = currentStatus === 1 ? 0 : 1;

      await toggleAgentStatusMutation.mutateAsync({
        projectId: agent.project_id,
        deployId: agent.agent_id,
        status: nextStatus,
      });
    },
    [toggleAgentStatusMutation]
  );

  return {
    agents,
    loading,
    isFetching,
    error: error || null,
    total,
    refetch,
    search,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    currentPage,
    totalPages,
    pageSize: effectivePageSize,
    deleteAgent,
    renameAgent,
    duplicateAgent,
    toggleAgentStatus,
  };
}
