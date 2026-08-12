import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Initialize and seed default RapidAPI secrets into Firebase Firestore if not present
 */
export async function syncSecretsToFirebase(rapidApiKey: string, rapidApiHost: string) {
  try {
    const configDocRef = doc(db, 'appConfig', 'rapidapi');
    const docSnap = await getDoc(configDocRef);
    
    if (!docSnap.exists()) {
      console.log('[Firebase] Seeding initial RapidAPI secrets to Firestore database...');
      await setDoc(configDocRef, {
        rapidApiKey: rapidApiKey,
        rapidApiHost: rapidApiHost,
        updatedAt: new Date().toISOString()
      });
      console.log('[Firebase] RapidAPI secrets safely saved in Firestore document appConfig/rapidapi.');
    } else {
      console.log('[Firebase] RapidAPI secrets document exists in Firestore.');
    }
  } catch (err: any) {
    console.error('[Firebase] Failed to sync secrets to Firestore:', err.message || err);
  }
}

/**
 * Log conversion event to Firestore database
 */
export async function logConversionToFirestore(data: { videoId: string; title: string; durationFormatted?: string; downloadUrl?: string }) {
  try {
    const conversionsRef = collection(db, 'conversions');
    await addDoc(conversionsRef, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`[Firebase] Conversion logged for video ID: ${data.videoId}`);
  } catch (err: any) {
    console.error('[Firebase] Failed to log conversion:', err.message || err);
  }
}

/**
 * Get recent conversion history from Firestore
 */
export async function getRecentConversionsFromFirestore(maxItems = 10) {
  try {
    const conversionsRef = collection(db, 'conversions');
    const q = query(conversionsRef, orderBy('timestamp', 'desc'), limit(maxItems));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err: any) {
    console.error('[Firebase] Failed to get conversion history:', err.message || err);
    return [];
  }
}
