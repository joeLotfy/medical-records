import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme/colors";

type AppTextInputProps = Omit<TextInputProps, "style"> & {
    label: string;
    error?: string;
};

export function AppTextInput({
    label,
    error,
    ...inputProps
}: AppTextInputProps) {
    return(
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TextInput 
                {...inputProps}
                accessibilityLabel={label}
                style={[styles.input, error ? styles.inputError : undefined]}
                placeholderTextColor={colors.muted}
            />

            {error ? <Text style={styles.error}>{error}</Text>:null}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
    },
    label: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        minHeight: 50,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        backgroundColor: colors.surface,
        paddingHorizontal: 14,
        fontSize: 16,
        color: colors.text,
    },
    inputError: {
        borderColor: colors.danger,
    },
    error: {
        color: colors.danger,
        fontSize: 13,
        marginTop: 6,
    },
});