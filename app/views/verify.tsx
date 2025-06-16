import { ButtonHighlight, ButtonOpacity } from '@/app/components/button';
import { Body, Heading } from '@/app/components/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { View, Text } from 'react-native';
import { OTPType } from '@/app/utils/types';
import { OTPInput } from '@/app/components/input';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@/app/utils/types';

const VerifyScreen = () => {
	const [otp, setOtp] = useState<OTPType>({
		one: '',
		two: '',
		three: '',
		four: '',
		five: '',
		six: '',
	});

	const navigation = useNavigation<NavigationProp<'Verify'>>();
	const route = useRoute();
	const phoneNumber = (route.params as { phoneNumber: string })?.phoneNumber || '';

	function handlePress() {
		const otpValues = Object.values(otp).join('');
		if (otpValues.length !== 6 || !/^\d{6}$/.test(otpValues)) {
			alert('Please enter a valid 6-digit OTP');
			return;
		}
		alert(`OTP ${otpValues} verified successfully!`);
		navigation.navigate('PersonalInformation');
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

			<ButtonHighlight onPress={handlePress} className="w-full h-12 mt-4">
				<Body className="!font-semibold !text-white" text="Verify OTP" />
			</ButtonHighlight>
		</View>
	);
};

export default VerifyScreen;
