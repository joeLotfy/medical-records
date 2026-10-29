import { AuthUser } from "../domain/AuthUser";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { authRepository } from "../data/FirebaseAuthRepository";

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
        }),
        [user, isLoading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}