import { Pressable, Text, View } from 'react-native';

export default function VerificationListTile({
	name = '',
	onPress = () => {},
	isVerified = false,
}) {
	return (
		<View className="px-5 py-3">
			<Pressable
				onPress={onPress}
				className="flex-row items-center justify-between p-4 bg-white mx-2 my-0 rounded-lg shadow"
			>
				<View className="flex-col">
					<Text className="font-medium text-base text-[#2B2E35] pb-1">{name}</Text>
					<Text className={` font-bold ${!isVerified ? 'text-[#969AA4]' : 'text-[#FAA41A]'}`}>
						{isVerified ? 'Verified' : 'Not Verified'}
					</Text>
				</View>
			</Pressable>
		</View>
	);
}
