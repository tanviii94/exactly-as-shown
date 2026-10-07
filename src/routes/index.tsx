import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calls, type Call, type CallStatus } from "@/lib/calls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Call History · Logictap Clinic Dashboard" },
      { name: "description", content: "Review every call your Logictap AI voice agent handled for your clinic." },
      { property: "og:title", content: "Call History · Logictap Clinic Dashboard" },
      { property: "og:description", content: "Review every call your Logictap AI voice agent handled for your clinic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

export function formatDuration(total: number): string {
  const s = Math.max(0, Math.floor(Number(total) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m ${sec}s`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const STATUS: Record<CallStatus, { label: string; icon: string; cls: string }> = {
  answered: { label: "Answered", icon: "✓", cls: "bg-success-soft text-success" },
  failed: { label: "Failed", icon: "✕", cls: "bg-danger-soft text-destructive" },
  no_answer: { label: "No answer", icon: "–", cls: "bg-warning-soft text-warning" },
};

function displayName(name: string | null) {
  const n = name?.trim();
  if (!n) return null;
  return n.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function Index() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calls;
    return calls.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Logictap</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Clinic call dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Calls handled by your AI voice agent.</p>
          </div>
          <div className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-[var(--shadow-card)]">
            <span className="font-bold text-primary">{calls.length}</span> total calls
          </div>
        </header>

        <div className="relative mt-6">
          <label htmlFor="search" className="sr-only">Search calls by caller name</label>
          <svg aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search calls by name..."
            className="h-12 w-full rounded-xl border bg-card pl-12 pr-4 text-base shadow-[var(--shadow-card)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {calls.length} calls
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
            <p className="text-lg font-semibold">No calls found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try searching with a different name.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {filtered.map((c, i) => (
              <CallCard key={`${c.id}-${i}`} call={c} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function CallCard({ call }: { call: Call }) {
  const [open, setOpen] = useState(false);
  const name = displayName(call.name);
  const status = STATUS[call.status] ?? { label: call.status, icon: "?", cls: "bg-muted text-muted-foreground" };
  const summary = call.summary?.trim();
  const long = (summary?.length ?? 0) > 140;

  return (
    <li className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className={`min-w-0 break-words text-base font-semibold ${name ? "" : "italic text-muted-foreground"}`}>
          {name ?? "Unknown caller"}
        </h2>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
          <span aria-hidden>{status.icon}</span>
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Duration: <span className="font-medium tabular-nums text-foreground">{formatDuration(call.duration_secs)}</span>
      </p>
      {summary ? (
        <div className="mt-3">
          <p className={`break-words text-sm leading-relaxed ${long && !open ? "line-clamp-2" : ""}`}>{summary}</p>
          {long && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-1 rounded py-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {open ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground">No summary available</p>
      )}
    </li>
  );
}
