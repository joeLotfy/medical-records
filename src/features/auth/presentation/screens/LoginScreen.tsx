import { useState } from "react";
import { useAuth } from "../useAuth";
import { View, TextInput, Button, Text, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { validateEmail } from "../utils/validateEmail";
import { Screen } from "../../../../shared/components/Screen";
import { AppTextInput } from "../../../../shared/components/AppTextInput";
import { AppButton } from "../../../../shared/components/AppButton";
import { colors } from "../../../../shared/theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../../app/navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
    const { signInWithEmail } = useAuth();

    const[email,setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [emailError, setEmailError]= useState<string>();
    const [passwordError, setPasswordError]= useState<string>();
    const [loading, setLoading] = useState(false);
    async function handleLogin() {
        
        setErrorMsg('');

        const cleanEmail = email.trim();
        const nextEmailError = validateEmail(cleanEmail);
        const nextPasswordError = password ? undefined : "Please enter your password!";

        setEmailError(nextEmailError);
        setPasswordError(nextPasswordError);
        
        if(nextEmailError || nextPasswordError){return;}

        setLoading(true);

        try {
            await signInWithEmail(
                cleanEmail,
                password
            );
        } catch (error: any) {
            setErrorMsg(error?.message || 'Failed to sign in. please check your credintials');
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

                <Text style={styles.title}>Welcome back</Text>

                <Text style={styles.subtitle}>
                    Log in to access your medical records.
                </Text>

                <AppTextInput
                    label="Email address"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={(value) => {
                        setEmail(value);
                        setEmailError(undefined);
                        setErrorMsg('');
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
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError(undefined);
                        setErrorMsg('');
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    textContentType="password"
                    editable={!loading}
                    error={passwordError}
                />

                {errorMsg ? (
                    <Text style={styles.formError}>{errorMsg}</Text>
                ) : null}

                <AppButton
                    title="Log in"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => navigation.navigate("SignUp")}
                        disabled={loading}
                    >
                    <Text style={styles.link}>Create account</Text>
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
        fontSize: 28,
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
        fontWeight: "700",
        fontSize: 14,
    },
});