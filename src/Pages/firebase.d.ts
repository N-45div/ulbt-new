// pages/firebase.d.ts  
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

declare module "./firebase" {
  export const auth: Auth;
  export const db: Firestore;
}