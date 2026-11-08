//listens for incoming shares and init the import
//share listener

import { useEffect, useRef } from "react";
import { Alert } from "react-native";

import { useShareIntentContext } from "expo-share-intent";

import { useAuth } from "../../features/auth/presentation/useAuth";

import { IncomingSharedFile } from "./IncomingSharedFile";
import { uploadSharedFiles } from "./SharedFileImportService";

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : String(error);
}

export function IncomingShareHandler() {

    const {
        hasShareIntent,
        shareIntent,
        resetShareIntent,
        error,
    } = useShareIntentContext();

    const { user, isLoading: isAuthLoading } = useAuth();

    const isProcessing = useRef(false);
    const lastHandledIntent = useRef<string | null>(null);

    // Clear the duplicate-prevention key after the native share
    // event has been consumed.
    useEffect(() => {
        if (!hasShareIntent) {
            lastHandledIntent.current = null;
        }
    }, [hasShareIntent]);

    useEffect(() => {

        if (error) {
            Alert.alert(
                "Share error",
                getErrorMessage(error)
            );

            resetShareIntent();
            return;
        }

        if (
            !hasShareIntent ||
            !shareIntent ||
            isProcessing.current ||
            isAuthLoading
        ) {
            return;
        }

        const nativeFiles = shareIntent.files ?? [];

        if (nativeFiles.length === 0) {
            Alert.alert(
                "Unsupported share",
                "Please share an image or PDF document."
            );

            resetShareIntent();
            return;
        }

        // Wait for the user to sign in.
        // The share event is kept until authentication is available.
        if (!user) {
            return;
        }

        // Preserve the existing email verification gate.
        if (!user.emailVerified) {
            Alert.alert(
                "Email verification required",
                "Please verify your email before importing medical documents."
            );

            resetShareIntent();
            return;
        }

        const intentKey = nativeFiles
            .map(file =>
                `${file.path}:${file.fileName ?? ""}:${file.size ?? ""}`
            )
            .join("|");

        if (lastHandledIntent.current === intentKey) {
            return;
        }

        lastHandledIntent.current = intentKey;
        isProcessing.current = true;

        const processFiles = async () => {

            try {
                const files: IncomingSharedFile[] =
                    nativeFiles.map(file => ({
                        uri: file.path,
                        name: file.fileName || "shared-document",
                        mimeType: file.mimeType || "",
                        size: typeof file.size === "number"
                            ? file.size
                            : null,
                    }));

                const result = await uploadSharedFiles(files);

                const successfulCount = result.uploaded.length;
                const failedCount = result.failed.length;

                let message =
                    `${successfulCount} file(s) uploaded successfully.`;

                if (result.uploaded.length > 0) {
                    message += "\n\nUploaded:\n";
                    message += result.uploaded.join("\n");
                }

                if (failedCount > 0) {
                    message += "\n\nFailed:\n";

                    message += result.failed
                        .map(file =>
                            `${file.name}: ${file.error}`
                        )
                        .join("\n");
                }

                Alert.alert(
                    failedCount === 0
                        ? "Upload complete"
                        : "Import completed with errors",
                    message
                );

            } catch (processingError) {

                Alert.alert(
                    "Import failed",
                    getErrorMessage(processingError)
                );

            } finally {

                resetShareIntent();
                isProcessing.current = false;
            }
        };

        void processFiles();

    }, [
        hasShareIntent,
        shareIntent,
        resetShareIntent,
        error,
        user,
        isAuthLoading,
    ]);

    return null;
}