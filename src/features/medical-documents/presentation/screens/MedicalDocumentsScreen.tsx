
import React from "react";

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useMedicalDocuments } from "../hooks/useMedicalDocuments";
import { DocumentListItem } from "../components/DocumentListItem";

export function MedicalDocumentsScreen() {
    const {
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
    } = useMedicalDocuments();

    function confirmDelete(documentId: string, name: string) {
        Alert.alert(
            "Delete document",
            `Are you sure you want to permanently delete "${name}" from Google Drive?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        void deleteDocument(documentId);
                    },
                },
            ]
        );
    }

    function confirmDisconnect() {
        Alert.alert(
            "Disconnect Google Drive",
            "Your documents will remain in Google Drive, but this app will no longer manage them until you reconnect.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: () => {
                        void disconnectDrive();
                    },
                },
            ]
        );
    }

    if (isLoading && !isConnected) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>
                    Checking Google Drive connection...
                </Text>
            </SafeAreaView>
        );
    }

    if (!isConnected) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.connectionContainer}>
                    <MaterialCommunityIcons
                        name="google-drive"
                        size={76}
                        color="#2563EB"
                    />

                    <Text style={styles.title}>
                        Connect Google Drive
                    </Text>

                    <Text style={styles.description}>
                        Connect your Google account to store and manage
                        your medical documents securely in your own Drive.
                    </Text>

                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    <Pressable
                        style={styles.primaryButton}
                        onPress={() => void connectDrive()}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                Connect Google Drive
                            </Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Medical Documents
                    </Text>

                    <Text style={styles.accountText}>
                        Connected: {connectedEmail}
                    </Text>
                </View>

                <Pressable
                    onPress={confirmDisconnect}
                    style={styles.disconnectButton}
                >
                    <MaterialCommunityIcons
                        name="link-off"
                        size={21}
                        color="#DC2626"
                    />
                </Pressable>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Pressable
                style={[
                    styles.uploadButton,
                    isUploading && styles.disabledButton,
                ]}
                onPress={() => void uploadDocument()}
                disabled={isUploading}
            >
                {isUploading ? (
                    <>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>
                            Uploading document...
                        </Text>
                    </>
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name="cloud-upload-outline"
                            size={23}
                            color="#FFFFFF"
                        />
                        <Text style={styles.primaryButtonText}>
                            Upload Document
                        </Text>
                    </>
                )}
            </Pressable>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Your Documents
                </Text>

                <Text style={styles.documentCount}>
                    {documents.length} files
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>
                        Loading documents...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={documents}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <DocumentListItem
                            document={item}
                            onOpen={() => void openDocument(item)}
                            onDelete={() =>
                                confirmDelete(item.id, item.name)
                            }
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={() => void loadDocuments()}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons
                                name="file-document-outline"
                                size={58}
                                color="#9CA3AF"
                            />

                            <Text style={styles.emptyTitle}>
                                No documents yet
                            </Text>

                            <Text style={styles.emptyDescription}>
                                Upload your first medical document
                                to see it here.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 18,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: "#6B7280",
    },
    connectionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 23,
        fontWeight: "700",
        color: "#111827",
        marginTop: 12,
    },
    description: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 12,
        marginBottom: 25,
    },
    accountText: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 5,
    },
    primaryButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderRadius: 10,
        minWidth: 220,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
    },
    disconnectButton: {
        padding: 10,
    },
    uploadButton: {
        backgroundColor: "#2563EB",
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    disabledButton: {
        opacity: 0.65,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 28,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },
    documentCount: {
        fontSize: 13,
        color: "#6B7280",
    },
    listContent: {
        paddingBottom: 25,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#374151",
        marginTop: 12,
    },
    emptyDescription: {
        color: "#6B7280",
        textAlign: "center",
        marginTop: 7,
        lineHeight: 20,
    },
    errorContainer: {
        backgroundColor: "#FEE2E2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    errorText: {
        color: "#B91C1C",
        fontSize: 13,
        textAlign: "center",
    },
});
