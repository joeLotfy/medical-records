import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  reload
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
    emailVerified: user.emailVerified,
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

  async sendEmailVerification() {
    const user = auth.currentUser;

    if(!user){throw new Error("No Authenticated user");}
    if(!user.emailVerified){
      await sendEmailVerification(user);
    }
  },

  async refreshCurrentUser() {
    const user = auth.currentUser;
    if(!user){return null;}
    await reload(user);
    const refreshedUser= auth.currentUser;
    return refreshedUser ? toAuthUser(refreshedUser) : null;
  },

  async updateDisplayName(displayName: string): Promise<void> {
    const user = auth.currentUser;
    if(!user){throw new Error("No Authenticated user.");}
    await updateProfile(user, {displayName: displayName.trim(),});
  },

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user=auth.currentUser;
    if(!user?.email){throw new Error("An email/password account is required");}
    const hasPasswordProvider = user.providerData.some(
      (provider) => provider.providerId === "password"
    );
    if(!hasPasswordProvider){throw new Error("This account does not have a password");}
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  },

  
};