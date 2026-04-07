import { axiosStudio } from "@/lib/api/clients";
import type {
  CreateSipNumberRequest,
  SipNumber,
  SipNumberEditStatusItem,
  SipNumberListParams,
  SipNumberListPayload,
  UpdateSipNumberRequest,
} from "@/lib/types/api";
import { unwrapStudioData } from "@/lib/utils/studio-response";

function normalizeList(raw: unknown): SipNumberListPayload {
  const data = unwrapStudioData<SipNumberListPayload | undefined>(raw);
  if (data && Array.isArray(data.list)) {
    return {
      list: data.list,
      total: data.total ?? 0,
      page: data.page,
      page_size: data.page_size,
    };
  }
  const flat = raw as SipNumberListPayload | undefined;
  if (flat && Array.isArray(flat.list)) {
    return flat;
  }
  return { list: [], total: 0 };
}

export async function fetchSipNumberList(
  params: SipNumberListParams = {}
): Promise<SipNumberListPayload & { page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(page_size));
  if (params.keyword) searchParams.set("keyword", params.keyword);

  const res = await axiosStudio.get(`/sip-numbers?${searchParams.toString()}`);
  const payload = normalizeList(res.data);
  return {
    ...payload,
    page: payload.page ?? page,
    page_size: payload.page_size ?? page_size,
  };
}

export async function getSipNumber(id: string): Promise<SipNumber> {
  const res = await axiosStudio.get(`/sip-numbers/${id}`);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function createSipNumber(
  body: CreateSipNumberRequest
): Promise<SipNumber> {
  const res = await axiosStudio.post("/sip-numbers", body);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function updateSipNumber(
  id: string,
  body: UpdateSipNumberRequest
): Promise<SipNumber> {
  const res = await axiosStudio.put(`/sip-numbers/${id}`, body);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function deleteSipNumber(id: string): Promise<void> {
  await axiosStudio.delete(`/sip-numbers/${id}`);
}

export async function checkSipNumberEditStatus(
  phoneNumberIds: string[]
): Promise<SipNumberEditStatusItem[]> {
  const searchParams = new URLSearchParams();
  phoneNumberIds.forEach((id) => searchParams.append("phone_number_ids", id));
  const qs = searchParams.toString();
  const res = await axiosStudio.get(
    `/sip-numbers/all/edit-status${qs ? `?${qs}` : ""}`
  );
  const items = unwrapStudioData<SipNumberEditStatusItem[] | undefined>(
    res.data
  );
  return Array.isArray(items) ? items : [];
}
