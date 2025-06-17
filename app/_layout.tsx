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
import React, { useEffect, useState } from 'react';
import '../global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Screens
import AadhaarCardDetails from './views/AadhaarCardDetails';
import LeaveSubmittedPage from './views/LeaveSubmittedPage';
import OrdersScreen from './views/OrdersScreen';
import AccountPage from './views/AccountPage';
import BankDetailsPage from './views/BankDetailsPage';
import FinalDetailsPage from './views/details-page';
import RegisterScreen from './views/register';
import RegistrationPage from './views/registration-page';
import VehicleDetailsPage from './views/VehicleDetailsPage';
import EmergencyDetailsPage from './views/EmergencyDetailsPage';
import LeavePage from './views/LeavePage';
import VerifyScreen from './views/verify';
import Map from './views/MapGoBrrrrrrrrrrr';
import PersonalInformationForm from './views/PersonalInformation';
import DocumentsPage from './views/DocumentsPage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: '#facc15', // yellow
				tabBarInactiveTintColor: 'gray',
				tabBarIcon: ({ color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap = 'home';

					if (route.name === 'Orders') iconName = 'receipt-outline';
					else if (route.name === 'Account') iconName = 'person-circle-outline';

					return <Ionicons name={iconName} size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Orders" component={OrdersScreen} />
			<Tab.Screen name="Account" component={AccountPage} />
		</Tab.Navigator>
	);
}

export default function RootLayout() {
	const [initialRoute, setInitialRoute] = useState<string | null>(null);

	useEffect(() => {
		const checkVerification = async () => {
			try {
				const isVerified = await AsyncStorage.getItem('isVerified');
				if (isVerified === 'true') {
					setInitialRoute('MainTabs');
				} else {
					setInitialRoute('Phone');
				}
			} catch {
				setInitialRoute('Phone');
			}
		};

		checkVerification();
	}, []);

	if (!initialRoute) {
		return (
			<SafeAreaView
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<ActivityIndicator size="large" color="#000" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
			>
				<Stack.Screen name="Phone" component={RegisterScreen} />
				<Stack.Screen name="Verify" component={VerifyScreen} />
				<Stack.Screen name="PersonalInformation" component={PersonalInformationForm} />
				<Stack.Screen name="Documents" component={DocumentsPage} />
				<Stack.Screen name="Details" component={FinalDetailsPage} />
				<Stack.Screen name="RegistrationCompleted" component={RegistrationPage} />
				<Stack.Screen name="Vehicle" component={VehicleDetailsPage} />
				<Stack.Screen name="Bank" component={BankDetailsPage} />
				<Stack.Screen name="Emergency" component={EmergencyDetailsPage} />
				<Stack.Screen name="Aadhaar" component={AadhaarCardDetails} />
				<Stack.Screen name="LeaveSubmitted" component={LeaveSubmittedPage} />
				<Stack.Screen name="Leave" component={LeavePage} />
				<Stack.Screen name="Map" component={Map} />
				<Stack.Screen name="MainTabs" component={MainTabs} />
				<Stack.Screen name="Ordersr" component={OrdersScreen} />
			</Stack.Navigator>
		</SafeAreaView>
	);
}
