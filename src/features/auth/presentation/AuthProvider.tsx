import { AuthUser } from "../domain/AuthUser";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { authRepository } from "../data/FirebaseAuthRepository";
import { sendEmailVerification } from "@react-native-firebase/auth";
import { signInWithGoogle } from "../data/GoogleSignInService";

interface AuthContextType{
    user: AuthUser | null;
    isLoading: boolean;

    signInWithEmail: (
        email: string,
        password: string
    ) => Promise<void>;

    signUpWithEmail: (
        email: string,
        password: string
    ) => Promise<void>;
    
    signOut: () => Promise<void>;

    sendEmailVerification: () => Promise<void>;

    refreshCurrentUser: () => Promise<AuthUser | null>;

    updateDisplayName(displayName: string): Promise<void>;

    updatePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<void>;

    signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps{
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps){
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() =>{
        //sub to auth state changes
        const unsubscribe = authRepository.subscribeToAuthChanges((currentUser) =>{
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const contextValue = useMemo<AuthContextType>(
        () => ({
        user,
        isLoading,

        signInWithEmail: (email, password) =>
            authRepository.signInWithEmail(email, password),

        signUpWithEmail: (email, password) =>
            authRepository.signUpWithEmail(email, password),

        signOut: () => authRepository.signOut(),

        sendEmailVerification: () => 
            authRepository.sendEmailVerification(),

        refreshCurrentUser: () =>
            authRepository.refreshCurrentUser(),

        updateDisplayName: (displayName) =>
            authRepository.updateDisplayName(displayName),

        updatePassword: (currentPassword, newPassword) =>
            authRepository.updatePassword(currentPassword, newPassword),
        
        signInWithGoogle: () =>
            signInWithGoogle(),
        }),
        [user, isLoading],

    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}