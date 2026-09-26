"use client";

import { useEffect, useRef, useState } from "react";
import { getDocuments, uploadDocument } from "@/lib/api";
import Link from "next/link";

type Document = {
  id: number;
  filename: string;
  status: string;
  created_at: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadDocuments() {
    try {
      const result = await getDocuments();
      setDocuments(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  /*
   * Refresh documents periodically so that
   * PROCESSING → READY is reflected in the UI.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    try {
      setUploading(true);

      await uploadDocument(file);

      await loadDocuments();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload document."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function statusClass(status: string) {
    switch (status.toUpperCase()) {
      case "READY":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "PROCESSING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "FAILED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">

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
            className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
          >
            ◈ Workspace
          </a>

          <a
            href="/workspace/documents"
            className="block px-4 py-3 bg-zinc-800 rounded-lg"
          >
            📄 Documents
          </a>

          <a
            href="/workspace/chat"
            className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
          >
            🤖 Ask AI
          </a>

          <div className="border-t border-zinc-800 my-5" />

          <a
            href="/workspace/profile"
            className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
          >
            👤 Profile
          </a>
          
        </nav>

        <button
          onClick={logout}
          className="mt-auto text-left px-4 py-3 text-sm text-zinc-500 hover:text-white"
        >
          Logout
        </button>

      </aside>


      {/* Main */}
      <main className="flex-1 p-10">

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">

            <div>
              <h2 className="text-3xl font-semibold">
                Documents
              </h2>

              <p className="text-zinc-500 mt-2">
                Manage the documents available to DocMind AI.
              </p>
            </div>

            <div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-5 py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "+ Upload PDF"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

            </div>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-6 border border-red-900 bg-red-950/30 text-red-400 rounded-lg px-4 py-3">
              {error}
            </div>
          )}


          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

            <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
              <p className="text-sm text-zinc-500">
                Total Documents
              </p>

              <p className="text-3xl font-semibold mt-2">
                {documents.length}
              </p>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
              <p className="text-sm text-zinc-500">
                Ready
              </p>

              <p className="text-3xl font-semibold mt-2">
                {
                  documents.filter(
                    (doc) =>
                      doc.status.toUpperCase() === "READY"
                  ).length
                }
              </p>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5">
              <p className="text-sm text-zinc-500">
                Processing
              </p>

              <p className="text-3xl font-semibold mt-2">
                {
                  documents.filter(
                    (doc) =>
                      doc.status.toUpperCase() === "PROCESSING"
                  ).length
                }
              </p>
            </div>

          </div>


          {/* Document list */}
          <section>

            <div className="flex items-center justify-between mb-5">

              <h3 className="text-xl font-semibold">
                Your Documents
              </h3>

              <button
                onClick={loadDocuments}
                className="text-sm text-zinc-500 hover:text-white"
              >
                Refresh
              </button>

            </div>


            {loading ? (

              <div className="border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
                Loading documents...
              </div>

            ) : documents.length === 0 ? (

              <div className="border border-dashed border-zinc-800 rounded-xl p-16 text-center">

                <div className="text-4xl mb-4">
                  📄
                </div>

                <h4 className="text-lg font-medium">
                  No documents yet
                </h4>

                <p className="text-sm text-zinc-500 mt-2">
                  Upload your first PDF to start using DocMind AI.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {documents.map((document) => (

                  <div
                    key={document.id}
                    className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 hover:border-zinc-700 transition"
                  >

                    <div className="flex items-start justify-between">

                      <div className="text-3xl">
                        📄
                      </div>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${statusClass(
                          document.status
                        )}`}
                      >
                        {document.status}
                      </span>

                    </div>

                    <h4
                      className="font-medium mt-5 truncate"
                      title={document.filename}
                    >
                      {document.filename}
                    </h4>

                    <p className="text-xs text-zinc-600 mt-3">
                      Uploaded {formatDate(document.created_at)}
                    </p>

                    <div className="mt-5 pt-4 border-t border-zinc-800">

                      <p className="text-xs text-zinc-600">
                        Document ID
                      </p>

                      <p className="text-sm text-zinc-400 mt-1">
                        #{document.id}
                      </p>

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