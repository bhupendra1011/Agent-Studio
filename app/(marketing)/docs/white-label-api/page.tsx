import fs from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "White-label API contract · Agent Studio",
  description:
    "Backend API contract reference for white-label / micro-SaaS integration with Agent Studio.",
};

const DOC_PATH = path.join(process.cwd(), "docs", "White_label_api.md");

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading mt-10 mb-4 scroll-mt-24 text-3xl font-bold tracking-tight text-[var(--studio-ink)] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading mt-12 mb-3 scroll-mt-24 border-b border-[var(--studio-border)] pb-2 text-xl font-semibold text-[var(--studio-ink)]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-2 text-lg font-semibold text-[var(--studio-ink)]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-[var(--studio-ink)]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-[var(--studio-ink)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-[var(--studio-ink)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  hr: () => (
    <hr className="my-10 border-[var(--studio-border)]" />
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-[var(--studio-teal)] pl-4 text-[var(--studio-ink-muted)] italic">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--studio-ink)]">{children}</strong>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="font-medium text-[var(--studio-teal)] underline-offset-2 hover:underline"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code
          className={cn(
            className,
            "block whitespace-pre text-[0.8125rem] leading-relaxed text-[var(--studio-ink)]"
          )}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-[var(--studio-surface-muted)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--studio-ink)]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-6 overflow-x-auto rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] p-4 text-[0.8125rem] leading-relaxed font-mono [&_code]:whitespace-pre">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--studio-border)]">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--studio-surface-muted)]">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-[var(--studio-border)] last:border-b-0">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2.5 font-semibold text-[var(--studio-ink)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2.5 align-top text-[var(--studio-ink)]">
      {children}
    </td>
  ),
  img: ({ src, alt }) => {
    if (src == null || typeof src !== "string") return null;
    let url = src;
    if (!src.startsWith("http") && !src.startsWith("/")) {
      const clean = src.replace(/^docs\//, "");
      url = `/api/doc-assets/${clean
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/")}`;
    }
    return (
      <figure className="my-8 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic doc paths from markdown */}
        <img
          src={url}
          alt={alt ?? ""}
          className="w-full max-w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] object-contain shadow-sm"
        />
      </figure>
    );
  },
};

export default async function WhiteLabelApiDocPage() {
  const source = await fs.readFile(DOC_PATH, "utf8");

  return (
    <main className="bg-[var(--studio-surface)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <article className="min-w-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {source}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
