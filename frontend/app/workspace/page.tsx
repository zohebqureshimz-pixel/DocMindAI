"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getDocuments, uploadDocument } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id: number;
};

type Document = {
  id: number;
  filename: string;
  status: string;
  created_at: string;
};

export default function WorkspacePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    router.replace("/signup");
    return;
  }

  try {
    const profile = await getProfile();
    const docs = await getDocuments();

    setUser(profile);
    setDocuments(docs);
  } catch (err) {
    console.error(err);

    localStorage.removeItem("access_token");
    router.replace("/signup");
  } finally {
    setLoading(false);
  }
}
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    try {
      setError("");
      setUploading(true);

      const document = await uploadDocument(file);

      setDocuments((previous) => [
        document,
        ...previous,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6">

        <div className="mb-10">
          <h1 className="text-xl font-bold">
            DocMind AI
          </h1>

          <p className="text-xs text-zinc-500 mt-1">
            Enterprise Document Intelligence
          </p>
        </div>

        <nav className="space-y-2">

          <a
  href="/workspace"
  className="block bg-zinc-800 rounded-lg px-4 py-3"
>
  ◈ Workspace
</a>

<a
  href="/workspace/documents"
  className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
>
  📄 Documents
</a>

<a
  href="/workspace/chat"
  className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
>
  🤖 Ask AI
</a>

          <a
  href="/workspace/profile"
  className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
>
  👤 Profile
</a>


          {user?.role === "ADMIN" && (
  <>
    <div className="border-t border-zinc-800 my-5" />

    <p className="px-4 text-xs text-zinc-600 mb-2">
      ADMIN
    </p>

    <a
      href="/workspace/admin/analytics"
      className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
    >
      📊 Analytics
    </a>
    <div>
    <a
  href="/workspace/admin/insights"
  className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
>
  🧠 AI Insights
</a>
    </div>
  </>
)}

        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 px-4 py-3 text-sm text-zinc-400 hover:text-white"
        >
          Logout
        </button>

      </aside>


      {/* Main */}
      <main className="flex-1 p-10">

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-10">

            <div>
              <h2 className="text-3xl font-semibold">
                Welcome back, {user?.name}
              </h2>

              <p className="text-zinc-500 mt-2">
                Manage your organization's documents
                and interact with AI.
              </p>
            </div>

            <div className="text-right">

              <p className="text-sm text-zinc-400">
                {user?.email}
              </p>

              <p className="text-xs text-zinc-600 mt-1">
                {user?.role}
              </p>

            </div>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}


          {/* Upload */}
          <section className="border border-zinc-800 rounded-2xl p-8 mb-10 bg-zinc-900/40">

            <div className="mb-5">
              <h3 className="text-lg font-semibold">
                Upload a document
              </h3>

              <p className="text-sm text-zinc-500 mt-1">
                Upload a PDF to make it available to DocMind AI.
              </p>
            </div>

            <label className="block border border-dashed border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-zinc-500 transition">

              <div className="text-3xl mb-3">
                📄
              </div>

              <p className="text-sm text-zinc-300">
                {uploading
                  ? "Uploading..."
                  : "Click to select a PDF"}
              </p>

              <p className="text-xs text-zinc-600 mt-2">
                Maximum file size: 10 MB
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />

            </label>

          </section>


          {/* Documents */}
          <section>

            <div className="flex justify-between items-center mb-5">

              <div>
                <h3 className="text-xl font-semibold">
                  Your Documents
                </h3>

                <p className="text-sm text-zinc-500 mt-1">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""}
                </p>
              </div>

            </div>


            {documents.length === 0 ? (

              <div className="border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
                No documents uploaded yet.
              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {documents.map((document) => (

                  <div
                    key={document.id}
                    className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/40"
                  >

                    <div className="text-2xl mb-4">
                      📄
                    </div>

                    <h4 className="font-medium truncate">
                      {document.filename}
                    </h4>

                    <div className="flex justify-between items-center mt-5">

                      <span className="text-xs text-zinc-500">
                        {document.status}
                      </span>

                      <span className="text-xs text-zinc-600">
                        #{document.id}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}