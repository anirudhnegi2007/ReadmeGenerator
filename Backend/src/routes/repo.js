
// In routes/repo.js
import { Router } from 'express';
import { generateReadmeForRepo } from '../services/readmeService.js';
import dotenv from 'dotenv';
  
dotenv.config();
const router = Router();


router.post('/generate', async (req, res) => {
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
});

export default router;