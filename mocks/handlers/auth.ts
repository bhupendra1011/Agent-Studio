import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";

export const authHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/studio/allowed-entries`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: { isAllowedStudioEntry: true },
      request_id: "mock_req_001",
      ts: Date.now(),
    });
  }),
];
