import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_USE_EMULATOR,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';
import {
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth/react-native';
import { inMemoryPersistence } from 'firebase/auth';
import { initializeFirestore, setLogLevel, connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (__DEV__) {
  setLogLevel('silent');
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const persistence =
  Constants.appOwnership === 'expo'
    ? inMemoryPersistence
    : getReactNativePersistence(AsyncStorage);

export const auth = initializeAuth(app, { persistence });
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// connect to local Firebase emulators only in development on native clients (not in Expo Go)
if (__DEV__ && FIREBASE_USE_EMULATOR === 'true' && Constants.appOwnership !== 'expo') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export const actionCodeSettings = {
  url: `https://${FIREBASE_AUTH_DOMAIN}`,
  handleCodeInApp: true,
};
