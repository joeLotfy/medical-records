//translates drive response into the app's doc model

import * as FileSystem from "expo-file-system/legacy"
import { deleteMedicalDocument, downloadMedicalDocument, getOrCreateMedicalRecordsFolder, GoogleDriveFile, listMedicalDocuments, uploadMedicalDocument } from "./GoogleDriveService";
import { MedicalDocument } from "../domain/MedicalDocument";
import { 
    saveDriveConnection,
    getSavedFolderId, 
    getConnectedDriveEmail,
    getSavedFirebaseUid, 
    disconnectDrive as clearSavedDriveConnection 
} from "./GoogleDriveStorage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { connectGoogleDrive, getDriveAccesstoken } from "./GoogleDriveAuthService";
import { MedicalDocumentRepository } from "../domain/MedicalDocumentRepository";
import { auth } from "../../../infrastructure/firebase/firebaseApp";


function mapDriveFile(file: GoogleDriveFile): MedicalDocument {
    return{
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? Number(file.size) : null,
        createdTime: file.createdTime,
        modifiedTime: file.createdTime,
        webViewLink: file.webViewLink,
    };
}


async function getDriveContext() {
    const firebaseUid = auth.currentUser?.uid;
    if(!firebaseUid)
        throw new Error("you must sign in to the App before accessing Google Drive!!")
    ;

    const savedFirebaseUid = await getSavedFirebaseUid();
    if(savedFirebaseUid !== firebaseUid)
        throw new Error("this google drive connection belongs to another user. please reconnect your drive.")
    ;

    const savedEmail = await getConnectedDriveEmail();
    if(!savedEmail)
        throw new Error("please connect your google drive first!!!")
    ;

    const currentUser = await GoogleSignin.getCurrentUser();
    if(!currentUser)
        throw new Error("your google drive session expired. please reconnect your drive account!")
    ;

    if(currentUser.user.email.toLowerCase() !== savedEmail.toLowerCase())
        throw new Error("The currently signed-in Google account is different from the connected Drive account. Reconnect the correct account.")
    ;

    const accessToken = await getDriveAccesstoken();
    const folderId = await getSavedFolderId(savedEmail);

    if(!folderId)
        throw new Error("MedicalRecords folder is missing, reconnect drive!")
    ;

    return{
        accessToken,
        folderId,
    };  
}

class GoogleDriveDocumentRepository implements MedicalDocumentRepository{
    async connectDrive(): Promise<void> {
        const firebaseUid= auth.currentUser?.uid;
        if(!firebaseUid)
            throw new Error("you must sign in before connecting google drive!!!!")
        ;
        const connection = await connectGoogleDrive();
        const folder = await getOrCreateMedicalRecordsFolder(
            connection.accessToken,
        );

        await saveDriveConnection(
            connection.email,
            folder.id,
            firebaseUid,
        );
    }


    async isDriveConnected(): Promise<boolean> {
        const savedEmail = await getConnectedDriveEmail();
        if(!savedEmail)
            return false
        ;

        const currentUser = await GoogleSignin.getCurrentUser();

        return Boolean(
            currentUser &&
            currentUser.user.email.toLowerCase() === savedEmail.toLowerCase()
        );
    }


    async getDocuments(): Promise<MedicalDocument[]> {
        const {accessToken, folderId} = await getDriveContext();

        const files = await listMedicalDocuments(
            accessToken,
            folderId,
        );

        return files.map(mapDriveFile);
    }



    async uploadDocument(uri: string, name: string, mimeType: string): Promise<MedicalDocument> {
        const {accessToken, folderId} = await getDriveContext();
        const file = await uploadMedicalDocument(accessToken,folderId,uri,name,mimeType);

        return mapDriveFile(file);
    }

    async downloadDocument(documentId: string, destinationUri: string): Promise<string> {
        const{accessToken} = await getDriveContext();

        return downloadMedicalDocument(accessToken,documentId,destinationUri);
    }

    async deleteDocument(documentId: string): Promise<void> {
        const { accessToken } = await getDriveContext();

        await deleteMedicalDocument(accessToken, documentId);
    }

    async disconnectDrive(): Promise<void>{
        await clearSavedDriveConnection();
    }

    async getConnectedAccountEmail(): Promise<string | null>{
        return getConnectedDriveEmail();
    }

    async downloadAndShareDocument(
        document: MedicalDocument
    ): Promise<void> {
        const cacheDirectory = FileSystem.cacheDirectory;
        if(!cacheDirectory)
            throw new Error("local cache directory is unavailable")
        ;

        const safeName = document.name.replace(/[\\/]/g, "_");

        const destinationUri = `${cacheDirectory}${document.id}_${safeName}`;

        const localUri = await this.downloadDocument(document.id, destinationUri);
        
        const Sharing = await import("expo-sharing");

        const isAvailable = await Sharing.isAvailableAsync();

        if(!isAvailable)
            throw new Error("document sharing is not available on this device!");
        ;

        await Sharing.shareAsync(localUri,{
            mimeType: document.mimeType,
            dialogTitle: `Open ${document.name}`,
        }); 
    }
}


//the object other files will import
export const medicalDocumentRepository = new GoogleDriveDocumentRepository();