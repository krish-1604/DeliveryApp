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
// import Background from './views/Background';
// import DocumentPage from './views/document-page';
// import FinalDetailsPage from './views/backup-details-page';
// import RegisterScreen from './views/register';
// import DocumentPage from './views/document-page';
// import RegistrationPage from './views/registration-page';
// import VehicleDetailsPage from './views/VehicleDetailsPage';
// import BankDetailsPage from './views/BankDetailsPage';
import EmergencyDetailsPage from './views/EmergencyDetailsPage';
// import Background from './views/Background';
// import RegisterScreen from './views/register';
// import VerifyScreen from './views/verify';

export default function RootLayout() {
	return (
		// <VerifyScreen />
		// <RegisterScreen />
		// <DocumentPage />
		// <RegistrationPage />
		// <Background />
		// <FinalDetailsPage />
		// <VehicleDetailsPage />
		// <BankDetailsPage />
		<EmergencyDetailsPage />
	);
}
