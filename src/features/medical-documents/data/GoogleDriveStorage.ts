import * as SecureStore from "expo-secure-store";

const FOLDER_ID_KEY = "medical_records_folder_id";
const EMAIL_KEY = "medical_records_drive_email";
const FIREBASE_UID_KEY = "medical_records_firebase_uid";


export async function saveDriveConnection(
    email: string,
    folderId: string,
    firebaseUid: string,
): Promise<void> {
    await SecureStore.setItemAsync(FOLDER_ID_KEY, folderId);
    await SecureStore.setItemAsync(EMAIL_KEY, email);
    await SecureStore.setItemAsync(FIREBASE_UID_KEY, firebaseUid);
}

export async function getSavedFolderId(
    _email: string
): Promise<string | null> {
    return await SecureStore.getItemAsync(FOLDER_ID_KEY);
}

export async function getConnectedDriveEmail(): Promise<string | null> {
    return await SecureStore.getItemAsync(EMAIL_KEY);
}

export async function getSavedFirebaseUid() : Promise<string | null> {
    return await SecureStore.getItemAsync(FIREBASE_UID_KEY);
}



export async function disconnectDrive(): Promise<void> {
    const email = await getConnectedDriveEmail();
    if(email)
        await SecureStore.deleteItemAsync(FOLDER_ID_KEY)
    ;

    await SecureStore.deleteItemAsync(EMAIL_KEY);
    await SecureStore.deleteItemAsync(FIREBASE_UID_KEY);
}