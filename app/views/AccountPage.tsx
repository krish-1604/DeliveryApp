import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function AccountPage() {
	const navigation = useNavigation<NavigationProp<'Account'>>();

	const handleMenuPress = async (title: string) => {
		switch (title) {
		case 'Edit Profile':
		case 'Allotted Area':
		case 'Support':
		case 'FAQ':
		case 'Terms and Conditions':
		case 'Privacy Policy':
		case 'Ask For Leave':
			// console.log(`Navigate to ${title}`);
			navigation.navigate(title);
			break;
		case 'Log Out':
			try {
				await AsyncStorage.clear(); // Clear all keys
				navigation.reset({
					index: 0,
					routes: [{ name: 'Phone' }],
				});
			} catch (error) {
				console.error('Failed to log out:', error);
			}
  			break;
		}
	};

	const menuItems = [
		{ title: 'Edit Profile', icon: 'person-outline' },
		{ title: 'Allotted Area', icon: 'location-outline' },
		{ title: 'Support', icon: 'headset-outline' },
		{ title: 'FAQ', icon: 'help-circle-outline' },
		{ title: 'Terms and Conditions', icon: 'document-text-outline' },
		{ title: 'Privacy Policy', icon: 'shield-checkmark-outline' },
		{ title: 'Ask For Leave', icon: 'mail-outline' },
		{ title: 'Log Out', icon: 'log-out-outline' },
	];

	return (
		<SafeAreaView style={{ paddingTop: 30 }} className="flex-1 px-4">
			{/* Header */}
			<View className="flex-row items-center justify-center mb-6">
				<Ionicons name="person-circle-outline" size={24} className="mr-2" />
				<Text className="text-2xl font-semibold text-black">Account</Text>
			</View>

			{/* Profile Box */}
			<View className="bg-white rounded-xl px-4 py-5 mb-6 flex-row items-center">
				<Image
					source={{
						uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBIcthqV0b6PKEn8GV0mX8nw8dpbQOkKOUWg&s',
					}}
					className="w-16 h-16 rounded-full mr-4"
				/>
				<View className="flex-1">
					<View className="flex-row items-center mb-1">
						<Ionicons name="person-outline" size={16} className="text-gray-600 mr-2" />
						<Text className="text-gray-800">IEEE Computer Society</Text>
					</View>
					<View className="flex-row items-center mb-1">
						<Ionicons name="call-outline" size={16} className="text-gray-600 mr-2" />
						<Text className="text-gray-800">+91 9999988888</Text>
					</View>
				</View>
			</View>

			{/* Options Title */}
			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-xl font-semibold text-black">Options</Text>
				<View className="flex-row items-center">
					<Text className="font-bold mr-1 text-black">4.9</Text>
					<Ionicons name="star" size={16} className="text-yellow-500" />
				</View>
			</View>

			{/* Menu Items */}
			<View className="bg-white rounded-xl overflow-hidden">
				{menuItems.map((item, index) => (
					<View key={item.title}>
						<MenuItem
							title={item.title}
							icon={
								<Ionicons
									name={item.icon as React.ComponentProps<typeof Ionicons>['name']}
									size={20}
								/>
							}
							onPress={() => handleMenuPress(item.title)}
						/>
						{index < menuItems.length - 1 && <Divider />}
					</View>
				))}
			</View>

			{/* Version */}
			<View className="items-center mt-8">
				<Text className="text-gray-400 text-sm">App Version 1.0.0 (30)</Text>
			</View>
		</SafeAreaView>
	);
}

function MenuItem({
	icon,
	title,
	onPress,
}: {
	icon: React.ReactNode;
	title: string;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity className="flex-row items-center justify-between p-4" onPress={onPress}>
			<View className="flex-row items-center">
				<View className="text-gray-600 mr-4">{icon}</View>
				<Text className="text-gray-800">{title}</Text>
			</View>
			<Ionicons name="chevron-forward-outline" size={20} className="text-gray-400" />
		</TouchableOpacity>
	);
}

function Divider() {
	return <View className="h-px bg-gray-100 ml-12" />;
}
