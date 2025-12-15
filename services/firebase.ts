import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { UserProfile, ADMIN_EMAIL } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBidnrYT-PtINMDhyP6M28tUkg98lEpBm4",
  authDomain: "lofi-with-yt.firebaseapp.com",
  projectId: "lofi-with-yt",
  storageBucket: "lofi-with-yt.firebasestorage.app",
  messagingSenderId: "621013466534",
  appId: "1:621013466534:web:ec6bff0ca7ea03cc02e367"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- Auth Services ---

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  // Allow errors (like auth/unauthorized-domain) to propagate to the UI
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  // Check if user exists in Firestore, if not create basic profile
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: "user", // Default role
      createdAt: Date.now()
    });
  }

  return user;
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().role;
  }
  return null;
};

// --- Storage Services ---

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteFile = async (url: string) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn("Error deleting file:", error);
  }
};

// --- Data Services ---

// Generic fetcher
export const fetchCollection = async <T>(collectionName: string): Promise<T[]> => {
  const q = query(collection(db, collectionName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const fetchSettings = async () => {
  const docRef = doc(db, "settings", "main");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : { youtube: "", telegram: "" };
};

export const checkIsAdmin = async (user: User | null): Promise<boolean> => {
  if (!user || !user.email) return false;
  if (user.email !== ADMIN_EMAIL) return false;
  
  const role = await getUserRole(user.uid);
  return role === 'admin';
};