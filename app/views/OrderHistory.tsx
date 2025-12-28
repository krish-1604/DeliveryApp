import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export interface Address {
	zip: string;
	city: string;
	street: string;
}

export interface OrderHistory {
	id: string;
	orderId: string;
	externalOrderId: string;
	price: number;
	driverId: string;
	finalStatus: 'DELIVERED' | 'ACCEPTED' | 'CANCELLED' | 'PENDING';
	completedAt: string;
	sourceAddress: Address;
	destinationAddress: Address;
}

const HistoryScreen = () => {
	const insets = useSafeAreaInsets();
	const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
	const navigation = useNavigation();
	const [orders, setOrders] = useState<OrderHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

	const toggleExpand = (orderId: string) => {
		setExpandedOrder(expandedOrder === orderId ? null : orderId);
	};

	const getStatusStyle = (status: string) => {
		switch (status) {
			case 'DELIVERED':
				return { bg: '#059669', text: '#fff' }; // green
			case 'ACCEPTED':
				return { bg: '#2563eb', text: '#fff' }; // blue
			case 'CANCELLED':
				return { bg: '#dc2626', text: '#fff' }; // red
			case 'PENDING':
				return { bg: '#d97706', text: '#fff' }; // orange
			default:
				return { bg: '#6b7280', text: '#fff' }; // gray fallback
		}
	};

	useEffect(() => {
		const fetchOrders = async () => {
			const token = await AsyncStorage.getItem('auth_token');
			
			if (!token) {
				console.error('No auth token found in OrderHistory');
				setLoading(false);
				return;
			}
			
			const url = baseURL + '/api/orders/driver/jobs/history?limit=20&offset=0';
			try {
				const response = await fetch(url, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await response.json();
				console.log('Order history:', data);

				setOrders(data.history || []);
			} catch (error) {
				console.error('Error fetching order history:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#2563eb" />
				<Text style={{ marginTop: 10 }}>Loading order history...</Text>
			</View>
		);
	}

	return (
		<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: 16,
					marginLeft: 12,
					paddingHorizontal: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#d8d8d8ff',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.04,
					shadowRadius: 8,
				}}
			>
				<TouchableOpacity
					onPress={() => {
						navigation.goBack();
					}}
					style={{
						position: 'absolute',
						left: 8,
						top: 0,
						bottom: 8,
						justifyContent: 'center',
						alignItems: 'center',
						paddingRight: 12,
						zIndex: 2,
					}}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons name="arrow-back" size={28} color="#1e293b" />
				</TouchableOpacity>
				<Text
					style={{
						fontSize: 28,
						fontWeight: '700',
						color: '#1e293b',
						marginBottom: 12,
						paddingHorizontal: 16,
					}}
				>
					Order History
				</Text>
			</View>
			<FlatList
				data={orders}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 16 }}
				renderItem={({ item: order }) => {
					const statusStyle = getStatusStyle(order.finalStatus);
					return (
						<View
							style={{
								marginBottom: 12,
								backgroundColor: '#ffffff',
								borderRadius: 12,
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.05,
								shadowRadius: 4,
								elevation: 2,
								borderWidth: 1,
								borderColor: '#f1f5f9',
							}}
						>
							{/* Header with Order ID, Status, and Chevron */}
							<TouchableOpacity
								onPress={() => toggleExpand(order.id)}
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
									paddingHorizontal: 16,
									paddingVertical: 16,
								}}
							>
								<View style={{ flex: 1, marginRight: 8 }}>
									<Text
										style={{
											fontSize: 16,
											fontWeight: '600',
											color: '#1e293b',
										}}
									>
										Order ID: {order.externalOrderId}
									</Text>
									<Text
										style={{
											fontSize: 13,
											color: '#64748b',
											marginTop: 2,
										}}
									>
										{new Date(order.completedAt).toLocaleDateString('en-US', {
											day: 'numeric',
											month: 'short',
											year: 'numeric',
										})}{' '}
										•{' '}
										{new Date(order.completedAt).toLocaleTimeString('en-US', {
											hour: 'numeric',
											minute: '2-digit',
											hour12: true,
										})}
									</Text>
								</View>

								{/* Status pill */}
								<View
									style={{
										backgroundColor: statusStyle.bg,
										paddingHorizontal: 14,
										paddingVertical: 6,
										borderRadius: 9999, // makes it fully rounded
										marginRight: 12,
										minWidth: 70,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Text
										style={{
											fontSize: 12,
											fontWeight: '700',
											color: statusStyle.text,
											letterSpacing: 0.6,
											textTransform: 'capitalize',
										}}
									>
										{order.finalStatus.toLowerCase()}
									</Text>
								</View>

								{/* Chevron Icon */}
								<View
									style={{
										transform: [{ rotate: expandedOrder === order.id ? '180deg' : '0deg' }],
									}}
								>
									<Ionicons name="chevron-down" size={22} color="#64748b" />
								</View>
							</TouchableOpacity>

							{/* Expanded Details */}
							{expandedOrder === order.id && (
								<View
									style={{
										paddingHorizontal: 16,
										paddingBottom: 16,
										borderTopWidth: 1,
										borderTopColor: '#f1f5f9',
									}}
								>
									{/* Delivery Info */}
									<View
										style={{
											backgroundColor: '#f8fafc',
											padding: 16,
											borderRadius: 10,
											marginTop: 12,
											marginBottom: 16,
										}}
									>
										{/* Source */}
										<View style={{ marginBottom: 12 }}>
											<Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>
												PICKUP FROM
											</Text>
											<Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
												{order.sourceAddress.street}, {order.sourceAddress.city}
												{'\n'}
												{order.sourceAddress.zip}
											</Text>
										</View>

										{/* Destination */}
										<View style={{ marginBottom: 12 }}>
											<Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>
												DELIVER TO
											</Text>
											<Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
												{order.destinationAddress.street}, {order.destinationAddress.city}
												{'\n'}
												{order.destinationAddress.zip}
											</Text>
										</View>

										{/* Price */}
										<Text
											style={{
												fontSize: 22,
												fontWeight: 'bold',
												color: '#1e293b',
												marginTop: 4,
											}}
										>
											₹{order.price}
										</Text>
									</View>
								</View>
							)}
						</View>
					);
				}}
			/>
		</View>
	);
};

export default HistoryScreen;
