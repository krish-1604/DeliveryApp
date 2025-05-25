// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import 'react-native-reanimated';

// import { useColorScheme } from 'react-native';

// export {
// 	// Catch any errors thrown by the Layout component.
// 	ErrorBoundary,
// } from 'expo-router';

// export const unstable_settings = {
// 	// Ensure that reloading on `/modal` keeps a back button present.
// 	initialRouteName: '(tabs)',
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
// 	const [loaded, error] = useFonts({
// 		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
// 		...FontAwesome.font,
// 	});

// 	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
// 	useEffect(() => {
// 		if (error) throw error;
// 	}, [error]);

// 	useEffect(() => {
// 		if (loaded) {
// 			SplashScreen.hideAsync();
// 		}
// 	}, [loaded]);

// 	if (!loaded) {
// 		return null;
// 	}

// 	return <RootLayoutNav />;
// }

// function RootLayoutNav() {
// 	const colorScheme = useColorScheme();

// 	return (
// 		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
// 			<Stack>
// 				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
// 				<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
// 			</Stack>
// 		</ThemeProvider>
// 	);
// }

import '../global.css';
import AadhaarCardDetails from './views/AadhaarCardDetails';
import LeaveSubmittedPage from './views/LeaveSubmittedPage';
import OrdersScreen from './views/OrdersScreen';
import AccountPage from './views/AccountPage';
import BankDetailsPage from './views/BankDetailsPage';
// import Background from './views/Background';
import DocumentPage from './views/document-page';
import FinalDetailsPage from './views/backup-details-page';
import RegisterScreen from './views/register';
import RegistrationPage from './views/registration-page';
import VehicleDetailsPage from './views/VehicleDetailsPage';
import EmergencyDetailsPage from './views/EmergencyDetailsPage';
import LeavePage from './views/LeavePage';
import VerifyScreen from './views/verify';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';
import Map from './views/MapGoBrrrrrrrrrrr';
const Stack = createStackNavigator();

export default function RootLayout() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Stack.Navigator
				initialRouteName="/map"
				screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
			>
				<Stack.Screen name="/reg/verify" component={VerifyScreen} />
				<Stack.Screen name="/reg" component={RegisterScreen} />
				<Stack.Screen name="/doc" component={DocumentPage} />
				<Stack.Screen name="/regi" component={RegistrationPage} />
				<Stack.Screen name="/final" component={FinalDetailsPage} />
				<Stack.Screen name="/vehicle" component={VehicleDetailsPage} />
				<Stack.Screen name="/bank" component={BankDetailsPage} />
				<Stack.Screen name="/emergency" component={EmergencyDetailsPage} />
				<Stack.Screen name="/aadhaar" component={AadhaarCardDetails} />
				<Stack.Screen name="/leave-submitted" component={LeaveSubmittedPage} />
				<Stack.Screen name="/orders" component={OrdersScreen} />
				<Stack.Screen name="/account" component={AccountPage} />
				<Stack.Screen name="/leave" component={LeavePage} />
				<Stack.Screen name="/map" component={Map} />
			</Stack.Navigator>
		</SafeAreaView>
	);
}
