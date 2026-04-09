import Link from "next/link";
import { ArrowLeft, BookOpen, User, Zap, Shield, Sparkles } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-64 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>

          <header className="mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-2">
              <BookOpen className="w-4 h-4" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Autonomous Content Factory
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              Turn any source material into a series of highly effective multi-channel marketing campaigns through the power of multi-agent AI.
            </p>
          </header>

          <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 mb-12">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-500" />
              About the Creator
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <p className="text-lg leading-relaxed">
                This website and the underlying AI automation systems were architected and developed solely by <strong>Adithyan M S</strong>. 
                Designed to revolutionize the content marketing pipeline, this application showcases the seamless orchestration of multiple specialized AI agents working together efficiently.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20" />
              <Zap className="w-8 h-8 text-purple-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">Multi-Agent Workflow</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our system utilizes distinct AI entities: a Researcher to parse data, a Copywriter to synthesize engaging content, and an Editor to assure quality. They collaborate continuously until the final outputs are flawless.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
              <Sparkles className="w-8 h-8 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">Omnichannel Execution</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Provide an article URL, project note, or a text document, and receive a ready-to-post blog article, a viral thread, and an engaging email teaser all in one integrated suite.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-emerald-400" />
                How to Use
              </h2>
              <ol className="space-y-6 text-gray-300">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Provide Source Material</h4>
                    <p>Paste the raw information, drop a markdown/text file, or supply a link to your target material.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Launch the Automation</h4>
                    <p>Hit "Start Campaign" and monitor the command center as the virtual agent team tackles the problem.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Export Production Ready Content</h4>
                    <p>Use the Export Center to package the approved content and seamlessly launch to your channels.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <footer className="mt-16 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />
            <p>Created with Precision.</p>
            <p>© {new Date().getFullYear()} Adithyan M S. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
