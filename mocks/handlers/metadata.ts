import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";

export const metadataHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/metadata/system-evaluations`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: [
        { variable_name: "call_outcome", type: "boolean" },
        { variable_name: "satisfaction_score", type: "number" },
      ],
      request_id: "mock_meta",
      ts: Date.now(),
    });
  }),
];
