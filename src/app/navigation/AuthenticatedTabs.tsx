import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "../../features/home/presentation/screens/HomeScreen";
import { ProfileScreen } from "../../features/auth/presentation/screens/ProfileScreen";
import { MedicalDocumentsScreen } from "../../features/medical-documents/presentation/screens/MedicalDocumentsScreen";

type TabParamList = {
    Home: undefined;
    Profile: undefined;
    Documents: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const COLORS = {
    active: "#2563EB",
    inactive: "#8A91A8",
    background: "#FFFFFF",
    border: "#E6EEE2",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// [focused, unfocused] icon per route: filled when active, outline when not
const ICONS: Record<keyof TabParamList, [IconName, IconName]> = {
    Home: ["home", "home-outline"],
    Profile: ["person", "person-outline"],
    Documents: ["document", "document-outline"],
};

export function AuthenticatedTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                //no top banner
                headerShown: false,

                tabBarActiveTintColor: COLORS.active,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarHideOnKeyboard: true,

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "800",
                    marginTop: 2,
                },
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    // height: 40 + bottomInset,
                    // paddingTop: 8,
                    // paddingBottom: bottomInset,
                    elevation: 0,
                    shadowColor: "#0F173A",
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: -2 },
                },

                tabBarIcon: ({ focused, color, size }) => {
                    const [on, off] = ICONS[route.name];
                    return <Ionicons name={focused ? on : off} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: "Home" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: "Profile" }}
            />
            <Tab.Screen 
                name="Documents"
                component={MedicalDocumentsScreen}
                options={{ tabBarLabel: "Medical Documents" }}
            />
        </Tab.Navigator>
    );
}