import { axiosStudio } from "@/lib/api/clients";
import type {
  CreateMcpRequest,
  McpListParams,
  McpListPayload,
  McpServer,
  UpdateMcpRequest,
} from "@/lib/types/api";
import { unwrapStudioData } from "@/lib/utils/studio-response";

function normalizeList(raw: unknown): McpListPayload {
  const data = unwrapStudioData<McpListPayload | undefined>(raw);
  if (data && Array.isArray(data.list)) {
    return {
      list: data.list,
      total: data.total ?? 0,
      page: data.page,
      page_size: data.page_size,
    };
  }
  const flat = raw as McpListPayload | undefined;
  if (flat && Array.isArray(flat.list)) {
    return flat;
  }
  return { list: [], total: 0 };
}

export async function fetchMcpList(
  params: McpListParams = {}
): Promise<McpListPayload & { page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.keyword) searchParams.set("search", params.keyword);
  if (params.status) searchParams.set("status", params.status);
  if (params.sort_field) searchParams.set("sort_field", params.sort_field);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);

  const res = await axiosStudio.get(`/mcps?${searchParams.toString()}`);
  const payload = normalizeList(res.data);
  return {
    ...payload,
    page: payload.page ?? page,
    page_size: payload.page_size ?? page_size,
  };
}

export async function createMcp(body: CreateMcpRequest): Promise<McpServer> {
  const res = await axiosStudio.post("/mcp", body);
  return unwrapStudioData<McpServer>(res.data);
}

export async function updateMcp(
  uuid: string,
  body: UpdateMcpRequest
): Promise<McpServer> {
  const res = await axiosStudio.put(`/mcp/${uuid}`, body);
  return unwrapStudioData<McpServer>(res.data);
}

export async function deleteMcp(uuid: string): Promise<void> {
  await axiosStudio.delete(`/mcp/${uuid}`);
}
