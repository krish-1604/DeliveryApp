import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

export default function CheckedGotoListTile({ name = '', onPress = () => {}, isChecked = false }) {
	return (
		<View className="px-5 py-3">
			<Pressable
				onPress={onPress}
				className="flex-row items-center p-4 bg-white mx-2 my-0 rounded-lg shadow"
			>
				{isChecked && <Ionicons name="checkmark" size={24} color="#2B2E35" />}
				<View className="flex-1">
					<Text className="font-medium text-base text-[#2B2E35]">{name}</Text>
				</View>
				<View>
					<Ionicons name="chevron-forward" size={24} color="#969AA4" />
				</View>
			</Pressable>
		</View>
	);
}
