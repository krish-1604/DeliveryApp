import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	SafeAreaView,
	StatusBar,
	Dimensions,
	Modal,
	Alert,
	TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

interface Job {
	id: string;
	externalOrderId: string;
	sourceAddress: string;
	destinationAddress: string;
	price: number;
	createdAt: string; // can convert to Date object if needed
}

const allOrdersData = {
	Accepted: [
		{
			id: '#M1001',
			status: 'Delivered',
			center: 'VIT Hostel Mess A',
			items: [{ name: 'North Indian Thali', qty: 1, weight: '1 plate', from: 'Mess A' }],
			deliveryTo: 'Room 304, Block 1',
			amount: 120,
			paid: true,
		},
		{
			id: '#M1002',
			status: 'Pickup Pending',
			center: 'VIT Hostel Mess C',
			items: [{ name: 'South Indian Meal', qty: 2, weight: '2 plates', from: 'Mess C' }],
			deliveryTo: 'Room 101, Block 3',
			amount: 240,
			paid: false,
		},
		{
			id: '#M1003',
			status: 'Pickup Failed',
			center: 'VIT Hostel Mess B',
			items: [{ name: 'Continental Breakfast', qty: 1, weight: '1 plate', from: 'Mess B' }],
			deliveryTo: 'Room 205, Block 2',
			amount: 180,
			paid: true,
		},
	],
	Available: [
		{
			id: '#S2001',
			status: 'Pickup Pending',
			center: 'IEEE Computer Society',
			items: [
				{ name: 'Besan Ladoo', qty: 2, weight: '500g', from: 'Bombay Anand Bhavan' },
				{ name: 'Atta Ladoo', qty: 3, weight: '500g', from: 'Sri Krishna Sweets' },
			],
			deliveryTo: 'VIT, Katpadi',
			amount: 2300,
			paid: true,
		},
		{
			id: '#S2002',
			status: 'Pickup Failed',
			center: 'NSS Store',
			items: [{ name: 'Dry Fruits', qty: 1, weight: '1kg', from: 'Reliance Mart' }],
			deliveryTo: 'AB1 Gate',
			amount: 800,
			paid: false,
		},
	],
};

// Available status options
const statusOptions = ['Pickup Pending', 'Pickup Failed', 'Pickup Rescheduled', 'Delivered'];

