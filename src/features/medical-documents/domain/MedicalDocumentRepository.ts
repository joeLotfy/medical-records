import { MedicalDocument } from "./MedicalDocument";

export interface MedicalDocumentRepository{

    connectDrive(): Promise<void>;
    isDriveConnected(): Promise<boolean>;

    getDocuments(): Promise<MedicalDocument[]>;

    uploadDocument(
        uri: string,
        name: string,
        mimeType: string,
    ): Promise<MedicalDocument>;

    deleteDocument(documentId: string): Promise<void>;

    downloadDocument(
        documentId:string,
        destinationUri: string,
    ): Promise<string>;
}