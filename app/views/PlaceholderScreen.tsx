import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PlaceholderScreenProps {
	title: string;
	description?: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, description }) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				flex: 1,
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				backgroundColor: '#ffffff',
			}}
		>
			{/* Header with Back Button */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingVertical: 12,
					borderBottomWidth: 1,
					borderBottomColor: '#f1f5f9',
				}}
			>
				<TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
					<Ionicons name="arrow-back" size={24} color="#1e293b" />
				</TouchableOpacity>
				<Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>{title}</Text>
			</View>

			{/* Body */}
			<ScrollView
				contentContainerStyle={{
					padding: 20,
					flexGrow: 1,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text
					style={{
						fontSize: 28,
						fontWeight: '700',
						color: '#1e293b',
						marginBottom: 16,
						textAlign: 'center',
					}}
				>
					{title}
				</Text>
				<Text
					style={{
						fontSize: 15,
						color: '#64748b',
						textAlign: 'center',
						lineHeight: 22,
					}}
				>
					{description ?? 'Content coming soon. Please check back later.'}
				</Text>
			</ScrollView>
		</View>
	);
};

export default PlaceholderScreen;
