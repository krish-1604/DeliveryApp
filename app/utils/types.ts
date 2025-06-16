import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type React from 'react';

//
// -------------------------
// Component Prop Types
// -------------------------

interface OTPType {
	one: string;
	two: string;
	three: string;
	four: string;
	five: string;
	six: string;
}

interface TextType {
	className?: string;
	text: string;
	children?: React.ReactNode;
}

interface ButtonType {
	className?: string;
	disabled?: boolean;
	onPress: () => void;
	children: React.ReactNode;
}

interface InputType {
	type?: 'string' | 'number';
	limit?: number | null;
	className?: string;
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (data: string) => void;
	keyboardType?:
		| 'default'
		| 'number-pad'
		| 'decimal-pad'
		| 'numeric'
		| 'email-address'
		| 'phone-pad'
		| 'url';
}

interface OTPInputType {
	className?: string;
	label?: string;
	placeholder?: string;
	value: OTPType;
	onChange: (value: string, key: keyof OTPType) => void;
}

interface CheckBoxType {
	checked?: boolean;
	onClick: () => void;
	boxOutlineColor?: string | null;
	checkmarkColor?: string | null;
	children?: React.ReactNode;
}

export type { TextType, OTPType, ButtonType, InputType, OTPInputType, CheckBoxType };

//
// -------------------------
// Navigation Types (React Navigation)
// -------------------------

export type RootStackParamList = {
	Phone: undefined;
	Verify: { phoneNumber: string };
	PersonalInformation: undefined;
	Registration: undefined;
	Details: undefined;
	Documents: undefined;
	Vehicle: undefined;
	Bank: undefined;
	Emergency: undefined;
	Aadhaar: { text: string };
	LeaveSubmitted: undefined;
	Orders: undefined;
	Account: undefined;
	Leave: undefined;
	Map: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<
	RootStackParamList,
	T
>;

export type RouteProps<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
