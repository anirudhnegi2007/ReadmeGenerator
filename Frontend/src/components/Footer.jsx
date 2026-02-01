import React from 'react'

const Footer = () => {
  return (<>
    {/* Footer */}
      <footer className="border-t border-slate-700 py-8 bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 ReadmeGenerator. Created by <a href="https://github.com/anirudhnegi2007" target="_blank" className="text-slate-300 hover:text-white">Anirudh Negi</a>.</p>
          <p className="mt-2">Licensed under MIT • Powered by Google Gemini</p>
        </div>
      </footer>
      </>
  )
}

export default Footer;