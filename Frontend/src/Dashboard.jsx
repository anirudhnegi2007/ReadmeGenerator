import React, { useState, useEffect } from 'react';
import { 
  Github, 
  FileText,
  Download,
  Copy,
  Sparkles,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Loader,
  GitBranch,
  Star
} from 'lucide-react';
import { loginWithGitHub, logout } from './services/authService.js';
import { auth } from './services/Firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import ReviewSection from './components/ReviewSection.jsx';
import FileTree from './components/FileTree.jsx';
import { 
  parseGitHubUrl, 
  fetchRepositoryData, 
  fetchRepositoryFiles, 
  generateReadmeWithGemini 
} from './services/githubService.js';

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
  
  // UI State
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Authentication State
  const [user, setUser] = useState(null);
  const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken') || null);
  const [firebaseToken, setFirebaseToken] = useState(localStorage.getItem('firebaseToken') || null);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const idToken = await currentUser.getIdToken();
        setFirebaseToken(idToken);
        localStorage.setItem('firebaseToken', idToken);
      } else {
        setUser(null);
        setGithubToken(null);
        setFirebaseToken(null);
        localStorage.removeItem('githubToken');
        localStorage.removeItem('firebaseToken');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setSuccess(null);
    try {
      const { firebaseUser, githubAccessToken } = await loginWithGitHub();
      const idToken = await firebaseUser.getIdToken();
      setUser(firebaseUser);
      setGithubToken(githubAccessToken);
      setFirebaseToken(idToken);
      localStorage.setItem('githubToken', githubAccessToken);
      localStorage.setItem('firebaseToken', idToken);
      setSuccess('Successfully authenticated with GitHub!');
    } catch (err) {
      console.error(err);
      setError('GitHub Authentication failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setSuccess(null);
    try {
      await logout();
      setUser(null);
      setGithubToken(null);
      setFirebaseToken(null);
      localStorage.removeItem('githubToken');
      localStorage.removeItem('firebaseToken');
      setSuccess('Logged out successfully.');
    } catch (err) {
      console.error(err);
      setError('Logout failed.');
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
      const data = await fetchRepositoryData(parsed.owner, parsed.repo, githubToken);
      const files = await fetchRepositoryFiles(parsed.owner, parsed.repo, data.default_branch, githubToken);
      
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
      const readme = await generateReadmeWithGemini(
        repoData, 
        repoFiles, 
        selectedFiles, 
        firebaseToken, 
        githubToken
      );
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

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReadme);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2050);
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <Github className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm font-medium hidden md:inline">{user.displayName || user.email || 'Authenticated'}</span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-xs font-semibold rounded-md transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Github className="w-4 h-4" />
                Login with GitHub
              </button>
            )}

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
                  <FileTree 
                    items={repoFiles}
                    expandedFolders={expandedFolders}
                    selectedFiles={selectedFiles}
                    onToggleFolder={toggleFolder}
                    onToggleFile={toggleFileSelection}
                  />
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <Loader className="w-12 h-12 mx-auto mb-2 opacity-50 animate-spin" />
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
            <ReviewSection 
              readme={generatedReadme} 
              isDashboard={true} 
              onCopy={copyToClipboard} 
              onDownload={downloadReadme} 
            />
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