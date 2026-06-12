export const parseGitHubUrl = (url) => {
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

export const getLanguageFromExt = (ext) => {
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
  return map[ext?.toLowerCase()] || 'unknown';
};

export const fetchRepositoryData = async (owner, repo, token) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) {
    if (res.status === 404 && !token) {
      throw new Error('Repository not found. If this is a private repository, please login with GitHub first.');
    }
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

export const fetchRepositoryFiles = async (owner, repo, branch, token) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
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

export const analyzeRepository = (files) => {
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

  if (stats.languages.has('jsx') || stats.languages.has('tsx')) {
    stats.frameworks.add('React');
  }

  return stats;
};

export const generateReadmeWithGemini = async (repoData, repoFiles, selectedFilePaths, firebaseToken, githubToken) => {
  const repoUrl = `https://github.com/${repoData.owner}/${repoData.name}`;
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (firebaseToken) {
      headers['Authorization'] = `Bearer ${firebaseToken}`;
    }
    if (githubToken) {
      headers['x-github-token'] = githubToken;
    }
    const response = await fetch('http://localhost:5000/services/generate', {
      method: 'POST',
      headers,
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
    throw new Error(error.message || 'Failed to generate README with backend');
  }
};
