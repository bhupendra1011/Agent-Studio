"use client";

import { axiosStudio } from "@/lib/api/clients";
import type { Template } from "@/lib/types/entities";
import type { TemplateListParams } from "@/lib/types/api";
import { useStudioGate } from "@/hooks/use-studio-gate";
import { useQuery } from "@tanstack/react-query";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (params: TemplateListParams) =>
    [...templateKeys.lists(), params] as const,
};

async function fetchTemplates(
  params: TemplateListParams
): Promise<{ templates: Template[]; total: number }> {
  const searchParamsObj = new URLSearchParams();
  if (params.page) searchParamsObj.append("page", params.page.toString());
  if (params.page_size)
    searchParamsObj.append("page_size", params.page_size.toString());
  if (params.keyword) searchParamsObj.append("keyword", params.keyword);
  if (params.type) searchParamsObj.append("type", params.type);

  const queryString = searchParamsObj.toString();
  const url = `/agent-templates${queryString ? `?${queryString}` : ""}`;

  const response = await axiosStudio.get(url);
  const data = response.data;

  const templates = (data.list || []).map(
    (apiTemplate: {
      id: string;
      name: string;
      type: string;
      description: string;
      icon_url: string;
      creator: string;
      creator_avatar_url: string;
      graph_data: import("@/lib/types/api").GraphData;
      create_time: string;
    }) =>
      ({
        id: apiTemplate.id,
        name: apiTemplate.name,
        category: "Templates",
        description: apiTemplate.description,
        icon: "template",
        color: "bg-[var(--studio-teal)]",
        author: apiTemplate.creator,
        userCount: 0,
        createdByLogo: apiTemplate.creator_avatar_url,
        createdByMainImage: apiTemplate.creator_avatar_url,
        type: apiTemplate.type === "convoai" ? "conversational" : "voice",
        coreFeatures: [],
        defaultConfig: {
          model: "gpt-4o",
          maxTokens: 800,
          temperature: 0.6,
        },
        agents: [],
        graph_data: apiTemplate.graph_data,
      }) satisfies Template
  );

  return { templates, total: data.total ?? templates.length };
}

export function useTemplates(
  params: TemplateListParams = { page_size: 50 },
  options?: { enabled?: boolean }
) {
  const { ready: gateReady } = useStudioGate();
  const enabled = (options?.enabled ?? true) && gateReady;

  const query = useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => fetchTemplates(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    templates: query.data?.templates ?? [],
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load templates"
      : null,
    total: query.data?.total ?? 0,
    refetch: query.refetch,
  };
}
