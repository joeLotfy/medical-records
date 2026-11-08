//validate,stage,upload shared files


import * as FileSystem from "expo-file-system/legacy";

import { IncomingSharedFile } from "./IncomingSharedFile";

import { medicalDocumentRepository } from
    "../../features/medical-documents/data/GoogleDriveDocumentRepository";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",
};

export interface SharedFileImportResult {
    uploaded: string[];
    failed: {
        name: string;
        error: string;
    }[];
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : String(error);
}

function resolveMimeType(file: IncomingSharedFile): string | null {
    const suppliedMimeType = file.mimeType
        ?.split(";")[0]
        .trim()
        .toLowerCase();

    //prefer a recognized mimetype supplied by the sharing application
    if (
        suppliedMimeType === "application/pdf" ||
        suppliedMimeType?.startsWith("image/")
    ) {
        return suppliedMimeType;
    }

    //otherwise, infer the mimetype from the filename extension
    const extension = file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    return extension
        ? MIME_TYPES_BY_EXTENSION[extension] ?? null
        : null;
}

function normalizeUri(uri: string): string {
    if (uri.startsWith("file://") || uri.startsWith("content://")) {
        return uri;
    }

    if (uri.startsWith("/")) {
        return `file://${uri}`;
    }

    throw new Error(`Unsupported local file URI: ${uri}`);
}

async function copyToAppCache(
    sourceUri: string,
    fileName: string,
    index: number
): Promise<string> {
    const cacheDirectory = FileSystem.cacheDirectory;

    if (!cacheDirectory) {
        throw new Error("Application cache directory is unavailable.");
    }

    const safeFileName = fileName.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

    const destinationUri =
        `${cacheDirectory}incoming-share-${Date.now()}-${index}-${safeFileName}`;

    await FileSystem.copyAsync({
        from: normalizeUri(sourceUri),
        to: destinationUri,
    });

    return destinationUri;
}

export async function uploadSharedFiles(
    files: IncomingSharedFile[]
): Promise<SharedFileImportResult> {

    const connected =
        await medicalDocumentRepository.isDriveConnected();

    if (!connected) {
        throw new Error(
            "Google Drive is not connected. Connect your Drive account before importing documents."
        );
    }

    const result: SharedFileImportResult = {
        uploaded: [],
        failed: [],
    };

    // Upload sequentially to avoid starting too many uploads at once.
    for (let index = 0; index < files.length; index++) {

        const file = files[index];
        let temporaryUri: string | null = null;

        try {
            const fileName = file.name.trim() ||
                `medical-document-${index + 1}`;

            const mimeType = resolveMimeType(file);

            if (!mimeType) {
                throw new Error(
                    "Only PDF documents and images are supported."
                );
            }

            if (
                file.size !== null &&
                file.size > MAX_FILE_SIZE_BYTES
            ) {
                throw new Error(
                    "File exceeds the 20 MB upload limit."
                );
            }

            //copy the received file into our application cache
            temporaryUri = await copyToAppCache(
                file.uri,
                fileName,
                index
            );

            console.log("[IncomingShare] Uploading:", {
                name: fileName,
                mimeType,
                size: file.size,
            });

            //reuse the existing google drive repository
            await medicalDocumentRepository.uploadDocument(
                temporaryUri,
                fileName,
                mimeType
            );

            result.uploaded.push(fileName);

        } catch (error) {
            result.failed.push({
                name: file.name,
                error: getErrorMessage(error),
            });

            console.error(
                "[IncomingShare] Failed to import:",
                file.name,
                error
            );

        } finally {

            //remove our temporary copy after the upload attempt
            if (temporaryUri) {
                try {
                    await FileSystem.deleteAsync(
                        temporaryUri,
                        { idempotent: true }
                    );
                } catch (cleanupError) {
                    console.warn(
                        "[IncomingShare] Could not clean temporary file:",
                        cleanupError
                    );
                }
            }
        }
    }

    return result;
}
