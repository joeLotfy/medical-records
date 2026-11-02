import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomeScreen } from "../../features/home/presentation/screens/HomeScreen";
import { ProfileScreen } from "../../features/auth/presentation/screens/ProfileScreen";


type DrawerParamList = {
    Home: undefined;
    Profile: undefined;
}

const Drawer = createDrawerNavigator<DrawerParamList>();

export function AuthenticatedDrawer(){
    return(
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {backgroundColor: "#FFFFFF"},
                headerTintColor: "#0F173A",
                drawerActiveTintColor: "#2563EB",
                drawerLabelStyle: {fontSize: 16},
            }}
        >
            
            <Drawer.Screen 
                name="Home"
                component={HomeScreen}
                options={{ title: "App Home Screen" }}
            />

            <Drawer.Screen 
                name="Profile"
                component={ProfileScreen}
                options={{ title: "My Profile" }}
            />
        </Drawer.Navigator>
    );
}