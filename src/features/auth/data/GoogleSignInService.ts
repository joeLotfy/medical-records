import { GoogleAuthProvider, signInWithCredential } from "@firebase/auth";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { auth } from "../../../infrastructure/firebase/firebaseApp";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export async function signInWithGoogle(): Promise<void> {
    await GoogleSignin.hasPlayServices();

    const response = await GoogleSignin.signIn();

    if(!isSuccessResponse(response)){
        return; //user cancelled the flow
    }

    const idToken = response.data.idToken;

    if(!idToken){
        throw new Error('Google did not return an ID token!!');
    }

    const credential = GoogleAuthProvider.credential(idToken);

    await signInWithCredential(auth, credential);
}