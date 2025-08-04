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
	// if (otpValues === '123456') {
	// 	await AsyncStorage.setItem('driverId', 'bypass-driver-id');
	// 	navigation.navigate('PersonalInformation');
	// 	return;
	// }
	try {
		setVerifying(true);
		const formatted = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
		const api = new DriverAPI();
		const response = await api.verifyOTP(formatted, otpValues);

		if (response.success && response.data?.driverId) {
			await AsyncStorage.setItem('driverId', response.data.driverId);
			navigation.navigate('PersonalInformation');
		} else {
			Alert.alert('Verification Failed', response.message || 'Invalid OTP');
		}
	} catch (err: unknown) {
	if ((err as AxiosError)?.response?.status === 400) {
		Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
	} else {
		Alert.alert('Error', 'Something went wrong while verifying OTP');
	}
}
 finally {
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
						{' '}Change
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