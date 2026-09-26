"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminAnalytics } from "@/lib/api";

type Analytics = {
  period_days: number;

  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_estimated_cost: number;
  average_latency: number;

  requests_by_model: {
    model: string;
    requests: number;
    total_tokens: number;
    estimated_cost: number;
  }[];

  requests_by_user: {
    user_id: number;
    requests: number;
    total_tokens: number;
    estimated_cost: number;
  }[];

  daily_stats: {
    date: string;
    requests: number;
    total_tokens: number;
    estimated_cost: number;
    average_latency: number;
  }[];
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(selectedDays: number) {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminAnalytics(selectedDays);
      setAnalytics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(days);
  }, [days]);

  function formatTokens(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function formatCost(value: number) {
    return `$${value.toFixed(4)}`;
  }

  function formatLatency(value: number) {
    return `${value.toFixed(2)}s`;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-[#0c0c0f] p-6">
          <div className="mb-10">
            <Link
              href="/workspace"
              className="text-xl font-semibold tracking-tight"
            >
              DocMind <span className="text-blue-400">AI</span>
            </Link>
          </div>

          <nav className="space-y-2">
            <Link
              href="/workspace"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              ◈ Workspace
            </Link>

            <Link
              href="/workspace/documents"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              📄 Documents
            </Link>

            <Link
              href="/workspace/chat"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              🤖 Ask AI
            </Link>

            <Link
              href="/workspace/admin/analytics"
              className="block rounded-lg bg-zinc-800 px-4 py-3 text-white"
            >
              📊 Analytics
            </Link>

            <Link
              href="/workspace/profile"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              👤 Profile
            </Link>
          </nav>

          <div className="pt-10">
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
              }}
              className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold">
                  Admin Analytics
                </h1>

                <p className="mt-2 text-zinc-400">
                  Monitor DocMind AI usage across your organization.
                </p>
              </div>

              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="rounded-lg border border-zinc-700 bg-[#111114] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-8 flex items-center justify-center rounded-xl border border-zinc-800 bg-[#111114] p-12">
                <p className="text-zinc-400">
                  Loading analytics...
                </p>
              </div>
            )}

            {/* Analytics */}
            {!loading && analytics && (
              <>
                {/* KPI Cards */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <p className="text-sm text-zinc-500">
                      AI Requests
                    </p>

                    <p className="mt-3 text-3xl font-semibold">
                      {formatTokens(analytics.total_requests)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Last {analytics.period_days ?? days} days
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <p className="text-sm text-zinc-500">
                      Total Tokens
                    </p>

                    <p className="mt-3 text-3xl font-semibold">
                      {formatTokens(analytics.total_tokens)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Input + output
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <p className="text-sm text-zinc-500">
                      Estimated LLM Cost
                    </p>

                    <p className="mt-3 text-3xl font-semibold">
                      {formatCost(analytics.total_estimated_cost)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Based on tracked LLM usage
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <p className="text-sm text-zinc-500">
                      Average Latency
                    </p>

                    <p className="mt-3 text-3xl font-semibold">
                      {formatLatency(analytics.average_latency)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Average AI response time
                    </p>
                  </div>

                </div>

                {/* Daily Activity */}
                <section className="mt-8 rounded-xl border border-zinc-800 bg-[#111114] p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Daily Activity
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      AI requests and latency over the selected period.
                    </p>
                  </div>

                  {analytics.daily_stats.length === 0 ? (
                    <p className="py-8 text-center text-zinc-500">
                      No activity recorded during this period.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.daily_stats.map((day) => (
                        <div
                          key={day.date}
                          className="rounded-lg border border-zinc-800 bg-[#0c0c0f] p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="font-medium">
                                {day.date}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {day.requests} requests
                              </p>
                            </div>

                            <div className="flex gap-6 text-sm">
                              <div>
                                <p className="text-zinc-500">
                                  Tokens
                                </p>

                                <p className="mt-1">
                                  {formatTokens(day.total_tokens)}
                                </p>
                              </div>

                              <div>
                                <p className="text-zinc-500">
                                  Cost
                                </p>

                                <p className="mt-1">
                                  {formatCost(day.estimated_cost)}
                                </p>
                              </div>

                              <div>
                                <p className="text-zinc-500">
                                  Latency
                                </p>

                                <p className="mt-1">
                                  {formatLatency(day.average_latency)}
                                </p>
                              </div>
                            </div>

                          </div>

                          {/* Request bar */}
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (day.requests /
                                    Math.max(
                                      ...analytics.daily_stats.map(
                                        (item) => item.requests
                                      )
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Model + User */}
                <div className="mt-8 grid gap-8 lg:grid-cols-2">

                  {/* Model Usage */}
                  <section className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <h2 className="text-lg font-semibold">
                      Usage by Model
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Requests and token consumption by model.
                    </p>

                    <div className="mt-6 space-y-4">
                      {analytics.requests_by_model.map((model) => (
                        <div
                          key={model.model}
                          className="rounded-lg border border-zinc-800 bg-[#0c0c0f] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {model.model}
                            </p>

                            <span className="text-sm text-zinc-400">
                              {model.requests} requests
                            </span>
                          </div>

                          <div className="mt-3 flex gap-6 text-sm">
                            <div>
                              <p className="text-xs text-zinc-500">
                                Tokens
                              </p>

                              <p className="mt-1">
                                {formatTokens(model.total_tokens)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-zinc-500">
                                Cost
                              </p>

                              <p className="mt-1">
                                {formatCost(model.estimated_cost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {analytics.requests_by_model.length === 0 && (
                        <p className="py-6 text-center text-zinc-500">
                          No model usage recorded.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* User Usage */}
                  <section className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
                    <h2 className="text-lg font-semibold">
                      Usage by User
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      AI activity across organization users.
                    </p>

                    <div className="mt-6 space-y-4">
                      {analytics.requests_by_user.map((user) => (
                        <div
                          key={user.user_id}
                          className="rounded-lg border border-zinc-800 bg-[#0c0c0f] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              User #{user.user_id}
                            </p>

                            <span className="text-sm text-zinc-400">
                              {user.requests} requests
                            </span>
                          </div>

                          <div className="mt-3 flex gap-6 text-sm">
                            <div>
                              <p className="text-xs text-zinc-500">
                                Tokens
                              </p>

                              <p className="mt-1">
                                {formatTokens(user.total_tokens)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-zinc-500">
                                Cost
                              </p>

                              <p className="mt-1">
                                {formatCost(user.estimated_cost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {analytics.requests_by_user.length === 0 && (
                        <p className="py-6 text-center text-zinc-500">
                          No user activity recorded.
                        </p>
                      )}
                    </div>
                  </section>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}