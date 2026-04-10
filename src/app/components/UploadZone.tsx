'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Link, Loader2, Sparkles, Globe, Palette } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/app/types';

interface ToneOptions {
  blog: string;
  social: string;
  email: string;
}

interface UploadZoneProps {
  onSubmit: (content: string, sourceUrl?: string, title?: string, language?: string, tones?: ToneOptions) => void;
  isLoading: boolean;
}

export function UploadZone({ onSubmit, isLoading }: UploadZoneProps) {
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState('en');
  const [blogTone, setBlogTone] = useState('professional');
  const [socialTone, setSocialTone] = useState('punchy');
  const [emailTone, setEmailTone] = useState('formal');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setContent(text);
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        };
        reader.readAsText(file);
      }
    }
  }, [title]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, sourceUrl || undefined, title || undefined, language, { blog: blogTone, social: socialTone, email: emailTone });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Heading Section */}
      <div className="text-center space-y-4 mb-10 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 drop-shadow-sm">
          Autonomous Campaign
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
          Drop your ideas. We build the marketing strategy.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl ring-1 ring-gray-200/50 dark:ring-white/10 rounded-3xl p-8 shadow-2xl">
          
          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2 group/input">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                Campaign Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q3 Product Launch Strategy"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="region"
              aria-label="File drop zone — drag and drop a file here or click to browse"
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group/drop ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-inner'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="file"
                accept=".txt,.md,.html,.json"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                aria-label="Upload a source file (.txt, .md, .html, .json)"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4 relative z-10"
              >
                <div className={`p-5 rounded-2xl transition-all duration-300 ${isDragging ? 'bg-blue-100 dark:bg-blue-800/50 rotate-6 scale-110' : 'bg-white dark:bg-gray-800 shadow-sm group-hover/drop:-translate-y-1 group-hover/drop:shadow-md'}`}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    Drop a file here or browse
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Supports .md, .txt, .html files
                  </p>
                </div>
              </label>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            </div>

            {/* Direct Text Input */}
            <div className="space-y-2 group/text">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Raw Source Material
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste blog content, raw notes, or technical specifications here to transform them..."
                rows={6}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>

            {/* Source URL Input */}
            <div className="space-y-2 group/url">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                <Link className="w-4 h-4 text-purple-500" />
                Reference URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/context-article"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>

            {/* Language & Tags Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  Output Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Select output language"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 dark:hover:border-gray-600"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tone Selectors */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-500" />
                Content Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Blog Tone */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Blog</span>
                  <select
                    value={blogTone}
                    onChange={(e) => setBlogTone(e.target.value)}
                    aria-label="Select blog tone"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="professional">Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="academic">Academic</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="technical">Technical</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>
                {/* Social Tone */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Social</span>
                  <select
                    value={socialTone}
                    onChange={(e) => setSocialTone(e.target.value)}
                    aria-label="Select social tone"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="punchy">Punchy & Viral</option>
                    <option value="witty">Witty & Humorous</option>
                    <option value="bold">Bold & Provocative</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="motivational">Motivational</option>
                    <option value="informative">Informative</option>
                  </select>
                </div>
                {/* Email Tone */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Email</span>
                  <select
                    value={emailTone}
                    onChange={(e) => setEmailTone(e.target.value)}
                    aria-label="Select email tone"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="formal">Formal & Corporate</option>
                    <option value="friendly">Friendly & Warm</option>
                    <option value="urgent">Urgent & Action-Driven</option>
                    <option value="persuasive">Persuasive & Sales</option>
                    <option value="newsletter">Newsletter Style</option>
                    <option value="minimalist">Minimalist & Direct</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className={`w-full relative overflow-hidden flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                content.trim() && !isLoading
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {content.trim() && !isLoading && (
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Orchestrating AI Agents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span className={content.trim() ? "group-hover:text-white transition-colors" : ""}>Generate Campaign</span>
                  </>
                )}
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
