import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwl9YfSeICMJBKnngNT-iWKij-Ucy3wmg",
  authDomain: "dvarix--realty.firebaseapp.com",
  projectId: "dvarix--realty",
  storageBucket: "dvarix--realty.firebasestorage.app",
  messagingSenderId: "94353466975",
  appId: "1:94353466975:web:b958d5aea99b38ff3dddea",
  measurementId: "G-V38ZNLBXT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const code = error?.code || "unknown";
  const message = error?.message || String(error);

  const errInfo = {
    code,
    message,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    }
  };

  console.error("[FIRESTORE ERROR DETECTED] info:", JSON.stringify(errInfo));
  console.error("[FIRESTORE ERROR DETECTED] original:", error);

  // Construct a cleaner error but preserve the original code and message
  const newErr = new Error(message);
  (newErr as any).code = code;
  (newErr as any).originalError = error;
  (newErr as any).info = errInfo;
  throw newErr;
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connections initialized successfully.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Please check your Firebase configuration or network. Client is offline.");
    } else {
      console.log("Firebase connection response parsed correctly:", error?.message || error);
    }
  }
}

testConnection();
