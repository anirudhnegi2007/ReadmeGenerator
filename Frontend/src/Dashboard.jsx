
import React, { useState, useEffect } from 'react';
import { 
  Github, 
  FileText,
  Eye,
  Code,
  Download,
  Copy,
  Sparkles,
  Folder,
  File,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  RefreshCw,
  Check,
  AlertCircle,
  Search,
  Link as LinkIcon,
  Loader,
  GitBranch,
  Star,
  BookOpen,
  Zap,
  Terminal,
  Image as ImageIcon,
  Database,
  Settings,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  // GitHub Integration State
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  
  // README Generation State
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'markdown'
  
  // UI State
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Parse GitHub URL
  const parseGitHubUrl = (url) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    return null;
  };

  // Infer language from file extension
  const getLanguageFromExt = (ext) => {
    const map = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      txt: 'text',
      gitignore: 'text',
      env: 'text',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      svg: 'image',
      ico: 'image',
    };
    return map[ext.toLowerCase()] || 'unknown';
  };

  // Fetch repository data from GitHub API
  const fetchRepositoryData = async (owner, repo) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch repository data: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      name: data.name,
      owner: data.owner.login,
      description: data.description || '',
      language: data.language,
      topics: data.topics || [],
      license: data.license ? data.license.key : 'MIT',
      stars: data.stargazers_count,
      is_private: data.private,
      default_branch: data.default_branch || 'main'
    };
  };

  // Fetch repository file tree from GitHub API and build nested structure
  const fetchRepositoryFiles = async (owner, repo, branch) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    if (!res.ok) {
      throw new Error(`Failed to fetch repository files: ${res.statusText}`);
    }
    const data = await res.json();

    // Build nested tree from flat paths
    const root = [];
    const paths = data.tree.sort((a, b) => a.path.localeCompare(b.path));
    paths.forEach(item => {
      const parts = item.path.split('/');
      let currentLevel = root;
      parts.forEach((part, i) => {
        let node = currentLevel.find(n => n.name === part);
        if (!node) {
          const path = parts.slice(0, i + 1).join('/');
          node = {
            name: part,
            path,
            type: i === parts.length - 1 && item.type === 'blob' ? 'file' : 'folder',
          };
          if (node.type === 'folder') {
            node.children = [];
          } else {
            node.language = getLanguageFromExt(part.split('.').pop());
          }
          currentLevel.push(node);
        }
        if (node.type === 'folder') {
          currentLevel = node.children;
        }
      });
    });
    return root;
  };

  // Analyze repository structure
  const analyzeRepository = (files) => {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      languages: new Set(),
      hasTests: false,
      hasDocumentation: false,
      hasCICD: false,
      frameworks: new Set()
    };

    const traverse = (items) => {
      items.forEach(item => {
        if (item.type === 'folder') {
          stats.totalFolders++;
          if (item.name === 'tests' || item.name === '__tests__') stats.hasTests = true;
          if (item.children) traverse(item.children);
        } else {
          stats.totalFiles++;
          if (item.language) stats.languages.add(item.language);
          if (item.name === 'README.md') stats.hasDocumentation = true;
        }
      });
    };

    traverse(files);

    // Detect frameworks (simplified)
    if (stats.languages.has('jsx') || stats.languages.has('tsx')) {
      stats.frameworks.add('React');
    }

    return stats;
  };

  // Generate README using backend 
  const generateReadmeWithGemini = async (repoData, repoFiles, selectedFilePaths) => {
    const repoUrl = `https://github.com/${repoData.owner}/${repoData.name}`;
    const analysis = analyzeRepository(repoFiles); // Local analysis for potential use

    try {
      const response = await fetch('http://localhost:5000/services/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          tone: 'professional',
          includeBadges: true,
          selectedFiles: Array.from(selectedFilePaths), 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate README');
      }

      return data.markdown;
    } catch (error) {
      throw new Error('Failed to generate README with backend');
    }
  };

  // Handle GitHub URL submission
  const handleFetchRepository = async () => {
    setError(null);
    setSuccess(null);
    
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      return;
    }

    setIsLoadingRepo(true);
    
    try {
      const data = await fetchRepositoryData(parsed.owner, parsed.repo);
      const files = await fetchRepositoryFiles(parsed.owner, parsed.repo, data.default_branch);
      
      setRepoData(data);
      setRepoFiles(files);
      setSuccess(`Successfully loaded ${data.name} repository!`);
      
      // Auto-expand first level
      const firstLevel = new Set(files.filter(f => f.type === 'folder').map(f => f.path));
      setExpandedFolders(firstLevel);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // Handle README generation
  const handleGenerateReadme = async () => {
    if (!repoData) {
      setError('Please load a repository first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const readme = await generateReadmeWithGemini(repoData, repoFiles, selectedFiles);
      setGeneratedReadme(readme);
      setSuccess('README generated successfully with Gemini AI! 🎉');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle folder expansion
  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Toggle file selection
  const toggleFileSelection = (path) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type === 'folder') return <Folder className="w-4 h-4 text-blue-400" />;
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <Database className="w-4 h-4 text-green-400" />;
      case 'html':
        return <Code className="w-4 h-4 text-orange-400" />;
      case 'css':
        return <Zap className="w-4 h-4 text-pink-400" />;
      case 'png':
      case 'jpg':
      case 'svg':
      case 'ico':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  // Render file tree
  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700/50 cursor-pointer rounded transition-colors ${
            selectedFiles.has(item.path) ? 'bg-slate-700' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              toggleFileSelection(item.path);
            }
          }}
        >
          {item.type === 'folder' && (
            expandedFolders.has(item.path) ? 
              <ChevronDown className="w-4 h-4 text-slate-400" /> : 
              <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          {getFileIcon(item)}
          <span className="text-sm text-slate-200 flex-1">{item.name}</span>
          {item.type === 'file' && selectedFiles.has(item.path) && (
            <Check className="w-4 h-4 text-green-400" />
          )}
        </div>
        {item.type === 'folder' && expandedFolders.has(item.path) && item.children && (
          <div>
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReadme);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  // Download README
  const downloadReadme = () => {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
  };

  // Render markdown preview
  const renderMarkdownPreview = (markdown) => {
    if (!markdown) return '<p class="text-slate-400">No README generated yet. Click "Generate README with AI" to create one.</p>';
    
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mb-3 mt-6 text-slate-800">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-semibold mb-4 mt-8 text-slate-900">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6 mt-8 text-slate-900">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4 border border-slate-200" />');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto border border-slate-700"><code class="text-sm font-mono">$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-slate-900 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2 text-slate-700">$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-2 text-slate-700">$2</li>');
    
    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-8 border-slate-300" />');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600">$1</blockquote>');
    
    return html;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-lg">
              <Sparkles className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gemini README Generator</h1>
              <p className="text-sm text-slate-400">AI-powered GitHub documentation</p>
            </div>
          </div>

          {generatedReadme && (
            <div className="flex items-center gap-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={downloadReadme}
                className="px-4 py-2 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00C9FF]/20 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
        </div>

        {/* GitHub URL Input */}
        <div className="mt-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetchRepository()}
                className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C9FF]"
              />
            </div>
            <button
              onClick={handleFetchRepository}
              disabled={isLoadingRepo || !githubUrl}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingRepo ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  Fetch Repo
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-300">
              <Check className="w-4 h-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-185px)]">
        {/* Left Sidebar - Repository Files */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          {repoData ? (
            <>
              {/* Repository Info */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  {repoData.is_private ? (
                    <Lock className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-400" />
                  )}
                  <h2 className="font-semibold text-lg">{repoData.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mb-3">{repoData.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{repoData.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{repoData.default_branch}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>{repoData.language}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateReadme}
                  disabled={isGenerating}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate README with AI
                    </>
                  )}
                </button>
              </div>

              {/* File Tree */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">Files</h3>
                  <span className="text-xs text-slate-500">
                    {selectedFiles.size} selected
                  </span>
                </div>
                {repoFiles.length > 0 ? (
                  renderFileTree(repoFiles)
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files found</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500 px-8">
                <Github className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Enter a GitHub URL above to load repository</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - README Display */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {generatedReadme ? (
            <>
              {/* View Mode Toggle */}
              <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00C9FF]" />
                  <span className="font-semibold">README.md</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-4 py-1.5 rounded-md transition-all text-sm font-medium ${
                      viewMode === 'preview'
                        ? 'bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('markdown')}
                    className={`px-4 py-1.5 rounded-md transition-all text-sm font-medium ${
                      viewMode === 'markdown'
                        ? 'bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-4 h-4 inline mr-1" />
                    Markdown
                  </button>
                </div>
              </div>

              {/* Content Display */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'preview' ? (
                  <div className="p-8 bg-slate-900">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-8 min-h-[600px]">
                      <div 
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(generatedReadme) }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                        <code>{generatedReadme}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-full mb-6">
                  <Sparkles className="w-10 h-10 text-slate-900" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Ready to Generate</h3>
                <p className="text-slate-400 mb-6">
                  {repoData 
                    ? 'Click "Generate README with AI" in the sidebar to create your documentation'
                    : 'Load a GitHub repository to get started'}
                </p>
                {!repoData && (
                  <div className="space-y-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2 justify-center">
                      <Github className="w-4 h-4" />
                      <span>Supports both public and private repositories</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Sparkles className="w-4 h-4" />
                      <span>AI-powered with Gemini</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <FileText className="w-4 h-4" />
                      <span>Professional documentation in seconds</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;