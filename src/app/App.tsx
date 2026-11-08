import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../features/auth/presentation/AuthProvider";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./navigation/RootNavigator";
import { ShareIntentProvider } from "expo-share-intent";
import { IncomingShareHandler } from "../shared/incoming-share/IncomingShareHandler";

export default function App() {
    return (
        <ShareIntentProvider>
            
            <SafeAreaProvider>

                <AuthProvider>

                    <IncomingShareHandler />

                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>

                </AuthProvider>
            
            </SafeAreaProvider>
        
        </ShareIntentProvider>
    );
}