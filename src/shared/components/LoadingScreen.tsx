import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "./Screen";
import { colors } from "../theme/colors";

type LoadingScreenProps = {
    message?: string;
}

export function LoadingScreen({
    message = "Loading...",
}: LoadingScreenProps) {
    return(
        <Screen>
            <View style={styles.content}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Screen>
    );
}




const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    message: {
        marginTop: 16,
        fontSize: 15,
        color: colors.muted,
    },
});