import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  throw new Error('API key is missing. Please contact the administrator.');
}
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use GitHub URL to extract owner and repo name
function GitHubUrlInfo(repoUrl) {
  let url;
  try {
    url = new URL(repoUrl);
    console.log('Parsed URL:', url);
  } catch (error) {
    throw new Error('Invalid repository URL format');
  }
  if (url.hostname !== 'github.com') {
    throw new Error('Only GitHub repositories are supported');
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2) {
    throw new Error('Invalid GitHub repository URL');
  }

  const owner = pathParts[0];
  const repo = pathParts[1].replace(/\.git$/, ''); // Remove .git if present

  return { owner, repo };
}

// Fetch repository metadata from GitHub API
async function fetchRepoData(owner, repo) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'README-Generator'
      }
    });
    console.log('GitHub API Response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Repository not found');
    }
    throw new Error('Failed to fetch repository data');
  }
}

// Create a simple prompt for Gemini
function buildPrompt(repoData, tone = 'professional') {
  const prompt = `You are a expert Readme generator AI.
  Create a professional README.md file for this GitHub repository.

Repository Information:
- Name: ${repoData.name}
- Description: ${repoData.description || 'No description provided'}
- Language: ${repoData.language || 'Not specified'}
- Stars: ${repoData.stargazers_count || 0}
- Forks: ${repoData.forks_count || 0}
- License: ${repoData.license?.name || 'No license specified'}
- Homepage: ${repoData.homepage || 'None'}
- Topics: ${repoData.topics?.join(', ') || 'None'}
- Created: ${repoData.created_at}
- Last Updated: ${repoData.updated_at}

Instructions:
- Write in a ${tone} tone
- Add a Project title and description, features
- Installation instructions
- Tech Stack used
- Project structure
- Include license information
- Add badges for stars, forks, and license if applicable
- Make it well-structured with proper markdown formatting
- Keep it concise but informative

Generate ONLY the markdown content for the README.md file:`;

  return prompt;
}

// Generate README using Gemini AI
async function generateWithGemini(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
   const result = await model.generateContent(prompt);
    const text = result.response.text();

    
    return text;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate README with AI');
  }
}

// Main function to generate README for a repository
export async function generateReadmeForRepo({ repoUrl, tone = 'professional' }) {
  try {
    // Get the GitHub URL Info
    const { owner, repo } = GitHubUrlInfo(repoUrl);
    
    // Fetch repository data
    const repoData = await fetchRepoData(owner, repo);
    
    // Build prompt for AI
    const prompt = buildPrompt(repoData, tone);
    
    // Generate README with Gemini
    const markdown = await generateWithGemini(prompt);
    console.log('Generated README Markdown:', markdown);
    console.log('Repository URL:', repoUrl);
    
    return {
      markdown,
      repo: {
        owner,
        name: repo,
        url: repoData.html_url
      },
      meta: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count
      }
    };
  } catch (error) {
    console.error('Generate README Error:', error);
    throw error;
  }
}