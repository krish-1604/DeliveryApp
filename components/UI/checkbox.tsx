import { theme } from '@/constants/theme';
import { CheckBoxType } from '@/utils/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import AnimatedCheckbox from 'react-native-checkbox-reanimated';

const CheckBox = ({
	boxOutlineColor = null,
	checkmarkColor = null,
	checked = false,
	onClick,
	children,
}: CheckBoxType) => {
	return (
		<View className="flex flex-row items-center">
			<Pressable onPress={onClick} className="w-6 h-6">
				<AnimatedCheckbox
					checked={checked}
					highlightColor={boxOutlineColor || theme.colors.primary}
					checkmarkColor={checkmarkColor || theme.colors.text}
					boxOutlineColor={boxOutlineColor || theme.colors.primary}
				/>
			</Pressable>
			{children}
		</View>
	);
};

export default CheckBox;
