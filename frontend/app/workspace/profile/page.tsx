"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/api";

type Profile = {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id: number;
  created_at?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "Unable to load profile"}
          </p>

          <Link
            href="/workspace"
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Workspace
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "—";

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
              Workspace
            </Link>

            <Link
              href="/workspace/documents"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Documents
            </Link>

            <Link
              href="/workspace/chat"
              className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Ask AI
            </Link>

            <Link
              href="/workspace/profile"
              className="block rounded-lg bg-zinc-800 px-4 py-3 text-white"
            >
              Profile
            </Link>
          </nav>

          <div className="mt-auto pt-10">
            <button
              onClick={logout}
              className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-4xl">

            <div className="mb-8">
              <h1 className="text-3xl font-semibold">
                Profile
              </h1>

              <p className="mt-2 text-zinc-400">
                Manage your DocMind account information.
              </p>
            </div>

            {/* Profile header */}
            <section className="rounded-2xl border border-zinc-800 bg-[#111114] p-8">
              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-semibold text-blue-400">
                  {initials}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">
                    {profile.name}
                  </h2>

                  <p className="mt-1 text-zinc-400">
                    {profile.email}
                  </p>
                </div>

              </div>
            </section>

            {/* Account information */}
            <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#111114] p-8">

              <h2 className="mb-6 text-lg font-semibold">
                Account Information
              </h2>

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <p className="text-sm text-zinc-500">
                    Full Name
                  </p>

                  <p className="mt-2 text-zinc-200">
                    {profile.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Email
                  </p>

                  <p className="mt-2 text-zinc-200">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Organization ID
                  </p>

                  <p className="mt-2 text-zinc-200">
                    {profile.organization_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Role
                  </p>

                  <span className="mt-2 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                    {profile.role}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Account Created
                  </p>

                  <p className="mt-2 text-zinc-200">
                    {createdDate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Account ID
                  </p>

                  <p className="mt-2 text-zinc-200">
                    #{profile.id}
                  </p>
                </div>

              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}