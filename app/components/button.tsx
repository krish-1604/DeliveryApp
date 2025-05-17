import { ButtonType } from '@/app/utils/types';
import { TouchableHighlight, TouchableOpacity } from 'react-native';

const ButtonHighlight = ({ className, disabled = false, onPress, children }: ButtonType) => {
	return (
		<TouchableHighlight
			className={`${className} w-full h-12 bg-primary rounded-full flex items-center justify-center`}
			onPress={onPress}
			disabled={disabled}
		>
			{children}
		</TouchableHighlight>
	);
};

const ButtonOpacity = ({ className, disabled = false, onPress, children }: ButtonType) => {
	return (
		<TouchableOpacity
			className={`${className} w-full h-12 bg-primary rounded-full flex items-center justify-center`}
			onPress={onPress}
			disabled={disabled}
		>
			{children}
		</TouchableOpacity>
	);
};

export { ButtonHighlight, ButtonOpacity };
