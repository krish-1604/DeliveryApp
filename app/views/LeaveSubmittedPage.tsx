import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LeaveSubmittedPage() {
	const handleOkayPress = () => {
		// Navigate back to the main leave application page or home
		// navigation.navigate('LeaveApplication');
	};

	return (
		<View className="flex-1  justify-center items-center px-8">
			<Ionicons name="checkmark-circle" size={128} className="text-teal-700 mb-4" />

			<Text className="text-2xl font-semibold text-gray-800 text-center mb-4">
				Your application is submitted successfully
			</Text>

			<Text className="text-gray-500 text-center text-base mb-12 leading-6">
				Please wait and check your application status under My Application
			</Text>

			<TouchableOpacity
				onPress={handleOkayPress}
				className="bg-white border-2 border-teal-900 rounded-full py-4 px-12 min-w-[200px]"
			>
				<Text className="text-teal-900 font-medium text-lg text-center">Okay</Text>
			</TouchableOpacity>
		</View>
	);
}
