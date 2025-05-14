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
