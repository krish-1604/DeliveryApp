import { InputType, OTPInputType, OTPType } from '@/app/utils/types';
import {
	NativeSyntheticEvent,
	TextInput,
	TextInputChangeEventData,
	TextInputKeyPressEventData,
	View,
	Text,
} from 'react-native';
import { Caption } from './typography';
import { useRef } from 'react';

const Input = ({
	className,
	type = 'string',
	limit = null,
	label = '',
	placeholder = 'Enter a value',
	value,
	onChange,
	keyboardType = 'default',
}: InputType) => {
	const handleChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		if (e.nativeEvent.text === '') {
			onChange('');
			return;
		}

		let text = e.nativeEvent.text;
		if (type === 'number') {
			if (limit && text.length > limit) {
				return;
			}
			text = text.replace(/[^0-9]/g, '');
		}

		if (text) {
			onChange(text);
		}
	};

	return (
		<View>
			<Text style={{ color: '#0f172a', fontWeight: '500', marginBottom: 4 }}>{label}</Text>
			<TextInput
				className={`${className} w-full h-12 text-lg outline-secondary border-primary border px-5 py-1 mt-2 rounded-lg`}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				keyboardType={keyboardType}
			/>
		</View>
	);
};

const OTPInput = ({ value, onChange }: OTPInputType) => {
	const keys: Array<keyof OTPType> = ['one', 'two', 'three', 'four', 'five', 'six'];
	const inputsRef = useRef<Array<TextInput | null>>([]);
	const isUserTapRef = useRef(false); // Track if user manually tapped input

	const handleChange = (text: string, index: number) => {
		const digit = text.replace(/[^0-9]/g, '').slice(0, 1);
		onChange(digit, keys[index]);

		if (digit && index < keys.length - 1) {
			isUserTapRef.current = false; // Disable backward check
			inputsRef.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
		if (e.nativeEvent.key === 'Backspace' && !value[keys[index]]) {
			if (index > 0) {
				inputsRef.current[index - 1]?.focus();
			}
		}
	};

	const handleFocus = (index: number) => {
		// Only redirect if user manually tapped input
		if (isUserTapRef.current) {
			const firstEmptyIndex = keys.findIndex((key) => value[key] === '');
			if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
				inputsRef.current[firstEmptyIndex]?.focus();
			}
		}
		// Reset flag after focus check
		isUserTapRef.current = false;
	};

	return (
		<View>
			<Caption text="Enter OTP" />
			<View className="flex flex-row justify-between">
				{keys.map((key, index) => (
					<TextInput
						key={key}
						ref={(ref) => {
							inputsRef.current[index] = ref;
						}}
						className="w-12 h-12 outline-secondary text-center font-medium text-lg border-primary border px-4 mt-2 rounded-lg"
						value={value[key]}
						onChangeText={(text) => handleChange(text, index)}
						onKeyPress={(e) => handleKeyPress(e, index)}
						onFocus={() => handleFocus(index)}
						onTouchStart={() => {
							isUserTapRef.current = true;
						}} // detect manual tap
						keyboardType="number-pad"
						maxLength={1}
						returnKeyType="next"
						autoFocus={index === 0}
					/>
				))}
			</View>
		</View>
	);
};

export { Input, OTPInput };
