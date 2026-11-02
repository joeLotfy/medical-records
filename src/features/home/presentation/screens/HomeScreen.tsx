import { useState } from "react";
import { useAuth } from "../../../auth/presentation/useAuth";
import { View, Text, Button, StyleSheet, TextInput } from "react-native";
import { Screen } from "../../../../shared/components/Screen";
import { AppButton } from "../../../../shared/components/AppButton";
import { colors } from "../../../../shared/theme/colors";

export function HomeScreen(){
    const {user, signOut} = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>();

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

 return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>MEDICAL RECORDS</Text>

        <Text style={styles.title}>You're signed in!</Text>

        <Text style={styles.subtitle}>
          Your account is working.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Signed-in account</Text>
          <Text style={styles.email}>
            {user?.email ?? "No email available"}
          </Text>

          <Text style={styles.placeholder}>
            Your medical documents will appear here in a future step.
          </Text>
        </View>

        {errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : null}

        <AppButton
          title="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          loading={loading}
          disabled={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
    fontSize: 16,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  email: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  placeholder: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});