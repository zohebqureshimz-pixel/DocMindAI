"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getDocuments,
  getProfile,
  askQuestion,
} from "@/lib/api";

type Document = {
  id: number;
  filename: string;
  status: string;
};

type Source = {
  chunk_index: number;
  similarity: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<number | "">("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getProfile();
        const docs = await getDocuments();

        setUser(profile);

        const readyDocuments = docs.filter(
          (doc: Document) => doc.status === "READY"
        );

        setDocuments(readyDocuments);

        if (readyDocuments.length > 0) {
          setSelectedDocument(readyDocuments[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load workspace.");
      } finally {
        setLoadingPage(false);
      }
    }

    loadData();
  }, []);

  async function handleAsk() {
    if (!question.trim()) {
      return;
    }

    if (!selectedDocument) {
      setError("Please select a document first.");
      return;
    }

    setError("");
    setLoading(true);

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");

    try {
      const result = await askQuestion({
        question: userQuestion,
        document_id: Number(selectedDocument),
        top_k: 5,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to get AI response."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0d0d0d] p-6 flex flex-col">
        
        <div>
          <h1 className="text-xl font-semibold">
            DocMind AI
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Document Intelligence
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          <Link
            href="/workspace"
            className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ◈ Workspace
          </Link>

          <Link
            href="/workspace/documents"
            className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            📄 Documents
          </Link>

          <Link
            href="/workspace/chat"
            className="block rounded-lg bg-white/10 px-4 py-3 text-white"
          >
            🤖 Ask AI
          </Link>

          {user?.role === "ADMIN" && (
            <a
      href="/workspace/admin/analytics"
      className="block rounded-lg px-4 py-3 text-zinc-400 hover:bg-zinc-800 hover:text-white"
    >
      📊 Analytics
    </a>
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="text-sm text-white">
            {user?.name}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {user?.email}
          </p>

          <button
            onClick={logout}
            className="mt-4 text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        
        <header className="border-b border-white/10 px-8 py-5">
          <h2 className="text-2xl font-semibold">
            Ask AI
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your organization's documents.
          </p>
        </header>

        <div className="flex-1 max-w-5xl w-full mx-auto px-8 py-8 flex flex-col">
          
          {/* Document selector */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Select document
            </label>

            <select
              value={selectedDocument}
              onChange={(event) =>
                setSelectedDocument(
                  event.target.value
                    ? Number(event.target.value)
                    : ""
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/30"
            >
              <option value="">
                Select a document
              </option>

              {documents.map((document) => (
                <option
                  key={document.id}
                  value={document.id}
                >
                  {document.filename}
                </option>
              ))}
            </select>

            {documents.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No ready documents available. Upload and process a
                document first.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 space-y-6 overflow-y-auto mb-6">
            
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-4xl mb-4">
                    ✦
                  </div>

                  <h3 className="text-xl font-medium">
                    Ask your documents anything
                  </h3>

                  <p className="text-gray-500 text-sm mt-2">
                    Select a document and ask a question. DocMind AI
                    will retrieve relevant information and generate a
                    grounded answer.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-2xl rounded-2xl bg-white text-black px-5 py-4"
                      : "max-w-3xl rounded-2xl border border-white/10 bg-[#111] px-5 py-4"
                  }
                >
                  <p className="text-sm leading-7 whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Sources */}
                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="text-xs font-medium text-gray-400 mb-3">
                          Sources
                        </p>

                        <div className="space-y-2">
                          {message.sources.map(
                            (source, sourceIndex) => (
                              <div
                                key={sourceIndex}
                                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs"
                              >
                                <span className="text-gray-400">
                                  Chunk {source.chunk_index}
                                </span>

                                <span className="text-gray-500">
                                  Similarity{" "}
                                  {(
                                    source.similarity * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-[#111] px-5 py-4">
                  <p className="text-sm text-gray-500">
                    DocMind AI is thinking...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border border-white/10 bg-[#111] rounded-2xl p-3">
            <div className="flex gap-3 items-end">
              
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your document..."
                rows={2}
                disabled={loading || !selectedDocument}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none"
              />

              <button
                onClick={handleAsk}
                disabled={
                  loading ||
                  !question.trim() ||
                  !selectedDocument
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Asking..." : "Ask"}
              </button>
            </div>

            <p className="text-xs text-gray-600 px-3 pt-2">
              Press Enter to ask · Shift + Enter for a new line
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}