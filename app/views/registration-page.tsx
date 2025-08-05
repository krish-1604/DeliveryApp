import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import VerificationSVG from '../assets/images/svgs/verification.svg';
import VerificationListTile from '../components/verification-list-tile';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorToast from '../components/error';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegistrationPage() {
	const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const [errorMsg, setErrorMsg] = React.useState('');

	const [verificationData, setVerificationData] = React.useState([
		{ name: 'Personal Information', isVerified: true },
		{ name: 'Personal Documents', isVerified: true },
		{ name: 'Vehicle Details', isVerified: true },
		{ name: 'Bank Account Details', isVerified: true },
		{ name: 'Emergency Details', isVerified: true },
	]);

	React.useEffect(() => {
		const getVerificationStatus = async () => {
			const phoneNum = await AsyncStorage.getItem('phoneNumber');
			const URL = BACKEND_URL + '/api/auth/complete-verification';
			try {
				const response = await fetch(URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						phoneNumber: `+91${phoneNum}`,
					}),
				});

				const data = await response.json();
				console.log('Verification status:', data);
				// handle data here
			} catch (error) {
				console.error('Error fetching verification status:', error);
			}
		};
		getVerificationStatus();
	}, []);
	const handleButtonPress = async () => {
		try {
			await AsyncStorage.setItem('isVerified', 'true');
			navigation.navigate('Orders');
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while saving verification status.'
			);
			// console.error('Failed to save verification status:', error);
		}
	};
	const allVerified = useMemo(
		() => verificationData.every((item) => item.isVerified),
		[verificationData]
	);

	return (
		<View
			className="flex-1 bg-white"
			style={{
				flex: 1,
				backgroundColor: '#fff',
				paddingTop: insets.top,
			}}
		>
			<ScrollView
				contentContainerStyle={{ paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View className="bg-white rounded-b-3xl px-5 pt-12 pb-6 shadow-md z-10 relative">
					<View className="items-center">
						<Text className="text-xl font-semibold text-black">Registration Complete</Text>
					</View>

					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="absolute left-5 top-10 mt-2 ml-2 -translate-y-1/2 z-10"
					>
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
				</View>

				{/* Status Card */}
				<View className="bg-primary mx-4 mt-4 rounded-2xl">
					<View className="flex-row justify-between items-center px-6 py-6">
						<View className="flex-1">
							<Text className="text-white font-bold text-xl mb-2">
								Your application is under{'\n'}Verification
							</Text>
							<Text className="text-white text-base">Account will get activated in 48hrs</Text>
						</View>
						<View className="ml-4">
							<VerificationSVG width={80} height={80} />
						</View>
					</View>
				</View>

				{/* Verification List */}
				<View className="px-4 mt-6">
					{verificationData.map((item, index) => (
						<VerificationListTile
							key={index}
							name={item.name}
							onPress={() => {}}
							isVerified={item.isVerified}
						/>
					))}
				</View>
			</ScrollView>

			{/* Fixed Footer */}
			<View className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-6 bg-white border-t border-gray-200">
				<TouchableOpacity
					className={`w-full py-4 rounded-xl ${allVerified ? 'bg-primary' : 'bg-gray-300'}`}
					disabled={!allVerified}
					onPress={() => {
						if (allVerified) {
							handleButtonPress();
						}
					}}
				>
					<Text className="text-center text-white font-semibold text-base">
						{allVerified ? 'Let’s Start' : 'Please wait for verification'}
					</Text>
				</TouchableOpacity>

				{/* Help line */}
				<View className="flex-row justify-center items-center mt-4" style={{ paddingBottom: 34 }}>
					<Text className="text-gray-600 text-base">Need Help? </Text>
					<TouchableOpacity>
						<Text className="text-orange-500 font-medium text-base underline">Contact Us</Text>
					</TouchableOpacity>
				</View>
			</View>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}
		</View>
	);
}
