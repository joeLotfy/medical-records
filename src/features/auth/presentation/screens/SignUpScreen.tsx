import { useState } from "react";
import { useAuth } from "../useAuth";
import { View, Text, Button, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../../app/navigation/routes";
import { validateEmail } from "../utils/validateEmail";
import { Screen } from "../../../../shared/components/Screen";
import { AppTextInput } from "../../../../shared/components/AppTextInput";
import { AppButton } from "../../../../shared/components/AppButton";
import { colors } from "../../../../shared/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
    const { signUpWithEmail } = useAuth();

    const [email, setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [emailError, setEmailError]= useState<string>();
    const [passwordError, setPasswordError]= useState<string>();
    const [confirmPasswordError, setConfirmPasswordError]= useState<string>();
    const [errorMsg, setErrorMsg] = useState<string>();
    const [loading, setLoading] = useState(false);

    async function handleSignUp() {
        setLoading(true);
        setErrorMsg(undefined);

        const cleanEmail = email.trim();
        const nextEmailError = validateEmail(cleanEmail);

        const nextPasswordError = password.length<8 ? "your password must contain at least 8 characters." : undefined;
        const nextConfirmPasswordError = password !== confirmPassword ? "The passwords don't match!" : undefined;

        setEmailError(nextEmailError);
        setPasswordError(nextPasswordError);
        setConfirmPasswordError(nextConfirmPasswordError);

        if(nextEmailError || nextPasswordError || nextConfirmPasswordError){return;};

        try {
            await signUpWithEmail(
                email,
                password
            );
        } catch (error: any) {
            setErrorMsg(error?.message || "Failed to sign up. Please try again!");
        } finally {
            setLoading(false);
        }
    }

    return (
    <Screen>
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    <Text style={styles.eyebrow}>MEDICAL RECORDS</Text>

                    <Text style={styles.title}>Create your account</Text>

                    <Text style={styles.subtitle}>
                        Register to start organizing your medical records.
                    </Text>

                    <AppTextInput
                        label="Email address"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(value) => {
                            setEmail(value);
                            setEmailError(undefined);
                            setErrorMsg(undefined);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        editable={!loading}
                        error={emailError}
                    />

                    <AppTextInput
                        label="Password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChangeText={(value) => {
                            setPassword(value);
                            setPasswordError(undefined);
                            setConfirmPasswordError(undefined);
                            setErrorMsg(undefined);
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        textContentType="newPassword"
                        editable={!loading}
                        error={passwordError}
                    />

                    <AppTextInput
                        label="Confirm password"
                        placeholder="Enter your password again"
                        value={confirmPassword}
                        onChangeText={(value) => {
                            setConfirmPassword(value);
                            setConfirmPasswordError(undefined);
                            setErrorMsg(undefined);
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        textContentType="newPassword"
                        editable={!loading}
                        error={confirmPasswordError}
                    />

                    {errorMsg ? (
                        <Text style={styles.formError}>{errorMsg}</Text>
                    ) : null}

                    <AppButton
                        title="Create account"
                        onPress={handleSignUp}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?{" "}
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => navigation.navigate("Login")}
                            disabled={loading}
                        >
                        <Text style={styles.link}>Log in</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </Screen>
  );
}




const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    eyebrow: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        marginBottom: 12,
    },
    title: {
        color: colors.text,
        fontSize: 27,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        color: colors.muted,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    formError: {
        color: colors.danger,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 24,
    },
    footerText: {
        color: colors.muted,
        fontSize: 14,
    },
    link: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "700",
    },
});