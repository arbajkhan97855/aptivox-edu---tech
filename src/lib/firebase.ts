import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Pass firestoreDatabaseId as second argument for named Firestore database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

let secondaryAuthInstance: ReturnType<typeof getAuth> | null = null;

function getSecondaryAuth() {
  if (!secondaryAuthInstance) {
    const existingApp = getApps().find((a) => a.name === 'studentAuthProvisioner');
    const provisionApp = existingApp || initializeApp(firebaseConfig, 'studentAuthProvisioner');
    secondaryAuthInstance = getAuth(provisionApp);
  }
  return secondaryAuthInstance;
}

export function buildStudentAliasEmail(studentCode: string): string {
  const slug = String(studentCode || 'student')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return `${slug}.${suffix}@student.aptivox.app`;
}

export async function createSecondaryAuthUser(email: string, password: string): Promise<string> {
  const secAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secAuth, email, password);
  const uid = cred.user.uid;
  await signOut(secAuth).catch(() => {});
  return uid;
}

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
