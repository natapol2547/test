import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import type { Readable } from "svelte/motion";
import { derived } from "svelte/store";
import { docStore, userStore } from "sveltefire";
const firebaseConfig = {
  apiKey: "AIzaSyDLH0XQfQqWgyt7aTyUoJDMcoc21QEaikY",
  authDomain: "beginbiz-195d8.firebaseapp.com",
  projectId: "beginbiz-195d8",
  storageBucket: "beginbiz-195d8.appspot.com",
  messagingSenderId: "654301606786",
  appId: "1:654301606786:web:a1354b7814d1766928959b",
  measurementId: "G-CP8HL920VZ"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

let user = userStore(auth);

export interface UserData {
	photoURL: string;
	username: string;
  bio: string;
  published: boolean;
}

export const userData: Readable<UserData | null> = derived(
	user,
	($user, set) => {
		if ($user) {
			return docStore<UserData>(firestore, `users/${$user.uid}`).subscribe(set);
		} else {
			set(null);
		}
	}
);