import { TextType } from '@/utils/types';
import { Text } from 'react-native';

const Heading = ({ className, text, children }: TextType) => {
	return (
		<Text className={`${className} text-3xl font-bold text-text`}>
			{text}
			{children}
		</Text>
	);
};

const Body = ({ className, text, children }: TextType) => {
	return (
		<Text className={`${className} text-lg text-text`}>
			{text}
			{children}
		</Text>
	);
};

const Caption = ({ className, text, children }: TextType) => {
	return (
		<Text className={`${className} text-sm font-thin text-text`}>
			{text}
			{children}
		</Text>
	);
};

export { Heading, Body, Caption };
