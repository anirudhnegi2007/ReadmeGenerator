import { getAuth } from 'firebase-admin/auth';

// POST /auth/login
// Expects body: { firebaseToken, githubAccessToken }
export const loginUser = async (req, res) => {
  try {
    const { firebaseToken, githubAccessToken } = req.body || {};

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is missing' });
    }
    if (!githubAccessToken) {
      return res.status(400).json({ message: 'GitHub access token is missing' });
    }

    // Verify Firebase token
    const user = await getAuth().verifyIdToken(firebaseToken);
    if (!user) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    // Minimal success response (you can extend later to persist tokens if desired)
    return res.status(200).json({
      message: 'Login successful',
      uid: user.uid,
      email: user.email || null,
      githubAccessToken,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /auth/register
// Expects body: { firebaseToken, githubAccessToken }
export const registerUser = async (req, res) => {
  try {
    const { firebaseToken, githubAccessToken } = req.body || {};

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is missing' });
    }
    if (!githubAccessToken) {
      return res.status(400).json({ message: 'GitHub access token is missing' });
    }

    const user = await getAuth().verifyIdToken(firebaseToken);
    if (!user) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    // Firebase user already exists/verified by token.
    // If you want to create a Firestore record or store GitHub token, add that here.

    return res.status(201).json({
      message: 'Register successful',
      uid: user.uid,
      email: user.email || null,
      githubAccessToken,
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
