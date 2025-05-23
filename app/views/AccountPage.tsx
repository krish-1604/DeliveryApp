import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountPage() {
	return (
		<View className="flex-1 bg-gray-50 p-5">
			<View className="flex-row items-center justify-center mb-4">
				<Ionicons name="person-circle-outline" size={24} className="mr-2" />
				<Text className="text-2xl font-semibold">Account</Text>
			</View>
			<View className="bg-white rounded-xl p-4 mb-6 flex-row items-center">
				<View className="mr-4">
					<Image
						source={{
							uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBIcthqV0b6PKEn8GV0mX8nw8dpbQOkKOUWg&s',
						}}
						className="w-16 h-16 rounded-full"
						alt="IEEE Logo"
					/>
				</View>
				<View className="flex-1">
					<View className="flex-row items-center mb-1">
						<Ionicons name="person-outline" size={16} className="text-gray-600 mr-2" />
						<Text className="text-gray-800">IEEE Computer Society</Text>
					</View>
					<View className="flex-row items-center mb-1">
						<Ionicons name="call-outline" size={16} className="text-gray-600 mr-2" />
						<Text className="text-gray-800">+91 9999988888</Text>
					</View>
					<View className="flex-row items-center">
						<Ionicons name="mail-outline" size={16} className="text-gray-600 mr-2" />
						<Text className="text-gray-800">ieecs@vit.ac.in</Text>
					</View>
				</View>
			</View>
			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-xl font-semibold">Options</Text>
				<View className="flex-row items-center">
					<Text className="font-bold mr-1">4.9</Text>
					<Ionicons name="star" size={16} className="text-yellow-500" />
				</View>
			</View>
			<View className="bg-white rounded-xl overflow-hidden">
				<MenuItem icon={<Ionicons name="person-outline" size={20} />} title="Edit Profile" />
				<Divider />
				<MenuItem icon={<Ionicons name="location-outline" size={20} />} title="Allotted Area" />
				<Divider />
				<MenuItem icon={<Ionicons name="headset-outline" size={20} />} title="Support" />
				<Divider />
				<MenuItem icon={<Ionicons name="help-circle-outline" size={20} />} title="FAQ" />
				<Divider />
				<MenuItem
					icon={<Ionicons name="document-text-outline" size={20} />}
					title="Terms and Conditions"
				/>
				<Divider />
				<MenuItem
					icon={<Ionicons name="shield-checkmark-outline" size={20} />}
					title="Privacy Policy"
				/>
				<Divider />
				<MenuItem icon={<Ionicons name="mail-outline" size={20} />} title="Ask For Leave" />
				<Divider />
				<MenuItem icon={<Ionicons name="log-out-outline" size={20} />} title="Log Out" />
			</View>
			<View className="items-center mt-8">
				<Text className="text-gray-400 text-sm">App Version 1.0.0 (30)</Text>
			</View>
			<View className="absolute bottom-0 left-0 right-0 h-16 bg-white flex-row justify-around items-center border-t border-gray-200">
				<TouchableOpacity className="items-center">
					<Ionicons name="receipt-outline" size={24} className="text-gray-500" />
					<Text className="text-gray-500 text-xs">Orders</Text>
				</TouchableOpacity>
				<TouchableOpacity className="items-center">
					<Ionicons name="person-circle-outline" size={24} className="text-yellow-500" />
					<Text className="text-yellow-500 text-xs">Account</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

function MenuItem({ icon, title }: { icon: React.ReactNode; title: string }) {
	return (
		<TouchableOpacity className="flex-row items-center justify-between p-4">
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
