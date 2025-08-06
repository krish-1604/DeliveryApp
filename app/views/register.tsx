import Background from '@/app/views/Background';
import { ButtonHighlight } from '@/app/components/button';
import CheckBox from '@/app/components/checkbox';
import { Input } from '@/app/components/input';
import { Body } from '@/app/components/typography';
import { theme } from '@/app/constants/theme';
import { useEffect, useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@/app/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverAPI } from '@/app/utils/routes/driver';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationProp<'Phone'>>();
	const [checked, setChecked] = useState(false);
	const [number, setNumber] = useState('');
	const [loading, setLoading] = useState(false);

	const handleCheckboxPress = () => {
		setChecked((prev) => !prev);
	};

	useEffect(() => {
		const checkDriverID = async () => {
			const ID = await AsyncStorage.getItem('driverID');
			if (ID) {
				navigation.navigate('Details');
			}
		};
		checkDriverID();
	}, []);

	const handlePress = async () => {
		if (number.length !== 10 || !/^\d{10}$/.test(number)) {
			Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
			return;
		}

		if (!checked) {
			Alert.alert('Error', 'Please agree to the Terms of Use and Privacy Policy');
			return;
		}

		try {
			setLoading(true);
			console.log('1 --------------------------------- 1');
			const api = new DriverAPI();
			console.log('2 --------------------------------- 2');
			const response = await api.sendOTP(number);
			console.log('3 --------------------------------- 3');
			console.log(response);
			if (response.success) {
				await AsyncStorage.setItem('phoneNumber', number);
				navigation.navigate('Verify');
			} else {
				Alert.alert('Failed', response.message || 'Failed to send OTP');
			}
		} catch {
			Alert.alert('Error', 'Something went wrong while sending OTP');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View
			className="relative flex w-screen bg-white h-screen overflow-hidden"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<Background />
			<View className="w-full h-2/6 px-5 flex gap-4 justify-end mt-10">
				<Input
					type="number"
					limit={10}
					label="Enter Mobile Number"
					placeholder="e.g. 9999988888"
					value={number}
					keyboardType="numeric"
					onChange={setNumber}
					className="w-full h-12 outline-secondary border-primary border px-5 mt-2 rounded-lg"
				/>

				<CheckBox
					checked={checked}
					onClick={handleCheckboxPress}
					boxOutlineColor={theme.colors.primary}
					checkmarkColor="#fff"
				>
					<Text className="text-slate-900 ml-2">
						By signing up I agree to the{' '}
						<Text className="text-primary font-semibold">Terms of use</Text> and{' '}
						<Text className="text-primary font-semibold">Privacy Policy</Text>.
					</Text>
				</CheckBox>

				<ButtonHighlight onPress={handlePress} className="w-full h-12 mt-4" disabled={loading}>
					<Body
						className="text-center !text-white !font-semibold"
						text={loading ? 'Sending...' : 'Send OTP'}
					/>
				</ButtonHighlight>
			</View>
		</View>
	);
};

export default RegisterScreen;
