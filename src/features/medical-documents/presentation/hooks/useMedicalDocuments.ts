
import { useCallback, useEffect, useState } from "react";

import * as DocumentPicker from "expo-document-picker";

import { MedicalDocument } from "../../domain/MedicalDocument";
import { medicalDocumentRepository } from "../../data/GoogleDriveDocumentRepository";

//handles the ui loading and op states


const MAX_FILE_SIZE = 20 * 1024 * 1024; //20MB

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function useMedicalDocuments() {
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkConnection = useCallback(async () => {
        try {
            const connected = await medicalDocumentRepository.isDriveConnected();

            setIsConnected(connected);

            if (connected) {
                setConnectedEmail(
                    await medicalDocumentRepository.getConnectedAccountEmail()
                );
            } else {
                setConnectedEmail(null);
            }

            return connected;
        } catch {
            setIsConnected(false);
            setConnectedEmail(null);
            return false;
        }
    }, []);

    const loadDocuments = useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            const connected = await checkConnection();

            if (!connected) {
                setDocuments([]);
                return;
            }

            const result = await medicalDocumentRepository.getDocuments();

            setDocuments(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not load your medical documents."
            );
        } finally {
            setIsLoading(false);
        }
    }, [checkConnection]);

    const connectDrive = useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            await medicalDocumentRepository.connectDrive();
            await checkConnection();
            await loadDocuments();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not connect Google Drive."
            );
        } finally {
            setIsLoading(false);
        }
    }, [checkConnection, loadDocuments]);

    const uploadDocument = useCallback(async () => {
        setError(null);

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "image/*",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) {
                return;
            }

            const selectedFile = result.assets[0];

            if (!selectedFile) {
                throw new Error("No document was selected.");
            }

            if (
                selectedFile.mimeType &&
                !ALLOWED_MIME_TYPES.includes(selectedFile.mimeType) &&
                !selectedFile.mimeType.startsWith("images/")
            ) {
                throw new Error("This file type is not supported.");
            }

            if (selectedFile.size && selectedFile.size > MAX_FILE_SIZE) {
                throw new Error("The maximum supported file size is 20 MB.");
            }

            if (!selectedFile.mimeType) {
                throw new Error("Could not determine the file type.");
            }

            setIsUploading(true);

            await medicalDocumentRepository.uploadDocument(
                selectedFile.uri,
                selectedFile.name,
                selectedFile.mimeType
            );

            await loadDocuments();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Document upload failed."
            );
        } finally {
            setIsUploading(false);
        }
    }, [loadDocuments]);

    const deleteDocument = useCallback(async (documentId: string) => {
        setError(null);

        try {
            await medicalDocumentRepository.deleteDocument(documentId);

            setDocuments(current =>
                current.filter(document => document.id !== documentId)
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not delete the document."
            );
        }
    }, []);

    const openDocument = useCallback(async (document: MedicalDocument) => {
        setError(null);

        try {
            await medicalDocumentRepository.downloadAndShareDocument(document);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not open the document."
            );
        }
    }, []);

    const disconnectDrive = useCallback(async () => {
        await medicalDocumentRepository.disconnectDrive();
        setIsConnected(false);
        setConnectedEmail(null);
        setDocuments([]);
        setError(null);
    }, []);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    return {
        documents,
        isLoading,
        isUploading,
        isConnected,
        connectedEmail,
        error,
        connectDrive,
        uploadDocument,
        deleteDocument,
        openDocument,
        loadDocuments,
        disconnectDrive,
    };
}