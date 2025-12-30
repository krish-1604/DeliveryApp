import React, { useEffect, useState } from 'react';
import '../global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

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
import Splash from './views/splash';
import HistoryScreen from './views/OrderHistory';
import PlaceholderScreen from './views/PlaceholderScreen';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarShowLabel: true,
				tabBarActiveTintColor: '#faa41aff',
				tabBarInactiveTintColor: 'gray',
				swipeEnabled: true,
				animationEnabled: true,
				tabBarIndicatorStyle: { backgroundColor: '#fff' },
				tabBarStyle: {
					backgroundColor: 'white',
					paddingBottom: 12,
					paddingTop: 4,

					borderTopWidth: 0.5,
					borderTopColor: '#e0e0e0',
				},
				tabBarIcon: ({ color }) => {
					let iconName: keyof typeof Ionicons.glyphMap = 'home';

					if (route.name === 'Orders') iconName = 'bag';
					else if (route.name === 'Account') iconName = 'person';

					return <Ionicons name={iconName} size={22} color={color} />;
				},
			})}
			tabBarPosition="bottom"
		>
			<Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
			<Tab.Screen name="Account" component={AccountPage} options={{ tabBarLabel: 'Account' }} />
		</Tab.Navigator>
	);
}

export default function RootLayout() {
	const [initialRoute, setInitialRoute] = useState<string | null>(null);

	useEffect(() => {
		const determineInitialRoute = async () => {
			// await AsyncStorage.removeItem('phoneNumber');
			//await AsyncStorage.setItem('isVerified', 'false');
			try {
				const [isVerifiedEntry, detailsSubmitEntry, driverIdEntry] = await AsyncStorage.multiGet([
					'isVerified',
					'detailsSubmit',
					'driverId',
				]);
				const isVerifiedValue = isVerifiedEntry?.[1] === 'true';
				const driverIdValue = driverIdEntry?.[1] ?? '';
				const hasSubmittedDetails = detailsSubmitEntry?.[1] === 'true';

				console.log('DRIVERID:', driverIdValue);

				if (isVerifiedValue && driverIdValue) {
					setInitialRoute('MainTabs');
				} else if (driverIdValue) {
					if (hasSubmittedDetails) {
						setInitialRoute('RegistrationCompleted');
					} else {
						setInitialRoute('Details');
					}
				} else {
					await AsyncStorage.multiRemove(['isVerified', 'authToken', 'driverId', 'userProfile']);
					setInitialRoute('Phone');
				}
			} catch {
				await AsyncStorage.clear();
				setInitialRoute('Phone');
			}
		};
		//setInitialRoute('PersonalInformation');
		determineInitialRoute();
	}, []);

	if (!initialRoute) {
		return (
			<SafeAreaProvider
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<ActivityIndicator size="large" color="#FAA41A" />
			</SafeAreaProvider>
		);
	}

	// const isAndroid = Platform.OS === 'android';
	// const Container = isAndroid ? SafeAreaView : View;

	return (
		<SafeAreaProvider style={{ flex: 1, backgroundColor: 'white' }}>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
			>
				<Stack.Screen name="Splash" component={Splash} />
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
				{/* <Stack.Screen name="Ask For Leave" component={LeavePage} /> */}
				<Stack.Screen name="Map" component={Map} />
				<Stack.Screen name="MainTabs" component={MainTabs} />
				<Stack.Screen name="Orders" component={OrdersScreen} />
				<Stack.Screen name="History" component={HistoryScreen} />
				<Stack.Screen name="Terms and Conditions" options={{ title: 'Terms & Conditions' }}>
					{() => <PlaceholderScreen title="Terms & Conditions" />}
				</Stack.Screen>
				<Stack.Screen name="Privacy Policy" options={{ title: 'Privacy Policy' }}>
					{() => <PlaceholderScreen title="Privacy Policy" />}
				</Stack.Screen>
				<Stack.Screen name="FAQ" options={{ title: 'About Us' }}>
					{() => <PlaceholderScreen title="About Us" />}
				</Stack.Screen>
				<Stack.Screen name="Support" options={{ title: 'Support' }}>
					{() => <PlaceholderScreen title="Support" />}
				</Stack.Screen>
				<Stack.Screen name="Allotted Area" options={{ title: 'Allotted Area' }}>
					{() => <PlaceholderScreen title="Allotted Area" />}
				</Stack.Screen>
				<Stack.Screen name="Ask For Leave" options={{ title: 'Ask For Leave' }}>
					{() => <PlaceholderScreen title="Ask For Leave" />}
				</Stack.Screen>
				<Stack.Screen name="Placeholder" options={{ title: 'Coming Soon' }}>
					{() => <PlaceholderScreen title="Coming Soon" />}
				</Stack.Screen>
			</Stack.Navigator>
		</SafeAreaProvider>
	);
}
