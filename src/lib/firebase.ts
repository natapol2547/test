import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import type { Readable } from "svelte/motion";
import { derived } from "svelte/store";
import { docStore, userStore } from "sveltefire";
const firebaseConfig = {
  apiKey: "AIzaSyARBVL5eHA_tNiMlA3SVEabdaxD3FS1YI8",
  authDomain: "wahh-a2810.firebaseapp.com",
  projectId: "wahh-a2810",
  storageBucket: "wahh-a2810.appspot.com",
  messagingSenderId: "933623751265",
  appId: "1:933623751265:web:1c4440291d03084b998020"
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