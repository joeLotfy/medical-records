import * as FileSystem from "expo-file-system/legacy";



//handles http comm with drive

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME_TYPE= "application/vnd.google-apps.folder";

export interface GoogleDriveFile{
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink?: string;
}

interface GoogleDriveFileListResponse{
    files: GoogleDriveFile[];
    nextPageToken?: string;
}

async function driveRequest<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
    });

    console.log("[Drive API] Status:", response.status);

    // Read the response body exactly once.
    const responseBody = await response.text();

    if (!response.ok) {
        console.error("[Drive API] Error:", responseBody);

        throw new Error(
            `Google Drive API error (${response.status}): ${responseBody}`
        );
    }

    if (response.status === 204 || !responseBody) {
        return undefined as T;
    }

    try {
        return JSON.parse(responseBody) as T;
    } catch {
        throw new Error(
            `Google Drive returned invalid JSON: ${responseBody}`
        );
    }
}


export async function findMedicalRecordsFolder(
    accessToken: string,
) : Promise<GoogleDriveFile | null> {
    const qurey=
        `name = 'MedicalRecords' and ` +
        `mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`
    ;

    const params = new URLSearchParams({
        q: qurey,
        fields: "files(id,name,mimeType,createdTime,modifiedTime)",
        pageSize: "100",
    });

    const result=
        await driveRequest<GoogleDriveFileListResponse>(
            `${DRIVE_API_BASE_URL}/files?${params.toString()}`,
            accessToken,
        )
    ;

    return result.files[0] ?? null;
}

export async function createMedicalRecordsFolder(
    accessToken: string
): Promise<GoogleDriveFile> {

    const folder = await driveRequest<GoogleDriveFile>(
        `${DRIVE_API_BASE_URL}/files?fields=id,name,mimeType`,
        accessToken,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "MedicalRecords",
                mimeType: "application/vnd.google-apps.folder",
            }),
        }
    );

    console.log("[Drive] Created folder:", folder);

    if (folder.mimeType !== "application/vnd.google-apps.folder") {
        throw new Error(
            `Expected a folder, but Google Drive returned mimeType: ${folder.mimeType}`
        );
    }

    return folder;
}



export async function getOrCreateMedicalRecordsFolder(accessToken:string) : Promise<GoogleDriveFile> {
    const existingFloder = await findMedicalRecordsFolder(accessToken);
    if(existingFloder && existingFloder.mimeType === "application/vnd.google-apps.folder"){
            console.log("[Drive] using folder:",{
                id: existingFloder.id,
                name: existingFloder.name,
                mimeType: existingFloder.mimeType,
            });

        return existingFloder;
    }

    const folder = await createMedicalRecordsFolder(accessToken);
    // if(existingFloder?.mimeType !== "application/vnd.google-apps.folder"){
    //     throw new Error(`MedicalRecords is not a folder!!!! Recieved: ${folder.mimeType}`);
    // }

    return folder;
}


export async function listMedicalDocuments(
    accessToken:string,
    folderId: string,
) : Promise<GoogleDriveFile[]> {
    const query = `'${folderId}' in parents and trashed = false`;

    const url = 
        `${DRIVE_API_BASE_URL}/files`+
        `?q=${encodeURIComponent(query)}`+
        `&fields=nextPageToken,files(id,name,mimeType,createdTime,modifiedTime)`+
        `&pageSize=100`+
        `&orderBy=createdTime desc`
    ;

    const result = await driveRequest<GoogleDriveFileListResponse>(
        url,
        accessToken,
    );

    return result.files ?? [];
}


export async function uploadMedicalDocument(
    accessToken: string,
    folderId: string,
    localUri: string,
    fileName: string,
    mimeType: string,
): Promise<GoogleDriveFile> {
    //create upload session
    const sessionResponse = await fetch(
        `${DRIVE_UPLOAD_URL}/files?uploadType=resumable&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`,
        {
            method: "POST",
            headers:{
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-content-Type" : mimeType, 
            },
            body: JSON.stringify({
                name: fileName,
                mimeType,
                parents: [folderId],
            }),
        }
    );


    if(!sessionResponse.ok){
        const errorBody = await sessionResponse.text();
        throw new Error(
            `could not start upload (${sessionResponse.status}: ${errorBody})`
        );
    }


    const uploadUrl= sessionResponse.headers.get("Location");
    if(!uploadUrl)
        throw new Error("Google drive did not return an upload URL!!")
    ;

    //send local file to the upload session
    const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        localUri,
        {
            httpMethod: "PUT",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers:{
                "Content-Type": mimeType,
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if(uploadResult.status<200 || uploadResult.status>=300)
        throw new Error(`File upload failed (${uploadResult.status}): ${uploadResult.body}`)
    ;

    
    //successful upload response has file metadata
    return JSON.parse(uploadResult.body) as GoogleDriveFile;
}


export async function downloadMedicalDocument(
    accessToken:string,
    documentId:string,
    destinationUri: string,
) : Promise<string> {
    const url =
        `${DRIVE_API_BASE_URL}/files/${encodeURIComponent(documentId)}`+
        "?alt=media"
    ;

    const result = await FileSystem.downloadAsync(
        url,
        destinationUri,
        {
            headers:{
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if(result.status<200 || result.status>=300)
        throw new Error(`document download failed (${result.status}) .`)
    ;

    return result.uri;
}

export async function deleteMedicalDocument(
    accessToken:string,
    documentId:string,
) : Promise<void> {
    await driveRequest<void>(
        `${DRIVE_API_BASE_URL}/files/${encodeURIComponent(documentId)}`,
        accessToken,
        {
            method: "DELETE",
        }
    );
}