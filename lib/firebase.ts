import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleWorkspaceProvider = new GoogleAuthProvider();
// Google Workspace Scopes
googleWorkspaceProvider.addScope("https://www.googleapis.com/auth/drive");
googleWorkspaceProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleWorkspaceProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
