import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "../../../infrastructure/firebase/firebaseApp";

import type { AuthUser } from "../domain/AuthUser";
import type { AuthRepository } from "../domain/AuthRepository";

function toAuthUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export const authRepository: AuthRepository = {
  subscribeToAuthChanges(onChange) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      onChange(toAuthUser(firebaseUser));
    });
  },

  async signInWithEmail(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async signUpWithEmail(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    await firebaseSignOut(auth);
  },
};