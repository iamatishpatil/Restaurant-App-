import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
// Make sure to download your service account key and save it as firebase-service-account.json in the root directory
const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-project-id.appspot.com', // Replace with your Firebase Storage Bucket
  });
  console.log('Firebase Admin initialized successfully.');
} else {
  console.warn('Firebase Service Account file not found. Firebase features will be limited.');
}

export const bucket = admin.apps.length > 0 ? admin.storage().bucket() : null;
export const messaging = admin.apps.length > 0 ? admin.messaging() : null;
