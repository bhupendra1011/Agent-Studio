"use client";

import {
  createCampaign,
  deleteCampaign,
  interruptCampaign,
  updateCampaign,
  uploadRecipientsCSV,
} from "@/lib/services/campaign";
import { invalidateCampaignQueries } from "@/lib/utils/query-cache";
import type { CreateCampaignRequest, UpdateCampaignRequest } from "@/lib/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCampaignRequest) => {
      const res = await createCampaign(body);
      if (res.code !== 0) throw new Error(res.message || "Create failed");
      return res;
    },
    onSuccess: () => invalidateCampaignQueries(qc),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      data,
    }: {
      campaignId: string;
      data: UpdateCampaignRequest;
    }) => {
      const res = await updateCampaign(campaignId, data);
      if (res.code !== 0) throw new Error(res.message || "Update failed");
      return res;
    },
    onSuccess: () => invalidateCampaignQueries(qc),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCampaign(id);
      if (res.code !== 0) throw new Error(res.message || "Delete failed");
      return res;
    },
    onSuccess: () => invalidateCampaignQueries(qc),
  });
}

export function useInterruptCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await interruptCampaign(id);
      if (res.code !== 0) throw new Error(res.message || "Interrupt failed");
      return res;
    },
    onSuccess: () => invalidateCampaignQueries(qc),
  });
}

export function useUploadRecipientsCSV() {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await uploadRecipientsCSV(file);
      if (res.code !== 0) throw new Error(res.message || "Upload failed");
      return res;
    },
  });
}
