//root nav stack
//config ts param list
import { HomeScreen } from "../../features/home/presentation/screens/HomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { colors } from "../../shared/theme/colors";
import { SignUpScreen } from "../../features/auth/presentation/screens/SignUpScreen";
import { LoginScreen } from "../../features/auth/presentation/screens/LoginScreen";
import { useAuth } from "../../features/auth/presentation/useAuth";
import { LoadingScreen } from "../../shared/components/LoadingScreen";
import type { RootStackParamList } from "./routes";

//init stack navigator with type safety configuration
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const { user, isLoading } = useAuth();

      return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade",
      }}
    >
      {isLoading ? (
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
        />
      ) : user ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}


// 4. Global type declaration for useNavigation hook autocomplete
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}