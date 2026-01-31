import React from 'react';
import { Zap, Sparkles, Shield, Users, Github, ArrowRight } from 'lucide-react';
// import geminiLogo from './assets/gemini-color.svg'; // Uncomment if you have the SVG

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-7 py-7 flex justify-between items-center">
          <a href="#" className="text-4xl font-bold text-white mb-2">README Generator</a>
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-slate-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition">How it Works</a>
            <a href="https://github.com/anirudhnegi2007/ReadmeGenerator" target="_blank" className="text-slate-400 hover:text-white transition">GitHub</a>
            <a
              href="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-semibold rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              Login with GitHub
            </a>
          </div>
          <button className="md:hidden text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            GitHub README Generator
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto">
            Generate professional, beautiful README files for your GitHub projects in seconds.
            Powered by Google Gemini AI with secure support for private repositories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-semibold rounded-xl text-lg hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-xl flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} />
            </a>
            <a
              href="https://github.com/anirudhnegi2007/ReadmeGenerator"
              target="_blank"
              className="px-8 py-4 border border-slate-600 rounded-xl text-lg hover:bg-slate-800 transition flex items-center gap-2"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-8 shadow-2xl hover:border-slate-400 hover:scale-105 transition">
              <Zap className="w-12 h-12 text-cyan-400 mb-5" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast Generation</h3>
              <p className="text-slate-400">Create polished READMEs in seconds instead of hours.</p>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-8 shadow-2xl hover:border-slate-400 hover:scale-105 transition">
              <Sparkles className="w-12 h-12 text-emerald-400 mb-5" />
              <h3 className="text-xl font-semibold mb-3">Gemini AI Powered</h3>
              <p className="text-slate-400">Leverage Google's Gemini to generate high-quality, contextual documentation.</p>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-8 shadow-2xl hover:border-slate-400 hover:scale-105 transition">
              <Shield className="w-12 h-12 text-orange-400 mb-5" />
              <h3 className="text-xl font-semibold mb-3">Private Repository Support</h3>
              <p className="text-slate-400">Secure GitHub OAuth login to generate READMEs for private repos.</p>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-8 shadow-2xl hover:border-slate-400 hover:scale-105 transition">
              <Users className="w-12 h-12 text-purple-400 mb-5" />
              <h3 className="text-xl font-semibold mb-3">Team Collaboration Ready</h3>
              <p className="text-slate-400">Perfect for open-source projects and team documentation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-full flex items-center justify-center text-slate-900 font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Login with GitHub</h3>
                <p className="text-slate-400">Secure OAuth authentication to access public and private repositories.</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-full flex items-center justify-center text-slate-900 font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Paste Repository URL</h3>
                <p className="text-slate-400">Enter your GitHub repo URL (e.g., https://github.com/username/repo).</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-full flex items-center justify-center text-slate-900 font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Generate with Gemini AI</h3>
                <p className="text-slate-400">Click Generate — AI analyzes your repo and creates a professional README.</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] rounded-full flex items-center justify-center text-slate-900 font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Preview & Download</h3>
                <p className="text-slate-400">Preview the generated markdown and download the final README.md file.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Projects?</h2>
          <p className="text-xl text-slate-400 mb-10">Start generating professional READMEs today — free and secure.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-slate-900 font-semibold rounded-xl text-xl hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-xl"
          >
            Get Started Now
            <ArrowRight size={24} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 ReadmeGenerator. Created by <a href="https://github.com/anirudhnegi2007" target="_blank" className="text-slate-300 hover:text-white">Anirudh Negi</a>.</p>
          <p className="mt-2">Licensed under MIT • Powered by Google Gemini</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;