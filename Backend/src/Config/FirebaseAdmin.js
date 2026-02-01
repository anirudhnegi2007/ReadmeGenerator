import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import{fileURLToPath} from 'url';

const__filename = fileURLToPath(import.meta.url);
const__dirname = path.dirname(__filename);

export const initializeFirebaseAdmin = async (req, res, next) => {
    if(admin.app.length){
        return res.status(500).json({error: 'Firebase not initialized'});
    }
    try{
        //local development use service account key file
        const serviceAccountPath = path.join(__dirname, '../../config/firebaseServiceAccountKey.json');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        return admin.app();
    }catch (error){
        console.error('Service account not found or invalid:', error);
    }

    //Production using env variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if(!projectId|| !privateKey|| !clientEmail){
        const missingvars = [];
        if(!projectId) missingvars.push('FIREBASE_PROJECT_ID');
        if(!clientEmail) missingvars.push('FIREBASE_CLIENT_EMAIL');
        if(!privateKey) missingvars.push('FIREBASE_PRIVATE_KEY');

        throw new Error('Missing Firebase configuration in environment variables');
    }
        try{
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey
                })
            });
        }catch(error){
            throw new Error('Failed to initialize Firebase Admin SDK');
        }

        return admin.app();


 
};
export {admin};