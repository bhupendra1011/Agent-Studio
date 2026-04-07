import { axiosStudio } from "@/lib/api/clients";
import type { SystemEvaluationsResponse } from "@/lib/types/api";

export async function getSystemEvaluations(): Promise<SystemEvaluationsResponse> {
  const response = await axiosStudio.get<SystemEvaluationsResponse>(
    "/metadata/system-evaluations"
  );
  return response.data;
}