export default function OrdersScreen() {
	const [otpModalVisible, setOtpModalVisible] = useState(false);
	const [otp, setOtp] = useState('');
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
	const [selectedTab, setSelectedTab] = useState<'Available' | 'Accepted'>('Available');
	const [selectedDate] = useState<string>('24/04/2025');
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [orders, setOrders] = useState(allOrdersData);
	const [availOrders, setAvailOrders] = useState<Job[]>([]); //TODO
	const [loading, setLoading] = useState(false); // TODO
	const [error, setError] = useState<string | null>(null);
	const [currentOrder, setCurrentOrder] = useState<string | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isAvailable, setIsAvailable] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

	const toggleExpand = (id: string) => {
		setExpandedOrder(expandedOrder === id ? null : id);
	};

	useEffect(() => {
		const fetchPendingJobs = async () => {
			//TODO
			setLoading(true);
			setError(null);
			const token = await AsyncStorage.getItem('auth_token');
			setToken(token);
			const URL = baseUrl + '/api/orders/driver/jobs/pending';
			try {
				const response = await fetch(URL, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error(`Error ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				if (data.success) {
					setAvailOrders(data.jobs);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
			} finally {
				setLoading(false);
			}
		};
		fetchPendingJobs();
	}, []);

	const [loadingPickup, setLoadingPickup] = useState(false);

	const handleConfirmPickup = async (orderId: string) => {
		//TODO
		setLoadingPickup(true);
		const URL = baseUrl + `/api/orders/driver/jobs/${orderId}/accept`;
		console.log(URL);
		try {
			const res = await fetch(URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log(res);
			if (res.status === 200) {
				const data = await res.json();
				console.log('Pickup confirmed:', data);

				if (data.success) {
					alert(data.message || 'Job accepted successfully!');
					await AsyncStorage.setItem('current_order', orderId);
					setCurrentOrder(orderId);
					setSelectedTab('Accepted');
				} else {
					alert('Could not accept job. Try again.');
				}
			} else if (res.status === 403) {
				alert('Please change your driver status to "AVAILABLE" to accept jobs.');
			} else if (res.status === 400) {
				alert('Invalid request. Please try again.');
			} else if (res.status === 409) {
				const data = await res.json();
				alert(data.error || 'Job not available.');
			} else {
				alert(`Error ${res.status}: ${res.statusText}`);
			}
		} catch (error) {
			console.error('Error confirming pickup:', error);
			alert('An error occurred while accepting the job.');
		} finally {
			setLoadingPickup(false);
		}
	};

	async function handleDeliveryOTP(orderId: string) {
		//TODO
		setLoading(true);
		setOtpModalVisible(true); // Open OTP modal
		try {
			const URL = baseUrl + `/api/orders/driver/jobs/${orderId}/send-delivery-otp`;
			console.log(URL);
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			console.log(response);
			// const data = await response.json();
			// if (response.ok && data.success) {
			// 	console.log('✅ OTP sent successfully:', data.message);
			// 	setOtpModalVisible(true); // Open OTP modal
			// } else {
			// 	console.error('❌ Failed to send OTP:', data.message);
			// 	Alert.alert(
			// 		'OTP Failed',
			// 		`Status: ${response.status} - ${data.message || 'Unknown error'}`
			// 	);
			// }
		} catch (error: any) {
			console.error('⚠️ Error sending OTP:', error);
			Alert.alert('OTP Failed', `An unexpected error occurred.`);
		} finally {
			setLoading(false);
		}
		return <View style={{ flex: 1, padding: 20 }}>{/* OTP Modal */}</View>;
	}

	async function handleVerifyDeliveryOTP() {
		// TODO
		const URL = baseUrl + `/api/orders/driver/jobs/${currentOrder}/verify-delivery`;
		setLoading(true);
		// if (otp == '123456') {
		// 	console.log('Delivery completed successfully');
		// 	setOtpModalVisible(false); // Hide modal
		// 	Alert.alert('Success', 'OTP verified successfully');
		// } else {
		// 	console.error('OTP verification failed');
		// 	Alert.alert('Error', 'Invalid OTP. Please try again.');
		// }
		try {
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ otp }),
			});
			console.log(response);
			console.log(token);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();
			if (data.success) {
				console.log('Delivery completed successfully:', data.message);
				setOtpModalVisible(false); // Hide modal
				Alert.alert('Success', 'OTP verified successfully');
			} else {
				console.error('OTP verification failed:', data.message);
				Alert.alert('Error', 'Invalid OTP. Please try again.');
			}
		} catch (error) {
			console.error('Error verifying OTP:', error);
			Alert.alert('Error', 'Something went wrong while verifying OTP.');
		} finally {
			setLoading(false);
		}
	}

	const handleAvailabilityChange = async (status: boolean) => {
		//TODO
		const URL = baseUrl + '/api/orders/driver/status';
		const availability = status ? 'AVAILABLE' : 'OFFLINE';
		try {
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					availability: availability,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();

			if (data.success) {
				console.log('✅ Status updated:', data.message);
				setIsAvailable(status);
				return { success: true, message: data.message };
			} else {
				console.error('❌ Failed to update status:', data.message);
				return { success: false, message: data.message };
			}
		} catch (error) {
			console.error('Error updating status:', error);
			return { success: false, message: error };
		}
	};

	const openStatusModal = (orderId: string) => {
		setSelectedOrderId(orderId);
		setShowStatusModal(true);
	};

	const updateOrderStatus = (newStatus: string) => {
		if (!selectedOrderId) return;

		setOrders((prevOrders) => {
			const updatedOrders = { ...prevOrders };

			// Update in both tabs
			Object.keys(updatedOrders).forEach((tab) => {
				updatedOrders[tab as keyof typeof updatedOrders] = updatedOrders[
					tab as keyof typeof updatedOrders
				].map((order) => (order.id === selectedOrderId ? { ...order, status: newStatus } : order));
			});

			return updatedOrders;
		});

		setShowStatusModal(false);
		setSelectedOrderId(null);
	};

	const ordersData = orders[selectedTab];

	const groupedOrders = ordersData.reduce(
		(acc, order) => {
			if (!acc[order.center]) acc[order.center] = [];
			acc[order.center].push(order);
			return acc;
		},
		{} as Record<string, typeof ordersData>
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
			<StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

			{/* Clean Header */}
			<View
				style={{
					backgroundColor: '#f8fafc',
					paddingHorizontal: 20,
					paddingVertical: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#f1f5f9',
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 16,
					}}
				>
					<View
						style={{
							backgroundColor: '#dbeafe',
							padding: 8,
							borderRadius: 12,
							marginRight: 8,
						}}
					>
						<Ionicons name="bag-outline" size={24} color="#2563eb" />
					</View>
					<Text
						style={{
							fontSize: 24,
							fontWeight: 'bold',
							color: '#1e293b',
						}}
					>
						Orders
					</Text>
				</View>

				{/* Dropdown selector and availability toggle */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					{/* Order Type Dropdown - REPLACED TABS */}
					<TouchableOpacity
						onPress={() => setDropdownVisible(true)}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: '#ffffff',
							borderRadius: 12,
							paddingHorizontal: 16,
							paddingVertical: 12,
							borderWidth: 1,
							borderColor: '#e2e8f0',
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.05,
							shadowRadius: 2,
							elevation: 1,
						}}
					>
						<Ionicons
							name={selectedTab === 'Accepted' ? 'checkmark-circle-outline' : 'time-outline'}
							size={18}
							color="#2563eb"
							style={{ marginRight: 8 }}
						/>
						<Text
							style={{
								fontSize: 16,
								fontWeight: '600',
								color: '#1e293b',
								marginRight: 8,
							}}
						>
							{selectedTab} Orders
						</Text>
						<Ionicons name="chevron-down" size={16} color="#64748b" />
					</TouchableOpacity>

					{/* Compact Availability Toggle - UNCHANGED */}
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: '#ffffff',
							borderRadius: 12,
							padding: 4,
							borderWidth: 1,
							borderColor: '#e2e8f0',
						}}
					>
						<TouchableOpacity
							onPress={() => handleAvailabilityChange(true)}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: 12,
								paddingVertical: 6,
								borderRadius: 8,
								backgroundColor: isAvailable ? '#dcfce7' : 'transparent',
							}}
						>
							<View
								style={{
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: isAvailable ? '#16a34a' : '#d1d5db',
									marginRight: 6,
								}}
							/>
							<Text
								style={{
									fontSize: 12,
									fontWeight: '600',
									color: isAvailable ? '#166534' : '#64748b',
								}}
							>
								Online
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => handleAvailabilityChange(false)}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: 12,
								paddingVertical: 6,
								borderRadius: 8,
								backgroundColor: !isAvailable ? '#fee2e2' : 'transparent',
							}}
						>
							<View
								style={{
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: !isAvailable ? '#dc2626' : '#d1d5db',
									marginRight: 6,
								}}
							/>
							<Text
								style={{
									fontSize: 12,
									fontWeight: '600',
									color: !isAvailable ? '#991b1b' : '#64748b',
								}}
							>
								Offline
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* ADD THIS: Dropdown Modal */}
			<Modal
				visible={dropdownVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setDropdownVisible(false)}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => setDropdownVisible(false)}
					style={{
						flex: 1,
						backgroundColor: 'rgba(0, 0, 0, 0.3)',
						justifyContent: 'flex-start',
						paddingTop: 120,
						paddingHorizontal: 20,
					}}
				>
					<View
						style={{
							backgroundColor: '#ffffff',
							borderRadius: 16,
							padding: 8,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.15,
							shadowRadius: 12,
							elevation: 8,
						}}
					>
						{/* Accepted Orders Option */}
						<TouchableOpacity
							onPress={() => {
								setSelectedTab('Accepted');
								setDropdownVisible(false);
							}}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: 16,
								paddingVertical: 14,
								borderRadius: 12,
								backgroundColor: selectedTab === 'Accepted' ? '#f0f9ff' : 'transparent',
								marginBottom: 4,
							}}
						>
							<View
								style={{
									backgroundColor: selectedTab === 'Accepted' ? '#dbeafe' : '#f1f5f9',
									padding: 8,
									borderRadius: 10,
									marginRight: 12,
								}}
							>
								<Ionicons
									name="checkmark-circle-outline"
									size={20}
									color={selectedTab === 'Accepted' ? '#2563eb' : '#64748b'}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Text
									style={{
										fontSize: 16,
										fontWeight: '600',
										color: selectedTab === 'Accepted' ? '#1e40af' : '#1e293b',
										marginBottom: 2,
									}}
								>
									Accepted Orders
								</Text>
								<Text
									style={{
										fontSize: 14,
										color: selectedTab === 'Accepted' ? '#3b82f6' : '#64748b',
									}}
								>
									Orders you have accepted
								</Text>
							</View>
							{selectedTab === 'Accepted' && (
								<Ionicons name="checkmark-circle" size={20} color="#10b981" />
							)}
						</TouchableOpacity>

						{/* Available Orders Option */}
						<TouchableOpacity
							onPress={() => {
								setSelectedTab('Available');
								setDropdownVisible(false);
							}}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingHorizontal: 16,
								paddingVertical: 14,
								borderRadius: 12,
								backgroundColor: selectedTab === 'Available' ? '#f0f9ff' : 'transparent',
							}}
						>
							<View
								style={{
									backgroundColor: selectedTab === 'Available' ? '#dbeafe' : '#f1f5f9',
									padding: 8,
									borderRadius: 10,
									marginRight: 12,
								}}
							>
								<Ionicons
									name="time-outline"
									size={20}
									color={selectedTab === 'Available' ? '#2563eb' : '#64748b'}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Text
									style={{
										fontSize: 16,
										fontWeight: '600',
										color: selectedTab === 'Available' ? '#1e40af' : '#1e293b',
										marginBottom: 2,
									}}
								>
									Available Orders
								</Text>
								<Text
									style={{
										fontSize: 14,
										color: selectedTab === 'Available' ? '#3b82f6' : '#64748b',
									}}
								>
									New orders waiting for acceptance
								</Text>
							</View>
							{selectedTab === 'Available' && (
								<Ionicons name="checkmark-circle" size={20} color="#10b981" />
							)}
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>

			{/* Content area */}
			<ScrollView
				style={{ flex: 1, backgroundColor: '#f8fafc' }}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 80 }}
			>
				{Object.keys(groupedOrders).length === 0 ? (
					<View
						style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							marginTop: 100,
						}}
					>
						<View
							style={{
								backgroundColor: '#f1f5f9',
								padding: 32,
								borderRadius: 32,
								marginBottom: 24,
							}}
						>
							<Ionicons name="bag-outline" size={80} color="#9ca3af" />
						</View>
						<Text
							style={{
								color: '#64748b',
								fontSize: 24,
								fontWeight: '600',
								marginBottom: 8,
							}}
						>
							No {selectedTab} Orders
						</Text>
						<Text
							style={{
								color: '#94a3b8',
								fontSize: 16,
								textAlign: 'center',
								lineHeight: 24,
							}}
						>
							{selectedTab} orders will appear here when available
						</Text>
					</View>
				) : (
					Object.entries(groupedOrders).map(([centerName, orders]) => (
						<View key={centerName} style={{ marginBottom: 32 }}>
							{/* Center Header */}
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: 16,
									paddingHorizontal: 4,
								}}
							>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 18,
											fontWeight: 'bold',
											color: '#1e293b',
											marginBottom: 4,
										}}
									>
										{centerName}
									</Text>
									<Text
										style={{
											fontSize: 14,
											color: '#64748b',
										}}
									>
										{orders.length} order{orders.length !== 1 ? 's' : ''}
									</Text>
								</View>
								<View style={{ flexDirection: 'row', gap: 12 }}>
									<TouchableOpacity
										style={{
											backgroundColor: '#fef3c7',
											padding: 8,
											borderRadius: 10,
											width: 36,
											height: 36,
											alignItems: 'center',
											justifyContent: 'center',
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.1,
											shadowRadius: 4,
										}}
									>
										<Ionicons name="call" size={16} color="#d97706" />
									</TouchableOpacity>
									<TouchableOpacity
										style={{
											backgroundColor: '#dcfce7',
											padding: 8,
											borderRadius: 10,
											width: 36,
											height: 36,
											alignItems: 'center',
											justifyContent: 'center',
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.1,
											shadowRadius: 4,
											elevation: 2,
										}}
									>
										<Ionicons name="navigate" size={16} color="#059669" />
									</TouchableOpacity>
								</View>
							</View>

							{/* Orders */}
							{orders.map((order, index) => (
								<View
									key={order.id}
									style={{
										marginBottom: 12,
										backgroundColor: '#ffffff',
										borderRadius: 16,
										padding: 16,
										shadowColor: '#000',
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 0.05,
										shadowRadius: 8,
										elevation: 2,
										borderWidth: 1,
										borderColor: '#f1f5f9',
									}}
								>
									<TouchableOpacity
										onPress={() => toggleExpand(order.id)}
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'flex-start',
										}}
									>
										<View style={{ flex: 1, marginRight: 12 }}>
											<Text
												style={{
													fontSize: 12,
													color: '#64748b',
													marginBottom: 3,
												}}
											>
												Order No. {order.id}
											</Text>
											<Text
												style={{
													fontSize: 16,
													color: '#1e293b',
													fontWeight: '600',
													lineHeight: 20,
													marginBottom: 3,
												}}
											>
												{order.items[0]?.name}
												{order.items.length > 1 && ` +${order.items.length - 1} more`}
											</Text>
											<Text
												style={{
													fontSize: 14,
													color: '#475569',
												}}
											>
												{order.items[0]?.weight}
											</Text>
										</View>

										<View style={{ alignItems: 'flex-end' }}>
											<View
												style={{
													paddingHorizontal: 12,
													paddingVertical: 6,
													borderRadius: 10,
													backgroundColor: getStatusStyle(order.status),
													marginBottom: 8,
												}}
											>
												<Text
													style={{
														fontSize: 12,
														fontWeight: '600',
														color: getStatusTextColor(order.status),
													}}
												>
													{order.status}
												</Text>
											</View>
											<Ionicons
												name={expandedOrder === order.id ? 'chevron-up' : 'chevron-down'}
												size={20}
												color="#9ca3af"
											/>
										</View>
									</TouchableOpacity>

									{expandedOrder === order.id && (
										<View
											style={{
												marginTop: 16,
												paddingTop: 16,
												borderTopWidth: 1,
												borderTopColor: '#f1f5f9',
											}}
										>
											{/* Items list */}
											<View style={{ marginBottom: 16 }}>
												<Text
													style={{
														fontSize: 14,
														fontWeight: '600',
														color: '#374151',
														marginBottom: 8,
													}}
												>
													Items
												</Text>
												{order.items.map((item, itemIndex) => (
													<View
														key={itemIndex}
														style={{
															flexDirection: 'row',
															justifyContent: 'space-between',
															alignItems: 'center',
															paddingVertical: 8,
															paddingHorizontal: 12,
															backgroundColor: '#f8fafc',
															borderRadius: 10,
															marginBottom: 6,
														}}
													>
														<View style={{ flex: 1 }}>
															<Text
																style={{
																	fontSize: 14,
																	fontWeight: '500',
																	color: '#1e293b',
																	marginBottom: 1,
																}}
															>
																{item.name}
															</Text>
															<Text
																style={{
																	fontSize: 12,
																	color: '#64748b',
																}}
															>
																{item.weight} × {item.qty}
															</Text>
														</View>
														<Text
															style={{
																fontSize: 10,
																color: '#64748b',
																backgroundColor: '#e2e8f0',
																paddingHorizontal: 8,
																paddingVertical: 4,
																borderRadius: 6,
															}}
														>
															{item.from}
														</Text>
													</View>
												))}
											</View>

											{/* Delivery info */}
											<View
												style={{
													backgroundColor: '#f8fafc',
													padding: 14,
													borderRadius: 12,
													marginBottom: 16,
												}}
											>
												<Text
													style={{
														fontSize: 14,
														color: '#374151',
														marginBottom: 6,
													}}
												>
													<Text style={{ fontWeight: '600' }}>Delivery To: </Text>
													{order.deliveryTo}
												</Text>
												<Text
													style={{
														fontSize: 20,
														fontWeight: 'bold',
														color: '#1e293b',
													}}
												>
													₹{order.amount.toLocaleString()}
													<Text
														style={{
															fontSize: 14,
															fontWeight: '500',
															marginLeft: 6,
															color: order.paid ? '#059669' : '#dc2626',
														}}
													>
														{order.paid ? ' (Paid)' : ' (Unpaid)'}
													</Text>
												</Text>
											</View>

											{/* Action buttons */}
											<View
												style={{
													flexDirection: 'row',
													gap: 10,
												}}
											>
												<TouchableOpacity
													onPress={
														selectedTab === 'Available'
															? () => handleConfirmPickup(order.id)
															: () => handleDeliveryOTP(order.id)
													}
													disabled={loadingPickup}
													style={{
														flex: 1, // make it take equal space
														backgroundColor: loadingPickup ? '#ccc' : '#007bff',
														paddingVertical: 12,
														borderRadius: 12,
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
														{selectedTab === 'Accepted'
															? 'Deliver Item'
															: loadingPickup
																? 'Confirming...'
																: 'Confirm Pickup'}
													</Text>
												</TouchableOpacity>

												<TouchableOpacity
													onPress={() => openStatusModal(order.id)}
													style={{
														flex: 1,
														backgroundColor: '#ffffff',
														borderWidth: 1.5,
														borderColor: '#e2e8f0',
														paddingVertical: 12,
														borderRadius: 12,
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<Text
														style={{
															color: '#374151',
															fontWeight: 'bold',
															textAlign: 'center',
															fontSize: 14,
														}}
													>
														Update Status
													</Text>
												</TouchableOpacity>
											</View>
										</View>
									)}
								</View>
							))}
						</View>
					))
				)}
			</ScrollView>
			<Modal visible={otpModalVisible} transparent animationType="fade">
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						paddingHorizontal: 20,
					}}
				>
					<View
						style={{
							width: '100%',
							maxWidth: 340,
							backgroundColor: '#ffffff',
							borderRadius: 20,
							padding: 24,
							shadowColor: '#000',
							shadowOffset: {
								width: 0,
								height: 4,
							},
							shadowOpacity: 0.25,
							shadowRadius: 16,
							elevation: 8,
						}}
					>
						{/* Header with Icon */}
						<View style={{ alignItems: 'center', marginBottom: 24 }}>
							<View
								style={{
									width: 60,
									height: 60,
									borderRadius: 30,
									backgroundColor: '#f0f9ff',
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 16,
								}}
							>
								<Ionicons name="shield-checkmark" size={28} color="#0ea5e9" />
							</View>
							<Text
								style={{
									fontSize: 22,
									fontWeight: '700',
									color: '#1e293b',
									textAlign: 'center',
									marginBottom: 8,
								}}
							>
								Delivery Verification
							</Text>
							<Text
								style={{
									fontSize: 14,
									color: '#64748b',
									textAlign: 'center',
									lineHeight: 20,
								}}
							>
								Please enter the OTP provided by the customer to confirm delivery
							</Text>
						</View>

						{/* OTP Input */}
						<View style={{ marginBottom: 24 }}>
							<Text
								style={{
									fontSize: 14,
									fontWeight: '600',
									color: '#374151',
									marginBottom: 8,
								}}
							>
								Delivery OTP
							</Text>
							<TextInput
								value={otp}
								onChangeText={setOtp}
								placeholder="Enter 6-digit OTP"
								keyboardType="numeric"
								maxLength={6}
								style={{
									borderWidth: 1.5,
									borderColor: otp.length > 0 ? '#0ea5e9' : '#e2e8f0',
									borderRadius: 12,
									paddingVertical: 16,
									paddingHorizontal: 16,
									fontSize: 16,
									fontWeight: '500',
									backgroundColor: '#fafafa',
									textAlign: 'center',
									letterSpacing: 2,
								}}
								placeholderTextColor="#9ca3af"
							/>
						</View>

						{/* Action Buttons */}
						<View style={{ flexDirection: 'row', gap: 12 }}>
							<TouchableOpacity
								onPress={() => {
									setOtpModalVisible(false);
								}}
								style={{
									flex: 1,
									paddingVertical: 16,
									borderRadius: 12,
									backgroundColor: '#f8fafc',
									borderWidth: 1,
									borderColor: '#e2e8f0',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Text
									style={{
										fontSize: 16,
										fontWeight: '600',
										color: '#64748b',
									}}
								>
									Cancel
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => {
									if (otp.length === 6) {
										handleVerifyDeliveryOTP();
									} else {
										Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
									}
								}}
								style={{
									flex: 1,
									paddingVertical: 16,
									borderRadius: 12,
									backgroundColor: otp.length === 6 ? '#10b981' : '#9ca3af',
									alignItems: 'center',
									justifyContent: 'center',
									shadowColor: '#10b981',
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: otp.length === 6 ? 0.2 : 0,
									shadowRadius: 4,
									elevation: otp.length === 6 ? 2 : 0,
								}}
							>
								<Text
									style={{
										fontSize: 16,
										fontWeight: '700',
										color: '#ffffff',
									}}
								>
									Verify OTP
								</Text>
							</TouchableOpacity>
						</View>

						{/* Additional Help Text */}
						<Text
							style={{
								fontSize: 12,
								color: '#9ca3af',
								textAlign: 'center',
								marginTop: 16,
								lineHeight: 16,
							}}
						>
							Having trouble? Ask the customer to check their phone for the OTP
						</Text>
					</View>
				</View>
			</Modal>
			{/* Status Selection Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={showStatusModal}
				onRequestClose={() => setShowStatusModal(false)}
			>
				<View
					style={{
						flex: 1,
						justifyContent: 'flex-end',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
					}}
				>
					<View
						style={{
							backgroundColor: '#ffffff',
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							paddingTop: 20,
							paddingHorizontal: 20,
							paddingBottom: 40,
							maxHeight: '70%',
						}}
					>
						{/* Modal Header */}
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: 20,
							}}
						>
							<Text
								style={{
									fontSize: 20,
									fontWeight: 'bold',
									color: '#1e293b',
								}}
							>
								Update Status
							</Text>
							<TouchableOpacity
								onPress={() => setShowStatusModal(false)}
								style={{
									padding: 8,
									borderRadius: 8,
									backgroundColor: '#f1f5f9',
								}}
							>
								<Ionicons name="close" size={20} color="#64748b" />
							</TouchableOpacity>
						</View>

						{/* Status Options */}
						<ScrollView showsVerticalScrollIndicator={false}>
							{statusOptions.map((status, index) => (
								<TouchableOpacity
									key={status}
									onPress={() => updateOrderStatus(status)}
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'space-between',
										paddingVertical: 16,
										paddingHorizontal: 16,
										marginBottom: 8,
										backgroundColor: '#f8fafc',
										borderRadius: 12,
										borderWidth: 1,
										borderColor: '#f1f5f9',
									}}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<View
											style={{
												width: 12,
												height: 12,
												borderRadius: 6,
												backgroundColor: getStatusStyle(status),
												marginRight: 12,
											}}
										/>
										<Text
											style={{
												fontSize: 16,
												fontWeight: '500',
												color: '#1e293b',
											}}
										>
											{status}
										</Text>
									</View>
									<Ionicons name="chevron-forward" size={16} color="#9ca3af" />
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const getStatusStyle = (status: string) => {
	switch (status) {
		case 'Pickup Pending':
			return '#fef3c7';
		case 'Pickup Failed':
			return '#fee2e2';
		case 'Pickup Rescheduled':
			return '#fed7aa';
		case 'Delivered':
			return '#dcfce7';
		default:
			return '#f3f4f6';
	}
};

const getStatusTextColor = (status: string) => {
	switch (status) {
		case 'Pickup Pending':
			return '#d97706';
		case 'Pickup Failed':
			return '#dc2626';
		case 'Pickup Rescheduled':
			return '#ea580c';
		case 'Delivered':
			return '#059669';
		default:
			return '#6b7280';
	}
};
