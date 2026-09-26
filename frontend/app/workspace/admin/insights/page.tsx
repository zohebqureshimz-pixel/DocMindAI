"use client";

import { useEffect, useState } from "react";
import { getAdminInsights } from "@/lib/api";

export default function AIInsightsPage() {
  const [days, setDays] = useState(30);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminInsights(days);

      setInsights(data.insights);
    } catch (error) {
      console.error("Insights error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load AI insights.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [days]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              AI Insights
            </h1>

            <p className="mt-2 text-zinc-400">
              AI-generated insights from your organization's DocMind usage.
            </p>
          </div>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-zinc-400">
              Generating AI insights...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
            <h2 className="font-medium text-red-300">
              Unable to load AI insights
            </h2>

            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={loadInsights}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Insights */}
        {!loading && !error && insights && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-300">
              {insights}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && !insights && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-zinc-400">
              No insights are available for this period.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}