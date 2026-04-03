import { axiosStudio } from "@/lib/api/clients";

export async function fetchStudioAllowedEntries(): Promise<boolean> {
  const res = await axiosStudio.get<{
    code?: number;
    data?: { isAllowedStudioEntry?: boolean };
  }>("/studio/allowed-entries");
  if (res.data?.code !== undefined && res.data.code !== 0) return false;
  return res.data?.data?.isAllowedStudioEntry !== false;
}
