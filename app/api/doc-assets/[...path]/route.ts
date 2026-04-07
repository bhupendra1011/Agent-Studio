import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = path.join(process.cwd(), "docs");
  const resolved = path.join(root, ...segments);
  const normalizedRoot = path.normalize(`${root}${path.sep}`);
  const normalized = path.normalize(resolved);
  if (!normalized.startsWith(normalizedRoot)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buf = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
