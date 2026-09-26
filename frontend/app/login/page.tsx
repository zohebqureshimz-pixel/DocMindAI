"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/api";

function LoginForm() {
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered");
  const organization = searchParams.get("organization");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login({
        email,
        password,
      });

      localStorage.setItem("access_token", result.access_token);

      window.location.href = "/workspace";
    } catch (error) {
      console.error(error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            DocMind<span className="text-blue-500"> AI</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to your organization workspace
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          {/* Registration success message */}
          {registered === "true" && organization && (
            <div className="mb-5 rounded-lg border border-green-800 bg-green-950/40 px-4 py-3">
              <p className="text-sm font-medium text-green-400">
                Account created successfully!
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Your{" "}
                <span className="font-semibold text-white">
                  {organization}
                </span>{" "}
                workspace is ready. Please sign in.
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-400 hover:text-blue-300"
            >
              Create one
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}