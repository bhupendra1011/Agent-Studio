export interface PipelineStatusInput {
  deployments?: Array<{ status?: number }>;
  deploy_app_ids?: string[];
  deploy_status?: number;
}

export function getPipelineStatus(pipeline: PipelineStatusInput): "live" | "paused" {
  const deployments = pipeline.deployments ?? [];
  const deployAppIds = pipeline.deploy_app_ids ?? [];

  if (deployments.length > 0) {
    const hasPaused = deployments.some((d) => d.status === 0);
    return hasPaused ? "paused" : "live";
  }

  if (deployAppIds.length > 0) {
    return pipeline.deploy_status === 0 ? "paused" : "live";
  }

  return pipeline.deploy_status === 0 ? "paused" : "live";
}

export function hasPipelineDeployments(pipeline: {
  deployments?: unknown[];
  deploy_app_ids?: string[];
}): boolean {
  const deployments = pipeline.deployments ?? [];
  const deployAppIds = pipeline.deploy_app_ids ?? [];
  return deployments.length > 0 || deployAppIds.length > 0;
}
