import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DriverMinimal {
	name: string;
	phoneNumber: string;
	profilePicture: string | null;
}

export default function AccountPage() {
	const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
	const [phoneNum, setPhoneNum] = useState('');
	const [driverDetails, setDriverDetails] = useState<DriverMinimal>();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationProp<'Account'>>();
	const fetchDriverDetails = async () => {
		try {
			const driverID = await AsyncStorage.getItem('driverId');
			// const token = await AsyncStorage.getItem('auth_token');
			// console.log(token);

			if (!driverID) {
				Alert.alert('Error', 'Driver ID not found.');
				navigation.reset({
					index: 0,
					routes: [{ name: 'Phone' }],
				});
				return;
			}
			const url = `${baseUrl}/api/drivers/${driverID}`;
			const response = await fetch(url, { method: 'GET' });

			if (!response.ok) {
				const errorText = await response.text();
				Alert.alert('Error', `Failed to fetch driver details: ${response.status} ${errorText}`);
				return;
			}

			const data = await response.json();
			setDriverDetails({
				name: `${data.driver.firstName} ${data.driver.lastName}`,
				phoneNumber: data.driver.phoneNumber,
				profilePicture: data.driver.profilePicture,
			});
			console.log('Driver details:', data);
		} catch (error) {
			console.error('Fetch driver details error:', error);
			Alert.alert('Error', 'Unable to fetch driver details. Please try again.');
		}
	};
	useEffect(() => {
		fetchDriverDetails();
	}, []);

	const handleMenuPress = async (title: string) => {
		switch (title) {
			case 'History':
				navigation.navigate('History');
				break;
			case 'Allotted Area':
				navigation.navigate('Allotted Area');
				break;
			case 'Support':
				navigation.navigate('Support');
				break;
			case 'FAQ':
				navigation.navigate('FAQ');
				break;
			case 'Terms and Conditions':
				navigation.navigate('Terms and Conditions');
				break;
			case 'Privacy Policy':
				navigation.navigate('Privacy Policy');
				break;
			case 'Ask For Leave':
				navigation.navigate('Ask For Leave');
				break;
			case 'Log Out':
				try {
					await AsyncStorage.clear();
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
		{ title: 'History', icon: 'receipt-outline' },
		{ title: 'Allotted Area', icon: 'location-outline' },
		{ title: 'Support', icon: 'headset-outline' },
		{ title: 'FAQ', icon: 'help-circle-outline' },
		{ title: 'Terms and Conditions', icon: 'document-text-outline' },
		{ title: 'Privacy Policy', icon: 'shield-checkmark-outline' },
		{ title: 'Ask For Leave', icon: 'mail-outline' },
		{ title: 'Log Out', icon: 'log-out-outline' },
	];

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#f8fafc',
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
			}}
		>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: 16,
					//backgroundColor: '#f8fafc',
					paddingHorizontal: 16,
					paddingBottom: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#d8d8d8ff',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.04,
					shadowRadius: 8,
				}}
			>
				<Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1e293b' }}>Your Account</Text>
			</View>
			<View style={{ flex: 1, marginHorizontal: 20, backgroundColor: '#f8fafc' }}>
				{/* Profile Box */}
				<View
					style={{
						backgroundColor: '#fff',
						borderRadius: 16,
						paddingHorizontal: 20,
						paddingVertical: 18,
						marginBottom: 24,
						flexDirection: 'row',
						alignItems: 'center',
						shadowColor: '#000',
						shadowOpacity: 0.04,
						shadowOffset: { width: 0, height: 2 },
						shadowRadius: 8,
						elevation: 2,
					}}
				>
					{/* Avatar */}
					<View
						style={{
							width: 64,
							height: 64,
							borderRadius: 32,
							marginRight: 16,
							borderWidth: 2,
							borderColor: '#007836ff',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f8f8f8ff',
							overflow: 'hidden',
						}}
					>
						{driverDetails?.profilePicture ? (
							<Image
								source={{ uri: driverDetails.profilePicture }}
								style={{
									width: 56,
									height: 56,
									borderRadius: 28,
								}}
							/>
						) : (
							<Ionicons name="person-outline" size={40} color="#6f7b8bff" />
						)}
					</View>

					{/* Details */}
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
							<Ionicons
								name="person-outline"
								size={18}
								color="#64748b"
								style={{ marginRight: 6 }}
							/>
							<Text style={{ color: '#1e293b', fontSize: 16, fontWeight: '600' }}>
								{driverDetails?.name}
							</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Ionicons name="call-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
							<Text style={{ color: '#374151', fontSize: 15 }}>{driverDetails?.phoneNumber}</Text>
						</View>
					</View>
				</View>

				{/* Options Title */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16,
					}}
				>
					<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Options</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: '#fff',
							borderRadius: 8,
							paddingHorizontal: 10,
							paddingVertical: 4,
						}}
					>
						<Text style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: 16, marginRight: 4 }}>
							4.9
						</Text>
						<Ionicons name="star" size={18} color="#f59e0b" />
					</View>
				</View>

				{/* Menu Items */}
				<View
					style={{
						backgroundColor: '#fff',
						borderRadius: 16,
						overflow: 'hidden',
						shadowColor: '#000',
						shadowOpacity: 0.03,
						shadowOffset: { width: 0, height: 1 },
						shadowRadius: 4,
						elevation: 1,
					}}
				>
					{menuItems.map((item, index) => (
						<View key={item.title}>
							<MenuItem
								title={item.title}
								icon={
									<Ionicons
										name={item.icon as React.ComponentProps<typeof Ionicons>['name']}
										size={22}
										color={item.title === 'Log Out' ? '#dc2626' : '#2563eb'}
									/>
								}
								onPress={() => handleMenuPress(item.title)}
								isLogout={item.title === 'Log Out'}
							/>
							{index < menuItems.length - 1 && <Divider />}
						</View>
					))}
				</View>

				{/* Version */}
				<View style={{ alignItems: 'center', marginTop: 32 }}>
					<Text style={{ color: '#64748b', fontSize: 13 }}>App Version 1.0.0 (30)</Text>
				</View>
			</View>
		</View>
	);
}

function MenuItem({
	icon,
	title,
	onPress,
	isLogout = false,
}: {
	icon: React.ReactNode;
	title: string;
	onPress: () => void;
	isLogout?: boolean;
}) {
	return (
		<TouchableOpacity
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingVertical: 18,
				paddingHorizontal: 20,
				backgroundColor: isLogout ? '#fef2f2' : 'transparent',
			}}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ marginRight: 16 }}>{icon}</View>
				<Text
					style={{
						color: isLogout ? '#dc2626' : '#1e293b',
						fontSize: 16,
						fontWeight: isLogout ? '700' : '500',
					}}
				>
					{title}
				</Text>
			</View>
			<Ionicons name="chevron-forward-outline" size={20} color="#94a3b8" />
		</TouchableOpacity>
	);
}

function Divider() {
	return <View style={{ height: 1, backgroundColor: '#f1f5f9', marginLeft: 58 }} />;
}
