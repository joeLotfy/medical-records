import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../features/auth/presentation/AuthProvider";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./navigation/RootNavigator";

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    )
}