import { ButtonHighlight, ButtonOpacity } from '@/app/components/button';
import { Body, Heading } from '@/app/components/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { View } from 'react-native';
import { OTPType } from '@/app/utils/types';
import { OTPInput } from '@/app/components/input';

const verifyScreen = () => {
	const [otp, setOtp] = useState<OTPType>({
		one: '',
		two: '',
		three: '',
		four: '',
		five: '',
		six: '',
	});
	return (
		<View className="px-5 flex mt-10 gap-5">
			<ButtonOpacity
				className="!bg-transparent !w-10 !h-10 active:bg-slate-200 !p-5"
				onPress={() => {}}
			>
				<Ionicons name="chevron-back" size={24} color="black" />
			</ButtonOpacity>
			<Heading text="Enter OTP to verify" />
			<Body text="A 6 digit OTP has been sent to your phone number +91 9999988888. ">
				<Body className="font-bold !text-primary" text="Change" />
			</Body>

			<OTPInput onChange={(value, key) => setOtp({ ...otp, [key]: value })} value={otp} />

			<ButtonHighlight onPress={() => {}}>
				<Body className="!font-semibold !text-white" text="Verify OTP" />
			</ButtonHighlight>
		</View>
	);
};

export default verifyScreen;
