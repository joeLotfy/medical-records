export interface MedicalDocument{
    id: string;
    name: string;
    mimeType: string;   //file type
    size: number | null;    //in bytes
    createdTime: string;
    modifiedTime: string;
    webViewLink?: string;
}