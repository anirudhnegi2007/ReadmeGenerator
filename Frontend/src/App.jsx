import { useState } from 'react';
import './App.css';
import { Eye, FileText } from 'lucide-react';
import geminiLogo from './assets/gemini-color.svg';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if URL is a valid GitHub repository URL
  function isValidGithubUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname === 'github.com' && u.pathname.split('/').filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  }

  
// Generate README using Gemini AI through backend
async function generateReadme() {
  setError('');

  if (!isValidGithubUrl(repoUrl)) {
    setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
    return;
  }

  try {
    setLoading(true);
    setReadmeContent(''); // Clear previous content

    const response = await fetch('http://localhost:5050/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoUrl,
        tone: 'professional',
        includeBadges: true,
      }),
    });

    const data = await response.json(); // ✅ Only called once

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate README');
    }

    setReadmeContent(data.markdown);
  } catch (err) {
    console.error('Error:', err);
    setError(err.message || 'Failed to generate README. Please try again.');
  } finally {
    setLoading(false);
  }
}


 

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          
          <h1 className="text-3xl font-bold text-white mb-4">
            GitHub README Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Generate professional README files for your GitHub projects.
            Add your repository and generate documentation with AI assistance.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 mb-8 shadow-2xl">
          {/* Repository Input Section */}
          <div className="mb-8">
            <label htmlFor="repo-url" className="block text-sm font-medium text-slate-300 mb-3">
              Repository URL
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Gemini Integration Section */}
          <div className="mb-8 p-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  
                 <img src={geminiLogo} alt="Google Gemini logo" />
                  
                  AI README Generation
                </h3>
                <p className="text-slate-400">
                  Leverage Google Gemini to create detailed README content from your repository data.
                </p>
              </div>
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={generateReadme}
                disabled={!isValidGithubUrl(repoUrl) || loading}
              >
                {loading ? 'Generating...' : 'Generate README'}
              </button>
            </div>
          </div>

          {/* README Preview Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            
              <Eye size={30} />
              
              Preview
            </h3>
            <div className="border border-slate-600 rounded-lg p-4 min-h-[300px] bg-slate-900">
              {readmeContent ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-300">
                  {readmeContent}
                </pre>
              ) : (
                <div className="text-center text-slate-500 py-12">
                  <div className="inline-block p-3 bg-slate-800 rounded-full mb-4">
                   <FileText size={40} />

                  </div>
                  <p className="text-slate-400">Your README will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

       
      </div>
    </div>
  )
}

export default App
