import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type AppButtonProps = {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary";
};

export function AppButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant="primary",
} : AppButtonProps){
    const isSecondary = variant === "secondary";
    const isDisabled = disabled || loading;

    return(
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) =>[
                styles.button,
                isSecondary ? styles.secondary : styles.primary,
                pressed && !isDisabled ? styles.pressed : undefined,
                isDisabled ? styles.disabled : undefined,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={isSecondary ? colors.text : colors.onPrimary}
                />
            ) : (
                <Text
                    style={[
                        styles.label,
                        isSecondary ? styles.secondaryLabel : styles.primaryLabel,
                    ]}
                >
                    {title}
                </Text>
            )}
        </Pressable>
    );

}


const styles = StyleSheet.create({
    button: {
        minHeight: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondarySurface,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
    },
    primaryLabel: {
        color: colors.onPrimary,
    },
    secondaryLabel: {
        color: colors.text,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.6,
    },
});