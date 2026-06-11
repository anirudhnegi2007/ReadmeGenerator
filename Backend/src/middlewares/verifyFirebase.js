import { getAuth } from 'firebase-admin/auth';

// middleware to verfiy firebase token
export async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        req.user = decodedToken;
        console.log('Firebase token verified :', decodedToken.uid);
        next();
    } catch (error) {
        console.error('firebase token error :', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid Firebase token' });
    }   
}
