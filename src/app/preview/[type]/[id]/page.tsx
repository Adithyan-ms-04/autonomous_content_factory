import { getWorkflow } from '@/app/lib/store';
import { notFound } from 'next/navigation';
import { MessageSquare, RefreshCw, FileText, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Factory Preview',
};

export default async function PreviewPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const workflow = await getWorkflow(id);

  if (!workflow || !workflow.campaign) return notFound();

  const contentMap: Record<string, { content: string }> = {
    blog: workflow.campaign.blogPost,
    social: workflow.campaign.socialThread,
    email: workflow.campaign.emailTeaser,
  };

  const currentContent = contentMap[type];
  if (!currentContent) return notFound();

  if (type === 'social') {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] bg-white border-[12px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="h-14 border-b border-gray-100 flex items-center justify-between px-5 font-semibold text-gray-800">
            <span>Thread Simulator</span>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentContent.content)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
            >
              Post on X
            </a>
          </div>
          <div className="p-5 relative bg-white min-h-[700px]">
            <div className="absolute top-8 bottom-12 left-10 w-0.5 bg-gray-200 z-0" />

            <div className="space-y-0 relative z-10">
              {currentContent.content.split('\n').filter(p => p.trim()).map((post, i) => (
                <div key={i} className="flex gap-4 pb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shrink-0 border-4 border-white relative z-10 shadow-sm" />
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-[15px] text-gray-900">Brand</span>
                      <span className="text-gray-500 text-[15px]">@brand</span>
                    </div>
                    <p className="text-gray-800 text-[15px] leading-snug whitespace-pre-wrap">{post}</p>
                    <div className="mt-3 flex justify-between items-center text-xs font-medium">
                      <div className="flex gap-4 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <RefreshCw className="w-4 h-4" />
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className={post.length > 280 ? 'text-red-500' : 'text-gray-400'}>
                        {post.length}/280
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (type === 'email') {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-12">
        <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 shadow-xl overflow-hidden bg-white">
          <div className="bg-gray-100 px-6 py-5 border-b border-gray-200 relative">
            {(() => {
                const match = currentContent.content.match(/^Subject:\s*(.*)/i);
                const subject = match ? match[1].trim() : '';
                const body = currentContent.content.replace(/^Subject:\s*.*\n?/i, '').trim();
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                return (
                  <div className="absolute top-4 right-5 sm:top-5 sm:right-6">
                    <a 
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Compose in Gmail
                    </a>
                  </div>
                );
            })()}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                C
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-gray-900 text-base">Content Team <span className="font-normal text-gray-500">&lt;marketing@brand.com&gt;</span></div>
                <div className="text-gray-500 mt-0.5">To: You</div>
              </div>
            </div>
            <h1 className="font-bold text-2xl text-gray-900 leading-tight pr-36">
              {(() => {
                const match = currentContent.content.match(/^Subject:\s*(.*)/i);
                return match ? match[1] : 'No Subject';
              })()}
            </h1>
          </div>
          <div className="p-8 md:p-12 bg-white">
            <div className="prose max-w-none text-base whitespace-pre-wrap leading-relaxed text-gray-800">
              {currentContent.content.replace(/^Subject:\s*.*\n?/i, '').trim()}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Fallback -> Blog Article
  return (
    <main className="min-h-screen bg-white text-gray-900 py-12 px-4">
      <article className="max-w-[800px] mx-auto bg-white">
        <div className="flex items-center gap-3 mb-8 text-sm text-gray-500 font-medium pb-8 border-b border-gray-100">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold flex items-center gap-1.5">
            Reading Time: {Math.max(1, Math.ceil(currentContent.content.split(/\s+/).length / 200))} mins
          </span>
          <span>•</span>
          <span>{currentContent.content.split(/\s+/).length} words</span>
        </div>
        <div className="prose prose-lg max-w-none hover:prose-a:text-blue-500 prose-a:text-blue-600 prose-a:no-underline prose-img:rounded-2xl leading-[1.7] text-gray-800">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl sm:text-5xl font-black mt-10 mb-6 text-gray-900 leading-tight tracking-tight" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-3xl sm:text-4xl font-extrabold mt-12 mb-4 text-gray-800" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 text-gray-800" {...props} />,
            }}
          >
            {currentContent.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
