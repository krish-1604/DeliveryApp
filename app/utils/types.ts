import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type React from 'react';

export interface OTPType {
	one: string;
	two: string;
	three: string;
	four: string;
	five: string;
	six: string;
}

export interface TextType {
	className?: string;
	text: string;
	children?: React.ReactNode;
}

export interface ButtonType {
	className?: string;
	disabled?: boolean;
	onPress: () => void;
	children: React.ReactNode;
}

export interface InputType {
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

export interface OTPInputType {
	className?: string;
	label?: string;
	placeholder?: string;
	value: OTPType;
	onChange: (value: string, key: keyof OTPType) => void;
}

export interface CheckBoxType {
	checked?: boolean;
	onClick: () => void;
	boxOutlineColor?: string | null;
	checkmarkColor?: string | null;
	children?: React.ReactNode;
}

// Navigation types

export type RootStackParamList = {
	Phone: undefined;
	Verify: { phoneNumber: string };
	PersonalInformation: undefined;
	RegistrationCompleted: undefined;
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

	// Account-specific screens
	'Edit Profile': undefined;
	'Allotted Area': undefined;
	Support: undefined;
	FAQ: undefined;
	'Terms and Conditions': undefined;
	'Privacy Policy': undefined;
	'Ask For Leave': undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<
	RootStackParamList,
	T
>;

export type RouteProps<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

// Add this to support menu logic
export type MenuRoute = keyof RootStackParamList | 'Log Out';
