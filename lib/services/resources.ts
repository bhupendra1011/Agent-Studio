import { axiosStudio } from "@/lib/api/clients";
import type {
  CreateStudioResourceRequest,
  StudioResource,
  StudioResourceListParams,
  StudioResourceListPayload,
  UpdateStudioResourceRequest,
} from "@/lib/types/api";
import { unwrapStudioData } from "@/lib/utils/studio-response";

function normalizeListPayload(raw: unknown): StudioResourceListPayload {
  const data = unwrapStudioData<StudioResourceListPayload | undefined>(raw);
  if (data && Array.isArray(data.list)) {
    return {
      total: data.total ?? 0,
      list: data.list,
    };
  }
  const flat = raw as StudioResourceListPayload | undefined;
  if (flat && Array.isArray(flat.list)) {
    return { total: flat.total ?? 0, list: flat.list };
  }
  return { total: 0, list: [] };
}

export async function fetchResourceList(
  params: StudioResourceListParams = {}
): Promise<StudioResourceListPayload & { page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set("source", params.source ?? "user_upload");
  if (params.type) searchParams.set("type", params.type);
  if (params.vendor) searchParams.set("vendor", params.vendor);
  if (params.keyword) searchParams.set("keyword", params.keyword);
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(page_size));
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.category) searchParams.set("category", params.category);

  const res = await axiosStudio.get(
    `/resources?${searchParams.toString()}`
  );
  const payload = normalizeListPayload(res.data);
  return {
    ...payload,
    page,
    page_size,
  };
}

export async function createResource(
  body: CreateStudioResourceRequest
): Promise<StudioResource> {
  const res = await axiosStudio.post("/resources", body);
  return unwrapStudioData<StudioResource>(res.data);
}

export async function updateResource(
  resourceId: string | number,
  body: UpdateStudioResourceRequest
): Promise<StudioResource> {
  const res = await axiosStudio.put(`/resources/${resourceId}`, body);
  return unwrapStudioData<StudioResource>(res.data);
}

export async function deleteResource(resourceId: string | number): Promise<void> {
  await axiosStudio.delete(`/resources/${resourceId}`);
}
