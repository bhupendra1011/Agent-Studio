import { axiosStudio } from "@/lib/api/clients";
import type {
  CampaignCallHistoryExportParams,
  CampaignCallHistoryExportResponse,
  CampaignCallHistoryParams,
  CampaignCallHistoryResponse,
  CampaignDetailsResponse,
  CampaignListParams,
  CampaignListResponse,
  CampaignRedialExportParams,
  CampaignRedialExportResponse,
  CampaignSummaryExportResponse,
  CampaignSummaryResponse,
  CampaignTemplateExportResponse,
  CreateCampaignRequest,
  CreateCampaignResponse,
  DeleteCampaignResponse,
  InterruptCampaignResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse,
  UploadRecipientsResponse,
} from "@/lib/types/api";

export async function getCampaignList(
  params: CampaignListParams = {}
): Promise<CampaignListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", String(params.page));
  if (params.page_size) searchParams.append("page_size", String(params.page_size));
  if (params.search_keyword)
    searchParams.append("search_keyword", params.search_keyword);
  if (params.search_fields) searchParams.append("search_fields", params.search_fields);
  if (params.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params.sort_order) searchParams.append("sort_order", params.sort_order);
  if (params.campaign_ids?.length)
    searchParams.append("campaign_ids", params.campaign_ids.join(","));
  if (params.agent_uuids?.length)
    searchParams.append("agent_uuids", params.agent_uuids.join(","));
  if (params.phone_number_ids?.length)
    searchParams.append("phone_number_ids", params.phone_number_ids.join(","));
  if (params.status) searchParams.append("status", params.status);

  const qs = searchParams.toString();
  const url = `/campaigns${qs ? `?${qs}` : ""}`;
  const response = await axiosStudio.get<CampaignListResponse>(url);
  return response.data;
}

export async function uploadRecipientsCSV(file: File): Promise<UploadRecipientsResponse> {
  const normalizedFile = new File([file], file.name, {
    type: "text/csv",
    lastModified: file.lastModified,
  });
  const formData = new FormData();
  formData.append("file", normalizedFile);
  const response = await axiosStudio.post<UploadRecipientsResponse>(
    "/campaigns/recipients/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function createCampaign(
  data: CreateCampaignRequest
): Promise<CreateCampaignResponse> {
  const response = await axiosStudio.post<CreateCampaignResponse>("/campaigns", data);
  return response.data;
}

export async function deleteCampaign(campaignId: string): Promise<DeleteCampaignResponse> {
  const response = await axiosStudio.delete<DeleteCampaignResponse>(
    `/campaigns/${campaignId}`
  );
  return response.data;
}

export async function getCampaignDetails(
  campaignId: string
): Promise<CampaignDetailsResponse> {
  const response = await axiosStudio.get<CampaignDetailsResponse>(
    `/campaigns/${campaignId}`
  );
  return response.data;
}

export async function getCampaignSummary(
  campaignId: string
): Promise<CampaignSummaryResponse> {
  const response = await axiosStudio.get<CampaignSummaryResponse>(
    `/campaigns/${campaignId}/summary`
  );
  return response.data;
}

export async function updateCampaign(
  campaignId: string,
  data: UpdateCampaignRequest
): Promise<UpdateCampaignResponse> {
  const response = await axiosStudio.put<UpdateCampaignResponse>(
    `/campaigns/${campaignId}`,
    data
  );
  return response.data;
}

export async function getCampaignCallHistory(
  params: CampaignCallHistoryParams
): Promise<CampaignCallHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.append("type", params.type);
  if (params.from_time !== undefined)
    searchParams.append("from_time", String(params.from_time));
  if (params.to_time !== undefined) searchParams.append("to_time", String(params.to_time));
  if (params.reason) searchParams.append("reason", params.reason);
  if (params.answered !== undefined)
    searchParams.append("answered", String(params.answered));
  if (params.call_category) searchParams.append("call_category", params.call_category);
  if (params.search_keyword) searchParams.append("search_keyword", params.search_keyword);
  if (params.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params.sort_order) searchParams.append("sort_order", params.sort_order);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.page_size) searchParams.append("page_size", String(params.page_size));
  if (params.cursor) searchParams.append("cursor", params.cursor);

  const qs = searchParams.toString();
  const url = `/campaigns/${params.campaign_id}/call-history${qs ? `?${qs}` : ""}`;
  const response = await axiosStudio.get<CampaignCallHistoryResponse>(url);
  const data = response.data;
  if (data.code !== undefined) return data;
  const legacy = data as unknown as {
    data?: { list?: CampaignCallHistoryResponse["data"]["list"]; count?: number };
    meta?: { total?: number };
    status?: string;
  };
  return {
    code: 0,
    message: "success",
    data: {
      page: 1,
      page_size: legacy.data?.list?.length || 10,
      count: legacy.data?.list?.length || 0,
      total: legacy.meta?.total ?? legacy.data?.count ?? 0,
      list: legacy.data?.list ?? [],
    },
    status: legacy.status || "ok",
    meta: legacy.meta,
  };
}

export async function interruptCampaign(
  campaignId: string
): Promise<InterruptCampaignResponse> {
  const response = await axiosStudio.post<InterruptCampaignResponse>(
    `/campaigns/${campaignId}/interrupt`
  );
  return response.data;
}

export async function downloadCampaignTemplate(): Promise<CampaignTemplateExportResponse> {
  const response = await axiosStudio.get<CampaignTemplateExportResponse>(
    "/campaigns/template/export"
  );
  return response.data;
}

export async function downloadCampaignSummaryExport(
  campaignId: string
): Promise<CampaignSummaryExportResponse> {
  const response = await axiosStudio.get<CampaignSummaryExportResponse>(
    `/campaigns/${campaignId}/summary/export`
  );
  return response.data;
}

export async function downloadCampaignCallHistoryExport(
  campaignId: string,
  params: CampaignCallHistoryExportParams = {}
): Promise<CampaignCallHistoryExportResponse> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.append("page", String(params.page));
  if (params.page_size !== undefined)
    searchParams.append("page_size", String(params.page_size));
  if (params.call_category?.length)
    searchParams.set("call_category", params.call_category.join(","));
  if (params.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params.sort_order) searchParams.append("sort_order", params.sort_order);
  if (params.search_keyword) searchParams.append("search_keyword", params.search_keyword);

  const qs = searchParams.toString();
  const url = `/campaigns/${campaignId}/call-history/export${qs ? `?${qs}` : ""}`;
  const response = await axiosStudio.get<CampaignCallHistoryExportResponse>(url);
  return response.data;
}

export async function downloadCampaignRedialExport(
  campaignId: string,
  params: CampaignRedialExportParams
): Promise<CampaignRedialExportResponse> {
  const searchParams = new URLSearchParams();
  if (params.call_category?.length)
    searchParams.set("call_category", params.call_category.join(","));
  const qs = searchParams.toString();
  const url = `/campaigns/${campaignId}/redial/export${qs ? `?${qs}` : ""}`;
  const response = await axiosStudio.get<CampaignRedialExportResponse>(url);
  return response.data;
}
