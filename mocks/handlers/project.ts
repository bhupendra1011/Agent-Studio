import { http, HttpResponse } from "msw";
import { mockProjects } from "@/mocks/data/projects";
import { getConsoleV2MswSegment } from "@/mocks/msw-console-v2-prefix";

const v2 = getConsoleV2MswSegment();

export const projectHandlers = [
  http.get(`*/${v2}/projects`, () => {
    return HttpResponse.json({
      total: mockProjects.length,
      items: mockProjects,
    });
  }),

  http.post(`*/${v2}/project`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Date.now(),
      name: (body.projectName as string) || "New Project",
      projectId: `proj_${Date.now()}`,
      key: `key_${Date.now()}`,
      signkey: `sign_${Date.now()}`,
    });
  }),
];
