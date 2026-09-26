export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5">
        <div className="text-2xl font-bold">
          DocMind<span className="text-blue-500"> AI</span>
        </div>

        <div className="flex gap-4">
          <button className="rounded-lg px-4 py-2 text-slate-300 hover:text-white">
            Login
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          Enterprise Document Intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
          Ask your documents.
          <br />
          <span className="text-blue-500">Get intelligent answers.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          DocMind AI helps teams securely search, understand and interact
          with their organization&apos;s documents using AI-powered retrieval.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
            Get Started
          </button>

          <button className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-900">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        <Feature
          title="Secure Documents"
          description="Upload and manage organization documents with authenticated access."
        />

        <Feature
          title="AI-Powered Search"
          description="Find relevant information using semantic document retrieval."
        />

        <Feature
          title="Source-Based Answers"
          description="Get answers grounded in your organization's documents."
        />
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}