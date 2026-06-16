import React, { useState } from 'react';
import { FileText, Eye, Code, Copy, Check, Download } from 'lucide-react';

const ReviewSection = ({ readme, isDashboard = false, onCopy, onDownload }) => {
  const [viewMode, setViewMode] = useState('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(readme);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const blob = new Blob([readme], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'README.md';
      a.click();
    }
  };

  const renderMarkdownPreview = (markdown) => {
    if (!markdown) return '';
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-3 mt-6 text-slate-200">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 mt-8 text-slate-100">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 mt-8 text-white">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4 border border-slate-700" />');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-950 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto border border-slate-700"><code class="text-sm font-mono">$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 text-sm font-mono">$1</code>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2 text-slate-300">$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-2 text-slate-300">$2</li>');
    
    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-8 border-slate-700" />');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#00C9FF] pl-4 italic my-4 text-slate-400">$1</blockquote>');
    
    return html;
  };

  if (!readme) return null;

  if (isDashboard) {
    return (
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* View Mode Toggle */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00C9FF]" />
            <span className="font-semibold text-slate-250">README.md</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-md transition-all text-sm font-medium flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`px-4 py-1.5 rounded-md transition-all text-sm font-medium flex items-center gap-1 ${
                viewMode === 'markdown'
                  ? 'bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              Markdown
            </button>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'preview' ? (
            <div className="p-8 bg-slate-900">
              <div className="max-w-4xl mx-auto bg-slate-800/60 border border-slate-700 rounded-lg shadow-2xl p-8 min-h-[600px]">
                <div 
                  className="prose prose-invert max-w-none text-slate-100"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(readme) }}
                />
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                  <code>{readme}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
      {/* Result Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-6 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00C9FF]" />
          <span className="font-semibold text-slate-200">Generated README.md</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-900 p-0.5 rounded-lg flex border border-slate-700 mr-2">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'preview' ? 'bg-[#00C9FF] text-slate-900' : 'text-slate-400'
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'markdown' ? 'bg-[#00C9FF] text-slate-900' : 'text-slate-400'
              }`}
            >
              Markdown
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-slate-200 flex items-center gap-1.5 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-bold rounded-lg hover:shadow-md transition flex items-center gap-1.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Result Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {viewMode === 'preview' ? (
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6 min-h-[300px]">
            <div 
              className="prose prose-invert max-w-none text-slate-100"
              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(readme) }}
            />
          </div>
        ) : (
          <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
            <code>{readme}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
