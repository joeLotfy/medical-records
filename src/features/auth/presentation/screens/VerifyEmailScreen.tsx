import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../../app/navigation/routes";
import { useAuth } from "../useAuth";
import { useEffect, useState } from "react";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../../shared/theme/colors";
import { Screen } from "../../../../shared/components/Screen";
import { AppButton } from "../../../../shared/components/AppButton";
import { HomeScreen } from "../../../home/presentation/screens/HomeScreen";
import { AuthUser } from "../../domain/AuthUser";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyEmail">;
const COOLDOWN_TIME_SECS = 60;

export function VerifyEmailScreen(){
    const { sendEmailVerification, refreshCurrentUser, signOut } = useAuth();

    const [cooldown, setCooldown] = useState(0);
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [emailError, setEmailError]= useState<string>();
    const [verificationLoading, setVerificationLoading] = useState(false);

    useEffect(() => {
        if(cooldown<=0) return;

        const timer = setTimeout(() =>{
            setCooldown((prev) => prev - 1);
        }, 1000);


        return ()=> clearTimeout(timer);
    }, [cooldown]);


    async function handleResendVerification() {
        setErrorMsg(undefined);
        setVerificationLoading(true);

        try {
            await sendEmailVerification();
            setMessage("Verification Email sent. check your inbox.");
            setCooldown(COOLDOWN_TIME_SECS);
        } catch (error: any) {
            setErrorMsg(getAuthErrorMessage(error));           
        } finally {
            setVerificationLoading(false);
        }
    }


    async function handleCheckVerification() {
        setErrorMsg('');
        setVerificationLoading(true);

        try {
            await refreshCurrentUser();
        } catch (error: any) {
            setErrorMsg(getAuthErrorMessage(error));
        } finally {
            setVerificationLoading(false);
        }
    }

    const [loading, setLoading] = useState(false);
    async function handleSignOut(){
        setErrorMsg(undefined);
        setLoading(true);

        try {
            await signOut();
        } catch (error: any) {
            setErrorMsg(error?.message ||"Failed to sign Out. Please try again!");
        } finally {
            setLoading(false);
        }
    }

    return(
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
                
                <Text style={styles.title}>E-mail Verification</Text>

                <Text style={styles.subtitle}>
                    please verify your email to continue
                </Text>

                <AppButton 
                    title={cooldown>0 ? `Resend Email in ${cooldown}s` : `Send Verification Email`}
                    onPress={handleResendVerification}
                    loading={verificationLoading}
                    disabled={verificationLoading || cooldown>0}
                />

                <AppButton 
                    title="I've Verified my email!"
                    variant="primary"
                    onPress={handleCheckVerification}
                    loading={verificationLoading}
                    disabled={verificationLoading}
                />

                <AppButton
                    title="Sign out"
                    variant="secondary"
                    onPress={handleSignOut}
                    loading={loading}
                    disabled={loading}
                />

            </View>
            </ScrollView>

            </KeyboardAvoidingView>
        </Screen>
    )
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
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0', 
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    dividerText: {
        textAlign: 'center', 
        fontWeight: "900", 
        marginHorizontal: 10, 
        //color: '#757575', 
        textTransform: 'uppercase'
    },
});