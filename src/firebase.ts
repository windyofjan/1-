import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { VideoRequest, QuarterConfig, MemberDeduction } from './types';

// 1. Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Error handling conforming to Firebase Security Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is currently in offline cache mode.');
    }
  }
}

// 4. Auth helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-Out Error:', error);
  }
}

// Clean object helper to deeply strip undefined values before Firestore writes
function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  function deepClean(val: any): any {
    if (val === undefined) return null;
    if (Array.isArray(val)) {
      return val.map((item) => (typeof item === 'object' && item !== null ? deepClean(item) : item));
    }
    if (typeof val === 'object' && val !== null) {
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          clean[k] = typeof v === 'object' && v !== null ? deepClean(v) : v;
        }
      }
      return clean;
    }
    return val;
  }
  return deepClean(obj) as T;
}

export function normalizeQuarter(q: Partial<QuarterConfig>): QuarterConfig {
  const workingDays = typeof q.workingDays === 'number' ? q.workingDays : 60;
  const multiplier = typeof q.multiplier === 'number' ? q.multiplier : 4.5;
  const baseCapacityDays = typeof q.baseCapacityDays === 'number' ? q.baseCapacityDays : Math.round(workingDays * multiplier);

  const defaultMembers: MemberDeduction[] = [
    { name: '민규', adminDays: 30, vacationDays: 15 },
    { name: '신혜', adminDays: 30, vacationDays: 15 },
    { name: '유진', adminDays: 25, vacationDays: 15 },
    { name: '승아', adminDays: 25, vacationDays: 15 },
    { name: '외주', adminDays: 40, vacationDays: 0 },
  ];

  const rawMembers: MemberDeduction[] = Array.isArray(q.memberDeductions) && q.memberDeductions.length > 0
    ? q.memberDeductions
    : defaultMembers;

  const memberDeductions: MemberDeduction[] = rawMembers.map((m) => ({
    name: String(m.name || ''),
    adminDays: Number(m.adminDays) || 0,
    vacationDays: Number(m.vacationDays) || 0,
    ...(m.note ? { note: String(m.note) } : {}),
    ...(m.id ? { id: String(m.id) } : {}),
  }));

  const totalDeductions = memberDeductions.reduce(
    (sum, m) => sum + (Number(m.adminDays) || 0) + (Number(m.vacationDays) || 0),
    0
  );

  const totalDays = typeof q.totalDays === 'number'
    ? q.totalDays
    : Math.max(0, baseCapacityDays - totalDeductions);

  return {
    id: q.id || '2027-Q1',
    name: q.name || '2027년 1분기 (1월~3월)',
    totalDays,
    startDate: q.startDate || '2027-01-01',
    endDate: q.endDate || '2027-03-31',
    workingDays,
    multiplier,
    baseCapacityDays,
    totalDeductionDays: totalDeductions,
    memberDeductions,
    ...(q.description ? { description: q.description } : {}),
  };
}

// 5. Realtime Subscriptions
export function subscribeToRequests(
  onUpdate: (requests: VideoRequest[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'requests';
  const requestsCol = collection(db, path);
  return onSnapshot(
    requestsCol,
    (snapshot) => {
      const items: VideoRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VideoRequest;
        items.push({
          ...data,
          id: data.id || docSnap.id,
        });
      });
      // Sort strictly in registration sequence (REQ-001, REQ-002...)
      items.sort((a, b) => {
        const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Firestore requests listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToQuarters(
  onUpdate: (quarters: QuarterConfig[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'quarters';
  const quartersCol = collection(db, path);
  return onSnapshot(
    quartersCol,
    (snapshot) => {
      const items: QuarterConfig[] = [];
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data() as QuarterConfig;
        items.push(normalizeQuarter(raw));
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      console.error('Firestore quarters listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 6. Firestore Mutations
export async function saveRequestToFirestore(request: VideoRequest): Promise<void> {
  const path = `requests/${request.id}`;
  try {
    const cleanData = sanitizePayload(request);
    await setDoc(doc(db, 'requests', request.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateRequestInFirestore(
  id: string,
  updates: Partial<VideoRequest>
): Promise<void> {
  const path = `requests/${id}`;
  try {
    const cleanUpdates = sanitizePayload(updates);
    await updateDoc(doc(db, 'requests', id), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteRequestFromFirestore(id: string): Promise<void> {
  const path = `requests/${id}`;
  try {
    await deleteDoc(doc(db, 'requests', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveQuarterToFirestore(quarter: QuarterConfig): Promise<void> {
  const path = `quarters/${quarter.id}`;
  try {
    const cleanData = sanitizePayload(quarter);
    await setDoc(doc(db, 'quarters', quarter.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 7. Initialize Database with default mock data if completely empty on first launch
export async function seedInitialFirestoreData(
  defaultRequests: VideoRequest[],
  defaultQuarters: QuarterConfig[]
): Promise<boolean> {
  try {
    const quartersSnap = await getDocs(collection(db, 'quarters'));
    const requestsSnap = await getDocs(collection(db, 'requests'));

    const existingReqIds = new Set<string>();
    requestsSnap.forEach((docSnap) => existingReqIds.add(docSnap.id));

    const existingQuarterIds = new Set<string>();
    quartersSnap.forEach((docSnap) => existingQuarterIds.add(docSnap.id));

    const batch = writeBatch(db);
    let shouldCommit = false;

    for (const q of defaultQuarters) {
      if (!existingQuarterIds.has(q.id)) {
        batch.set(doc(db, 'quarters', q.id), sanitizePayload(q));
        shouldCommit = true;
      }
    }

    for (const r of defaultRequests) {
      if (!existingReqIds.has(r.id)) {
        batch.set(doc(db, 'requests', r.id), sanitizePayload(r));
        shouldCommit = true;
      }
    }

    if (shouldCommit) {
      console.log('Seeding missing default data to Firestore...');
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Could not seed initial Firestore data (might be offline or permission restricted):', error);
    return false;
  }
}
