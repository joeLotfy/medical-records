import { auth } from "../../../infrastructure/firebase/firebaseApp";
import { connectGoogleDrive } from "./GoogleDriveAuthService";
import { getOrCreateMedicalRecordsFolder } from "./GoogleDriveService";
import { getSavedFirebaseUid, saveDriveConnection } from "./GoogleDriveStorage";

//this is what the screen will call

export async function connectAndPrepareDrive(): Promise<string> {

    const firebaseUid= auth.currentUser?.uid;
    if(!firebaseUid)
            throw new Error("you must sign in before connecting google drive!!!!")
    ;
    
    //auth usser's drive
    const connection = await connectGoogleDrive();

    //find or create the folder
    const folder = await getOrCreateMedicalRecordsFolder(connection.accessToken);

    //save
    await saveDriveConnection(
        connection.email,
        folder.id,
        firebaseUid,
    );

    return connection.email;
}