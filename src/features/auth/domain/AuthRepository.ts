import type { AuthUser } from "./AuthUser";

export interface AuthRepository {
  subscribeToAuthChanges(
    onChange: (user: AuthUser | null) => void
  ): () => void;

  signInWithEmail(
    email: string,
    password: string
  ): Promise<void>;

  signUpWithEmail(
    email: string,
    password: string
  ): Promise<void>;

  signOut(): Promise<void>;

  sendEmailVerification(): Promise<void>;

  refreshCurrentUser(): Promise<AuthUser | null>;

  updateDisplayName(displayName: string): Promise<void>;

  updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void>;
  
}