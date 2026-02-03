import {auth } from 'firebase-admin/app';
// middleware to verfiy firebase token
export async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (!idToken) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        req.user = decodedToken;
        console.log('Firebase token verified :', decodedToken.uid);
        next();
    } catch (error) {
        console.error('firebase token error :', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid Firebase token' });
    }   
}
