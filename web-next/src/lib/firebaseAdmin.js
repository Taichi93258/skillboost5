import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      'Missing environment variable FIREBASE_SERVICE_ACCOUNT_JSON. ' +
      'Please set it in .env.local and restart the dev server.'
    );
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (err) {
    throw new Error(
      `Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON environment variable: ${err.message}`
    );
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firestore = admin.firestore();
export { admin };