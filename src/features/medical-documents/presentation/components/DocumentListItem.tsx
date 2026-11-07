
import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MedicalDocument } from "../../domain/MedicalDocument";

interface Props {
    document: MedicalDocument;
    onOpen: () => void;
    onDelete: () => void;
}

function formatFileSize(size: number | null): string {
    if (size === null || !Number.isFinite(size)) {
        return "Unknown size";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentIcon(mimeType: string): keyof typeof MaterialCommunityIcons.glyphMap {
    if (mimeType === "application/pdf") {
        return "file-pdf-box";
    }

    if (mimeType.startsWith("image/")) {
        return "file-image-outline";
    }

    if (
        mimeType.includes("word") ||
        mimeType.includes("document")
    ) {
        return "file-word-outline";
    }

    return "file-document-outline";
}

export function DocumentListItem({
    document,
    onOpen,
    onDelete,
}: Props) {
    const date = new Date(document.createdTime).toLocaleDateString();

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.documentInfo}
                onPress={onOpen}
            >
                <MaterialCommunityIcons
                    name={getDocumentIcon(document.mimeType)}
                    size={38}
                    color="#2563EB"
                />

                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>
                        {document.name}
                    </Text>

                    <Text style={styles.metadata}>
                        {formatFileSize(document.size)} • {date}
                    </Text>
                </View>
            </Pressable>

            <View style={styles.actions}>
                <Pressable
                    onPress={onOpen}
                    style={styles.actionButton}
                    accessibilityLabel={`Open ${document.name}`}
                >
                    <MaterialCommunityIcons
                        name="download-outline"
                        size={23}
                        color="#2563EB"
                    />
                </Pressable>

                <Pressable
                    onPress={onDelete}
                    style={styles.actionButton}
                    accessibilityLabel={`Delete ${document.name}`}
                >
                    <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={23}
                        color="#DC2626"
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    documentInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    metadata: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 5,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
    },
    actionButton: {
        padding: 8,
    },
});
