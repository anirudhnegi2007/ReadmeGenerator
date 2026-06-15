// code in repo controller 
// Fetch and build repository file tree
//get repository data from GitHub API
// fetch privete repo using token if available
// Build prompt for AI
// 

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


  export const getUserRepos= async (req, res) => {
    try{
      const  respone=  await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${req.user.githubAccessToken}`
        }
      });
      res.json(respone.data);
    }catch(error){
      console.error("Error fetching user repos",error);
      res.status(500).json({error:"Failed to fetch user repositories"});
    }
  };



  export const generateReadmeForRepo = async (req, res) => {
    try {
      console.log('Incoming body:', req.body);
  
      const { repoUrl, tone, includeBadges } = req.body || {};
      if (!repoUrl || typeof repoUrl !== 'string') {
        return res.status(400).json({ error: 'repoUrl is required and must be a string' });
      }
  
      const result = await generateReadmeForRepo({ repoUrl, tone, includeBadges: !!includeBadges });
      res.json(result);
    } catch (err) {
      console.error('Error generating README:', err);
      if (err.message.includes('Repository not found')) {
        return res.status(404).json({ error: err.message });
      }
      console.log(  'Error message:', err.message);
      
      if (err.message.includes('API key is missing') || err.message.includes('Failed to generate README with AI')) {
        return res.status(500).json({ error: 'AI service configuration error' });
      }
      if (err.message.includes('rate limit')) {
        return res.status(403).json({ error: 'GitHub API rate limit exceeded' });
      }
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
    
  