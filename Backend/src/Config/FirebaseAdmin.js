import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';

export const initializeFirebaseAdmin = async () => {
    if (getApps().length) {
        return getApp();
    }
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.VITE_FIREBASE_CLIENT_EMAIL;
        let privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.VITE_FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');

        if (!projectId || !privateKey || !clientEmail) {
            const missingvars = [];
            if (!projectId) missingvars.push('FIREBASE_PROJECT_ID');
            if (!clientEmail) missingvars.push('FIREBASE_CLIENT_EMAIL');
            if (!privateKey) missingvars.push('FIREBASE_PRIVATE_KEY');

            throw new Error('Missing Firebase configuration in environment variables');
        }
        try {
            initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey
                })
            });
        } catch (error) {
            console.error('Inner initialization error:', error);
            throw new Error('Failed to initialize Firebase Admin SDK: ' + error.message);
        }

        return getApp();
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw error;
    }
};