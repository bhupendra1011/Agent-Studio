import { axiosStudio } from "@/lib/api/clients";
import type {
  KnowledgeBase,
  KnowledgeBaseListParams,
  KnowledgeBaseListPayload,
} from "@/lib/types/api";
import { unwrapStudioData } from "@/lib/utils/studio-response";

function normalizeList(raw: unknown): KnowledgeBaseListPayload {
  const data = unwrapStudioData<KnowledgeBaseListPayload | undefined>(raw);
  if (data && Array.isArray(data.list)) {
    return {
      list: data.list,
      total: data.total ?? 0,
      page: data.page,
      page_size: data.page_size,
    };
  }
  const flat = raw as KnowledgeBaseListPayload | undefined;
  if (flat && Array.isArray(flat.list)) {
    return flat;
  }
  return { list: [], total: 0 };
}

export async function fetchKnowledgeBaseList(
  params: KnowledgeBaseListParams = {}
): Promise<KnowledgeBaseListPayload & { page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.keyword) searchParams.set("search", params.keyword);

  const res = await axiosStudio.get(
    `/knowledge-bases?${searchParams.toString()}`
  );
  const payload = normalizeList(res.data);
  return {
    ...payload,
    page: payload.page ?? page,
    page_size: payload.page_size ?? page_size,
  };
}

export async function createKnowledgeBase(input: {
  name: string;
  description?: string;
  files?: File[];
}): Promise<KnowledgeBase> {
  const form = new FormData();
  form.append("name", input.name);
  if (input.description) form.append("description", input.description);
  for (const f of input.files ?? []) {
    form.append("files", f);
  }
  const res = await axiosStudio.post("/knowledge-bases", form);
  return unwrapStudioData<KnowledgeBase>(res.data);
}

export async function deleteKnowledgeBase(id: string): Promise<void> {
  await axiosStudio.delete(`/knowledge-bases/${id}`);
}
