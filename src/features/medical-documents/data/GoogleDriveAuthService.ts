//handles connecting and authorizing a google account

import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";

const DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.file";

export interface GoogleDriveConnection{
    email: string;
    accessToken: string;
};

export async function connectGoogleDrive(): Promise<GoogleDriveConnection> {
    //signin to google acc
    const response = await GoogleSignin.signIn();
    if(!isSuccessResponse(response)){throw new Error("Google drive connection was cancelled!!");}

    const email= response.data.user.email;
    if(!email){throw new Error("google did not return an acc");}

    //request permission to access drive files
    await GoogleSignin.addScopes({
        scopes: [DRIVE_SCOPE],
    });

    //obtain the access token for drive api reqs
    const tokens= await GoogleSignin.getTokens();
    if(!tokens.accessToken){throw new Error("could not obtain a drive access token");}

    return{
        email,
        accessToken: tokens.accessToken,
    };

}

export async function getDriveAccesstoken() : Promise<string> {
    const currentUser = await GoogleSignin.getCurrentUser();
    if(!currentUser)
        throw new Error("no google drive account is currently signed in");
    ;

    const tokens = await GoogleSignin.getTokens();
    if(!tokens.accessToken)
        throw new Error("could not obtain a google drive access token!")
    ;

    return tokens.accessToken;
}