import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../../app/navigation/routes";
import { useAuth } from "../useAuth";
import { useEffect, useState } from "react";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../../shared/components/Screen";
import { colors } from "../../../../shared/theme/colors";
import { AppTextInput } from "../../../../shared/components/AppTextInput";
import { AppButton } from "../../../../shared/components/AppButton";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfileScreen(){
    const{
        user, 
        updateDisplayName, 
        updatePassword, 
        signOut,
    } = useAuth();

    const providerIds = user?.providerData.map((provider : {providerId: string}) => provider.providerId);
    const [hasPassowrdProvider, setHasPasswordProvider] = useState(false);
    if(providerIds.includes('password')){
        useEffect(() => {
            setHasPasswordProvider(true);
        }, []);
    }

    const[displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [cureentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSvaingName, setIsSavingName]= useState(false);
    const [isSvaingPasswor, setIsSavingPasswor]= useState(false);
    const[error,setError] = useState<string>();
    const [success, setSuccess] = useState<string>();

    async function handleSaveName(){
        setError(undefined);
        setSuccess(undefined);
        const name= displayName.trim();
        if(name.length < 2){
            setError("Please enter your full name!");
            return;
        }

        setIsSavingName(true);

        try {
            await updateDisplayName(name);
            setSuccess("Your full name has been updated");
        } catch (error:any) {
            setError(error?.message || "failed to save your name");
        } finally {
            setIsSavingName(false);
        }
    }


    async function handleChangePassword(){
        setError(undefined);
        setSuccess(undefined);

        if(newPassword.length < 8){
            setError("your password must contain at least 8 characters.!");
            return;
        }

        if(newPassword !== confirmPassword){
            setError("the new passwords do not match!");
            return;
        }

        setIsSavingPasswor(true);
        try {
            await updatePassword(cureentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccess("Your password has been changed");
        } catch (error:any) {
            setError(getAuthErrorMessage(error));
        } finally {
            setIsSavingPasswor(false);
        }
    }

    async function handleSignOut() {
        setSuccess(undefined);

        try {
            await signOut();
        } catch (error: any) {
            Alert.alert("Sign Out Failed!", "Please try again");
        }
    }

    return(
        <Screen>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>My Profile</Text>
                <Text style={styles.subtitle}>
                    Manage your account information.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal information</Text>

                    <AppTextInput 
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />

                    <Text style={styles.emailLabel}>Email address</Text>
                    <Text style={styles.email}>{user?.email ?? "Unavailable"}</Text>

                    <AppButton 
                        title="Save full name"
                        onPress={handleSaveName}
                        loading={isSvaingName}
                        disabled={isSvaingName}
                    />
                </View>
                {hasPassowrdProvider ? (    
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Change Password</Text>

                        <AppTextInput
                            label="current password"
                            value={cureentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="enter current password"
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <AppTextInput 
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="at leat 8 characters"
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <AppTextInput 
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="repeat new password"
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <AppButton 
                            title="change password"
                            onPress={handleChangePassword}
                            loading={isSvaingPasswor}
                            disabled={isSvaingPasswor}
                        />
                    </View>
                ): (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>You are signed in with your Google email</Text>
                        <Text style={styles.subtitle}>You have no Password</Text>
                    </View>
                )}

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}


                <AppButton 
                    title="Sign Out"
                    variant="secondary"
                    onPress={handleSignOut}
                />
            </ScrollView>
        </Screen>
    );
}




const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 16,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.muted,
        fontSize: 15,
    },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 18,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 20,
    },
    emailLabel: {
        color: colors.muted,
        fontSize: 13,
        marginBottom: 5,
    },
    email: {
        color: colors.text,
        fontSize: 15,
        marginBottom: 20,
    },
    error: {
        color: colors.danger,
        fontSize: 14,
    },
    success: {
        color: "#15803D",
        fontSize: 14,
    },
});