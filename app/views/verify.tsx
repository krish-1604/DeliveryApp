import { ButtonHighlight, ButtonOpacity } from '@/app/components/button';
import { Body, Heading } from '@/app/components/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { OTPInput } from '@/app/components/input';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp, OTPType } from '@/app/utils/types';
import { DriverAPI } from '@/app/utils/routes/driver';
import { AxiosError } from 'axios';

const VerifyScreen = () => {
	const [otp, setOtp] = useState<OTPType>({
		one: '',
		two: '',
		three: '',
		four: '',
		five: '',
		six: '',
	});
	const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [verifying, setVerifying] = useState(false);

	const navigation = useNavigation<NavigationProp<'Verify'>>();

	useEffect(() => {
		const fetchPhoneNumber = async () => {
			const num = await AsyncStorage.getItem('phoneNumber');
			setPhoneNumber(num);
			setLoading(false);
		};
		fetchPhoneNumber();
	}, []);

	const handlePress = async () => {
		const otpValues = Object.values(otp).join('');
		if (otpValues.length !== 6 || !/^\d{6}$/.test(otpValues)) {
			Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
			return;
		}

		if (!phoneNumber) {
			Alert.alert('Error', 'Phone number not found');
			return;
		}

		try {
			setVerifying(true);

			const persistToken = async (token?: string | null) => {
				if (token) {
					await AsyncStorage.setItem('auth_token', token);
				}
			};

			// Testing backdoor: Allow test phone number with specific OTP
			if (phoneNumber === '8888888888' && otpValues === '123456') {
				// Mock successful verification for test user
				const mockResponse = {
					success: true,
					message: 'OTP verified successfully (TEST MODE)',
					userExists: false,
					isCompletelyVerified: false,
					token: 'test_token_' + Date.now(),
					driver: {
						id: 'test_driver_' + Date.now(),
						phoneNumber: '+918888888888',
						firstName: 'Test',
						lastName: 'User',
						profilePicture: null,
					},
				};

				await AsyncStorage.setItem('driverId', mockResponse.driver.id);
				await persistToken(mockResponse.token);

				if (mockResponse.userExists && mockResponse.isCompletelyVerified) {
					const payload: [string, string][] = [
						['isVerified', 'true'],
						[
							'userProfile',
							JSON.stringify({
								firstName: mockResponse.driver.firstName,
								lastName: mockResponse.driver.lastName,
								phoneNumber: mockResponse.driver.phoneNumber,
								profilePicture: mockResponse.driver.profilePicture,
							}),
						],
					];
					if (mockResponse.token) {
						payload.push(['auth_token', mockResponse.token]);
					}
					await AsyncStorage.multiSet(payload);
					navigation.navigate('MainTabs');
				} else {
					navigation.navigate('PersonalInformation');
				}
				return;
			}

			const formatted = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
			const api = new DriverAPI();
			const response = await api.verifyOTP(formatted, otpValues);
			console.log(response);
			if (response.success) {
				console.log(response);

				await AsyncStorage.setItem('driverId', response.driver.id);
				await persistToken(response.token);
				console.log(response.token);

				const profileEntry: [string, string] = [
					'userProfile',
					JSON.stringify({
						firstName: response.driver.firstName,
						lastName: response.driver.lastName,
						phoneNumber: response.driver.phoneNumber,
						profilePicture: response.driver.profilePicture,
					}),
				];

				if (response.userExists && response.isCompletelyVerified) {
					const entries: [string, string][] = [profileEntry, ['isVerified', 'true']];
					if (response.token) {
						entries.push(['auth_token', response.token]);
					}
					await AsyncStorage.multiSet(entries);
					navigation.navigate('MainTabs');
				} else if (response.userExists && !response.isCompletelyVerified) {
					await AsyncStorage.multiSet([profileEntry]);
					navigation.navigate('Details');
				} else {
					//await AsyncStorage.removeItem('phoneNumber');
					navigation.navigate('PersonalInformation');
				}
			} else {
				Alert.alert('Verification Failed', response.message || 'Invalid OTP');
			}
		} catch (err: unknown) {
			console.log(err);

			if ((err as AxiosError)?.response?.status === 400) {
				Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
			} else {
				Alert.alert('Error', 'Something went wrong while verifying OTP');
			}
		} finally {
			setVerifying(false);
		}
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="px-5 flex mt-10 gap-5">
			<ButtonOpacity
				className="!bg-transparent !w-10 !h-10 active:bg-slate-200 !p-5"
				onPress={() => navigation.goBack()}
			>
				<Ionicons name="chevron-back" size={24} color="black" />
			</ButtonOpacity>

			<Heading text="Enter OTP to verify" />

			<View>
				<Text className="text-text text-lg">
					A 6 digit OTP has been sent to your phone number +91 {phoneNumber}.
					<Text className="text-primary font-semibold" onPress={() => navigation.goBack()}>
						{' '}
						Change
					</Text>
				</Text>
			</View>

			<OTPInput onChange={(value, key) => setOtp({ ...otp, [key]: value })} value={otp} />

			<ButtonHighlight onPress={handlePress} className="w-full h-12 mt-4" disabled={verifying}>
				<Body
					className="!font-semibold !text-white"
					text={verifying ? 'Verifying...' : 'Verify OTP'}
				/>
			</ButtonHighlight>
		</View>
	);
};

export default VerifyScreen;
