import { connectGoogleDrive } from "./GoogleDriveAuthService";
import { getOrCreateMedicalRecordsFolder } from "./GoogleDriveService";
import { saveDriveConnection } from "./GoogleDriveStorage";

//this is what the screen will call

export async function connectAndPrepareDrive(): Promise<string> {
    //auth usser's drive
    const connection = await connectGoogleDrive();

    //find or create the folder
    const folder = await getOrCreateMedicalRecordsFolder(connection.accessToken);

    //save
    await saveDriveConnection(
        connection.email,
        folder.id,
    );

    return connection.email;
}