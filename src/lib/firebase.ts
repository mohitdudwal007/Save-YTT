import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with custom database ID if specified in config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface ConversionRecord {
  id?: string;
  videoId: string;
  title: string;
  durationFormatted?: string;
  downloadUrl?: string;
  timestamp: string;
}

// Log a conversion in Firestore
export async function logConversionToFirebase(record: Omit<ConversionRecord, 'timestamp'>) {
  try {
    const conversionsRef = collection(db, 'conversions');
    await addDoc(conversionsRef, {
      ...record,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log conversion to Firebase:', error);
  }
}

// Fetch recent conversions
export async function getRecentConversionsFromFirebase(maxLimit = 10): Promise<ConversionRecord[]> {
  try {
    const conversionsRef = collection(db, 'conversions');
    const q = query(conversionsRef, orderBy('timestamp', 'desc'), limit(maxLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ConversionRecord[];
  } catch (error) {
    console.error('Failed to fetch conversions from Firebase:', error);
    return [];
  }
}

// Store app secret config in Firebase
export async function saveSecretConfigToFirebase(apiKey: string, apiHost: string) {
  try {
    const configRef = doc(db, 'appConfig', 'rapidapi');
    await setDoc(configRef, {
      rapidApiKey: apiKey,
      rapidApiHost: apiHost,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Failed to save config to Firebase:', error);
    return false;
  }
}

// Get app secret config from Firebase
export async function getSecretConfigFromFirebase(): Promise<{ rapidApiKey?: string; rapidApiHost?: string } | null> {
  try {
    const configRef = doc(db, 'appConfig', 'rapidapi');
    const snapshot = await getDoc(configRef);
    if (snapshot.exists()) {
      return snapshot.data() as { rapidApiKey?: string; rapidApiHost?: string };
    }
  } catch (error) {
    console.error('Failed to read config from Firebase:', error);
  }
  return null;
}
