import Background from '@/app/views/Background';
import { ButtonHighlight } from '@/app/components/button';
import CheckBox from '@/app/components/checkbox';
import { Input } from '@/app/components/input';
import { Body } from '@/app/components/typography';
import { theme } from '@/app/constants/theme';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
	const navigation = useNavigation();
	const [checked, setChecked] = useState<boolean>(false);
	const [number, setNumber] = useState<string>('');

	const handleCheckboxPress = () => {
		setChecked((prev) => {
			return !prev;
		});
	};

	return (
		<View className="relative flex w-screen dark:bg-pink-400 bg-white h-screen overflow-hidden">
			<Background />
			<View className="w-full h-2/6 px-5 flex gap-4 justify-end pb-16">
				<Input
					type="number"
					limit={10}
					label="Enter Mobile Number"
					placeholder="e.g. 9999988888"
					value={number}
					onChange={(data) => setNumber(data)}
					className="w-full h-12 outline-secondary border-primary border px-5 mt-2 rounded-lg"
				/>

				<CheckBox
					checked={checked}
					onClick={handleCheckboxPress}
					boxOutlineColor={theme.colors.primary}
					checkmarkColor={theme.colors.text}
				>
					<Text className="text-slate-900 ml-2">
						By signing up I agree to the{' '}
						<Text className="text-primary font-semibold">Terms of use</Text> and{' '}
						<Text className="text-primary font-semibold">Privacy Policy</Text>.
					</Text>
				</CheckBox>

				<ButtonHighlight onPress={handlePress} className="w-full h-12 mt-4">
					<Body className="text-center !text-white !font-semibold" text="Send OTP" />
				</ButtonHighlight>
			</View>
		</View>
	);

	function handlePress() {
		if (number.length !== 10 || !/^\d{10}$/.test(number)) {
			alert('Please enter a valid 10-digit mobile number');
			return;
		}

		// If checkbox isn't checked
		if (!checked) {
			alert('Please agree to the Terms of Use and Privacy Policy');
			return;
		}

		// console.log('Sending OTP to:', number);
		// Navigate to the OTP verification screen
		navigation.navigate('/reg/verify', { phoneNumber: number });
		// Add navigation to verify screen or API call here
	}
};

export default RegisterScreen;
