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
	Linking,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

interface Job {
	id: string;
	externalOrderId: string;
	sourceAddress: Address;
	destinationAddress: Address;
	price: number;
	createdAt: string;
}

export interface Address {
	zip: string;
	city: string;
	street: string;
}

export interface CustomerDetails {
	name: string;
	phone: string;
}

export interface Order {
	id: string;
	externalOrderId: string;
	sourceAddress: Address;
	destinationAddress: Address;
	customerDetails: CustomerDetails;
	price: number;
	numberOfItems: number;
	status: 'ACCEPTED' | 'DELIVERED' | 'CANCELLED';
	driverId: string;
	deliveryOtp: string | null;
	deliveryOtpExpiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export default function OrdersScreen() {
	// const placeholderJobs: Job[] = [
	// 	{
	// 		id: 'job_001',
	// 		externalOrderId: 'EXT12345',
	// 		sourceAddress: '123 Main St, Springfield',
	// 		destinationAddress: '456 Elm St, Shelbyville',
	// 		price: 250,
	// 		createdAt: new Date('2025-08-25T10:00:00Z').toISOString(),
	// 	},
	// 	{
	// 		id: 'job_002',
	// 		externalOrderId: 'EXT12346',
	// 		sourceAddress: '789 Oak St, Springfield',
	// 		destinationAddress: '321 Pine St, Shelbyville',
	// 		price: 320,
	// 		createdAt: new Date('2025-08-25T11:30:00Z').toISOString(),
	// 	},
	// 	{
	// 		id: 'job_003',
	// 		externalOrderId: 'EXT12347',
	// 		sourceAddress: '555 Maple St, Springfield',
	// 		destinationAddress: '888 Birch St, Shelbyville',
	// 		price: 180,
	// 		createdAt: new Date('2025-08-25T12:15:00Z').toISOString(),
	// 	},
	// 	{
	// 		id: 'job_004',
	// 		externalOrderId: 'EXT12348',
	// 		sourceAddress: '101 Cedar St, Springfield',
	// 		destinationAddress: '202 Walnut St, Shelbyville',
	// 		price: 400,
	// 		createdAt: new Date('2025-08-25T13:45:00Z').toISOString(),
	// 	},
	// 	{
	// 		id: 'job_005',
	// 		externalOrderId: 'EXT12349',
	// 		sourceAddress: '303 Cherry St, Springfield',
	// 		destinationAddress: '404 Poplar St, Shelbyville',
	// 		price: 220,
	// 		createdAt: new Date('2025-08-25T14:30:00Z').toISOString(),
	// 	},
	// ];
	const insets = useSafeAreaInsets();
	const [order, setOrder] = useState<Order | null>();
	const [otpModalVisible, setOtpModalVisible] = useState(false);
	const [otp, setOtp] = useState('');
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
	const [selectedTab, setSelectedTab] = useState<'Available' | 'Accepted'>('Available');
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [availOrders, setAvailOrders] = useState<any[]>([]); //TODO Array of available orders from API on load
	const [loading, setLoading] = useState(true); // TODO
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [currentOrders, setCurrentOrder] = useState<string[]>([]);
	const [token, setToken] = useState<string | null>(null);
	const [isAvailable, setIsAvailable] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [deliveryOrder, setDeliveryOrder] = useState<string | null>(null);

	const toggleExpand = (id: string) => {
		setExpandedOrder(expandedOrder === id ? null : id);
	};
	const onRefresh = async () => {
		setRefreshing(true);
		await fetchPendingJobs();
		setRefreshing(false);
	};
	const fetchPendingJobs = async () => {
		setLoading(true);
		console.log('Orders loading');
		setError(null);
		
		// Get token from state first, fallback to AsyncStorage
		let authToken = token;
		if (!authToken) {
			authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
		}
		
		console.log('Orders API', authToken);

		if (!authToken) {
			console.error('No auth token found');
			setError('Authentication required. Please login again.');
			setLoading(false);
			return;
		}

		const URL = baseUrl + '/api/orders/driver/jobs/pending';
		try {
			const response = await fetch(URL, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			//console.log(response);
			const data = await response.json();
			console.log(data);

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			if (data.success) {
				setAvailOrders(data.jobs || []); // <-- empty array if API returns 0 jobs
			} else {
				setAvailOrders([]); // <-- ensure state is empty if success is false
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
			console.log('error', err);
			setAvailOrders([]); // <-- clear state on error
		} finally {
			setLoading(false);
			console.log('Orders finished loading');
		}
	};
	useEffect(() => {
		const fetchAvailabilityAndJobs = async () => {
			// Load token first
			const authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
			
			const temp = await AsyncStorage.getItem('availability');
			//console.log('Availability:', temp);

			const curr_order_raw = await AsyncStorage.getItem('accepted_order');
			const curr_order = curr_order_raw ? JSON.parse(curr_order_raw) : null;
			//console.log('Accepted Order:', curr_order);

			// Directly use curr_order instead of order state
			setSelectedTab(curr_order ? 'Accepted' : 'Available');
			setOrder(curr_order);

			setIsAvailable(temp === 'true');
			
			// Only fetch if we have a token and no current order
			if (authToken && !curr_order) {
				await fetchPendingJobs();
			}
			
			setLoading(false); // done fetching
		};

		fetchAvailabilityAndJobs();
	}, []);

	const [loadingPickup, setLoadingPickup] = useState(false);

	const handleConfirmPickup = async (orderId: string) => {
		//TODO
		setLoadingPickup(true);
		
		// Get token from state or AsyncStorage
		let authToken = token;
		if (!authToken) {
			authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
		}
		
		if (!authToken) {
			alert('Authentication required. Please login again.');
			setLoadingPickup(false);
			return;
		}
		
		const URL = baseUrl + `/api/orders/driver/jobs/${orderId}/accept`;
		console.log(URL);
		try {
			const res = await fetch(URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			console.log(res);
			//const res = { status: 200 };
			if (res.status === 200) {
				const data = await res.json();
				// const data = {
				// 	//FIX to res.json()
				// 	success: true,
				// 	message: 'Job accepted successfully!',
				// 	order: {
				// 		id: 'cmdqwuevq00011uba8goumedq',
				// 		externalOrderId: '6',
				// 		sourceAddress: {
				// 			zip: '10001',
				// 			city: 'Tech City',
				// 			street: '123 Warehouse Lane',
				// 		},
				// 		destinationAddress: {
				// 			zip: '90210',
				// 			city: 'Client Town',
				// 			street: '456 Customer Ave',
				// 		},
				// 		customerDetails: {
				// 			name: 'John Doe',
				// 			phone: '+919599697117',
				// 		},
				// 		price: 25.5,
				// 		numberOfItems: 3,
				// 		status: 'ACCEPTED',
				// 		driverId: 'cmdqw5n1z0002bjg8e5ukseq2',
				// 		deliveryOtp: null,
				// 		deliveryOtpExpiresAt: null,
				// 		createdAt: '2025-07-31T04:44:27.734Z',
				// 		updatedAt: '2025-07-31T04:45:10.325Z',
				// 	},
				// };
				console.log('Pickup confirmed:', data);

				if (data.success) {
					alert(data.message || 'Job accepted successfully!');
					await AsyncStorage.setItem('accepted_order', JSON.stringify(data.order));
					console.log(JSON.stringify(data.order));
					setOrder({
						...data.order,
						status: 'ACCEPTED', // Ensure status is a valid Order status literal
					});
					setCurrentOrder((prev) => [...prev, orderId]);
					setSelectedTab('Accepted');
					setIsAvailable(false);
					await AsyncStorage.setItem('availability', JSON.stringify(false));
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
		setDeliveryOrder(orderId);
		
		// Get token from state or AsyncStorage
		let authToken = token;
		if (!authToken) {
			authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
		}
		
		if (!authToken) {
			Alert.alert('Error', 'Authentication required. Please login again.');
			setLoading(false);
			return;
		}
		
		// setOtpModalVisible(true); // Open OTP modal
		try {
			const URL = baseUrl + `/api/orders/driver/jobs/${orderId}/send-delivery-otp`;
			console.log(URL);
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			console.log(data);
			if (response.ok && data.success) {
				console.log('✅ OTP sent successfully:', data.message);
				setOtpModalVisible(true); // Open OTP modal
			} else {
				console.error('❌ Failed to send OTP:', data.message);
				Alert.alert(
					'OTP Failed',
					`Status: ${response.status} - ${data.message || 'Unknown error'}`
				);
			}
		} catch (error: any) {
			console.error('⚠️ Error sending OTP:', error);
			Alert.alert('OTP Failed', `An unexpected error occurred.`);
		} finally {
			setLoading(false);
		}
		return <View style={{ flex: 1, padding: 20 }}>{/* OTP Modal */}</View>;
	}

	async function handleVerifyDeliveryOTP() {
		const URL = baseUrl + `/api/orders/driver/jobs/${deliveryOrder}/verify-delivery`;
		setLoading(true);
		
		// Get token from state or AsyncStorage
		let authToken = token;
		if (!authToken) {
			authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
		}
		
		if (!authToken) {
			Alert.alert('Error', 'Authentication required. Please login again.');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`,
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
				setOtpModalVisible(false);
				Alert.alert('Success', 'OTP verified successfully');

				// Clear the current order state
				setCurrentOrder((prev) => prev.filter((id) => id !== deliveryOrder));
				setOrder(null); // Add this line to clear the order
				await AsyncStorage.removeItem('accepted_order');

				// Switch to Available tab and refresh
				setSelectedTab('Available');
				setIsAvailable(true);
				await AsyncStorage.setItem('availability', JSON.stringify(true));

				// Force re-render by refreshing orders
				await onRefresh();
			} else {
				console.error('OTP verification failed:', data.message);
				Alert.alert('Error', 'Invalid OTP. Please try again.');
			}
		} catch (error) {
			console.error('Error verifying OTP:', error);
			Alert.alert('Error', 'Something went wrong while verifying OTP.');
		} finally {
			setOtp('');
			setLoading(false);
		}
	}

	const handleAvailabilityChange = async (status: boolean) => {
		//TODO
		const URL = baseUrl + '/api/orders/driver/status';
		const availability = status ? 'AVAILABLE' : 'OFFLINE';
		
		// Get token from state or AsyncStorage
		let authToken = token;
		if (!authToken) {
			authToken = await AsyncStorage.getItem('auth_token');
			setToken(authToken);
		}
		
		if (!authToken) {
			alert('Authentication required. Please login again.');
			return { success: false, message: 'No auth token' };
		}
		
		try {
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					availability: availability,
				}),
			});
			const data = await response.json();
			console.log(data);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			if (data.success) {
				console.log('✅ Status updated:', data.message);
				setIsAvailable(status);
				await AsyncStorage.setItem('availability', JSON.stringify(status));
				if (status == true) {
					fetchPendingJobs();
				}
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

	const ordersData = availOrders;
	//const ordersData: Job[] = [];

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#f8fafc',
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
			}}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
			{/* Clean Header */}
			<View
				style={{
					backgroundColor: '#f8fafc',
					paddingHorizontal: 16,
					paddingVertical: 8,
					borderBottomWidth: 1,
					borderBottomColor: '#d8d8d8ff',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.04,
					shadowRadius: 8,
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 8,
						marginLeft: 20,
					}}
				>
					<Text
						style={{
							fontSize: 28,
							fontWeight: 'bold',
							color: '#1e293b',
						}}
					>
						Orders
					</Text>

					<View
						style={{
							alignItems: 'flex-end',
						}}
					>
						<View
							style={{
								display: selectedTab === 'Accepted' ? 'none' : 'flex',
								flexDirection: 'row',
								alignItems: 'stretch',
								backgroundColor: '#ffffff',
								borderRadius: 12,
								padding: 4,
								borderWidth: 1,
								borderColor: '#e2e8f0',
								height: 44, // Set a fixed height matching the row's height
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
									//flex: 1,
									height: '100%',
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
									//flex: 1,
									height: '100%',
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
			</View>
			{/* Waste Modal */}
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
			{loading ? (
				// Fullscreen loader while fetching
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#059669" />
					<Text style={{ marginTop: 12, fontSize: 16, color: '#374151' }}>Loading orders...</Text>
				</View>
			) : (
				<ScrollView
					style={{ flex: 1, backgroundColor: '#f8fafc' }}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 80 }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={['#059669']}
							tintColor="#059669"
						/>
					}
				>
					{!order && (availOrders.length == 0 || !isAvailable) ? (
						<View
							style={{
								flex: 1,
								alignItems: 'center',
								justifyContent: 'center',
								paddingHorizontal: 32,
								marginTop: 80,
							}}
						>
							{/* Icon Container with Gradient-like Effect */}
							<View
								style={{
									backgroundColor: '#f8fafc',
									padding: 40,
									borderRadius: 40,
									marginBottom: 32,
									borderWidth: 1,
									borderColor: '#e2e8f0',
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.05,
									shadowRadius: 12,
									elevation: 3,
								}}
							>
								<Ionicons name="receipt-outline" size={72} color="#64748b" />
							</View>

							{/* Main Title */}
							<Text
								style={{
									color: '#1e293b',
									fontSize: 26,
									fontWeight: '700',
									marginBottom: 12,
									textAlign: 'center',
								}}
							>
								No {selectedTab} Orders
							</Text>

							{/* Subtitle */}
							<Text
								style={{
									color: '#64748b',
									fontSize: 16,
									textAlign: 'center',
									lineHeight: 24,
									marginBottom: 24,
									maxWidth: 280,
								}}
							>
								{selectedTab === 'Available'
									? 'New orders will appear here when customers place them in your area'
									: 'Your accepted orders will show up here once you confirm pickup'}
							</Text>

							{/* Status Indicators */}
							<View
								style={{
									backgroundColor: '#ffffff',
									padding: 20,
									borderRadius: 16,
									borderWidth: 1,
									borderColor: '#e2e8f0',
									width: '100%',
									maxWidth: 300,
								}}
							>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
									<View
										style={{
											width: 8,
											height: 8,
											borderRadius: 4,
											backgroundColor: isAvailable ? '#10b981' : '#f59e0b',
											marginRight: 12,
										}}
									/>
									<Text
										style={{
											fontSize: 14,
											color: '#374151',
											fontWeight: '600',
										}}
									>
										Status: {isAvailable ? 'Online & Available' : 'Offline'}
									</Text>
								</View>

								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<View
										style={{
											width: 8,
											height: 8,
											borderRadius: 4,
											backgroundColor: ordersData.length === 0 ? '#ef4444' : '#10b981',
											marginRight: 12,
										}}
									/>
									<Text
										style={{
											fontSize: 14,
											color: '#374151',
											fontWeight: '600',
										}}
									>
										Orders:{' '}
										{ordersData.length === 0 ? 'None Available' : `${ordersData.length} Found`}
									</Text>
								</View>
							</View>

							{/* Action Hint */}
							{!isAvailable && (
								<View
									style={{
										backgroundColor: '#fef3c7',
										padding: 16,
										borderRadius: 12,
										marginTop: 20,
										borderWidth: 1,
										borderColor: '#fbbf24',
										width: '100%',
										maxWidth: 300,
									}}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
										<Text
											style={{
												fontSize: 14,
												color: '#92400e',
												fontWeight: '600',
												flex: 1,
											}}
										>
											Go online to start receiving orders
										</Text>
									</View>
								</View>
							)}

							{isAvailable && ordersData.length === 0 && (
								<View
									style={{
										backgroundColor: '#dbeafe',
										padding: 16,
										borderRadius: 12,
										marginTop: 20,
										borderWidth: 1,
										borderColor: '#3b82f6',
										width: '100%',
										maxWidth: 300,
									}}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
										<Text
											style={{
												fontSize: 14,
												color: '#1e40af',
												fontWeight: '600',
												flex: 1,
											}}
										>
											Stay nearby for faster order assignments
										</Text>
									</View>
								</View>
							)}
						</View>
					) : selectedTab === 'Available' ? (
						ordersData.map((order) => (
							<View
								key={order.id}
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
								{/* Header with Order ID and Chevron */}
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
									<View style={{ flex: 1 }}>
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
											{new Date(order.createdAt).toLocaleDateString('en-US', {
												day: 'numeric',
												month: 'short',
												year: 'numeric',
											})}{' '}
											•{' '}
											{new Date(order.createdAt).toLocaleTimeString('en-US', {
												hour: 'numeric',
												minute: '2-digit',
												hour12: true,
											})}
										</Text>
									</View>

									{/* Chevron Icon */}
									<View
										style={{
											transform: [{ rotate: expandedOrder === order.id ? '180deg' : '0deg' }],
											marginLeft: 12,
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
										{/* Delivery Info Card */}
										<View
											style={{
												backgroundColor: '#f8fafc',
												padding: 16,
												borderRadius: 10,
												marginTop: 12,
												marginBottom: 16,
											}}
										>
											{/* Source Address */}
											<View style={{ marginBottom: 12 }}>
												<Text
													style={{
														fontSize: 12,
														color: '#6b7280',
														fontWeight: '600',
														textTransform: 'uppercase',
														letterSpacing: 0.5,
														marginBottom: 4,
													}}
												>
													PICKUP FROM
												</Text>
												<Text
													style={{
														fontSize: 14,
														color: '#374151',
														lineHeight: 20,
													}}
												>
													{order.sourceAddress.street +
														', ' +
														order.sourceAddress.city +
														'\n' +
														order.sourceAddress.zip}
												</Text>
											</View>

											{/* Destination Address */}
											<View style={{ marginBottom: 12 }}>
												<Text
													style={{
														fontSize: 12,
														color: '#6b7280',
														fontWeight: '600',
														textTransform: 'uppercase',
														letterSpacing: 0.5,
														marginBottom: 4,
													}}
												>
													DELIVER TO
												</Text>
												<Text
													style={{
														fontSize: 14,
														color: '#374151',
														lineHeight: 20,
													}}
												>
													{order.destinationAddress.street +
														', ' +
														order.destinationAddress.city +
														'\n' +
														order.destinationAddress.zip}
												</Text>
											</View>

											{/* Price and Status */}
											<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
												<Text
													style={{
														fontSize: 22,
														fontWeight: 'bold',
														color: '#1e293b',
													}}
												>
													₹{order.price}
												</Text>
												<View
													style={{
														backgroundColor: '#059669',
														paddingHorizontal: 10,
														paddingVertical: 4,
														borderRadius: 16,
														marginLeft: 12,
														flexDirection: 'row',
														alignItems: 'center',
														shadowColor: '#059669',
														shadowOffset: { width: 0, height: 1 },
														shadowOpacity: 0.3,
														shadowRadius: 2,
														elevation: 2,
													}}
												>
													<Text
														style={{
															color: '#ffffff',
															fontSize: 11,
															fontWeight: '700',
															marginRight: 4,
														}}
													>
														✓
													</Text>
													<Text
														style={{
															fontSize: 11,
															fontWeight: '700',
															color: '#ffffff',
															letterSpacing: 0.5,
														}}
													>
														PAID
													</Text>
												</View>
											</View>
										</View>

										{/* Action Button */}
										<TouchableOpacity
											onPress={
												selectedTab === 'Available'
													? () => handleConfirmPickup(order.id)
													: () => handleDeliveryOTP(order.id)
											}
											disabled={loadingPickup}
											style={{
												backgroundColor: loadingPickup ? '#9ca3af' : 'rgba(0, 88, 74, 1)',
												paddingVertical: 16,
												borderRadius: 12,
												alignItems: 'center',
												justifyContent: 'center',
												shadowColor: '#10b981',
												shadowOffset: { width: 0, height: 2 },
												shadowOpacity: loadingPickup ? 0 : 0.2,
												shadowRadius: 8,
												elevation: loadingPickup ? 0 : 3,
											}}
										>
											<Text
												style={{
													color: '#ffffff',
													fontWeight: '700',
													fontSize: 16,
													letterSpacing: 0.5,
												}}
											>
												{loadingPickup ? 'Confirming...' : 'Confirm Pickup'}
											</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						))
					) : (
						order && (
							<View style={{ flex: 1, backgroundColor: '#f9fafb', paddingBottom: 20 }}>
								{/* Header */}
								<View style={{ padding: 20, alignItems: 'center', marginBottom: 20 }}>
									<Ionicons name="checkmark-circle" size={56} color="#059669" />
									<Text
										style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 12 }}
									>
										Pickup Confirmed
									</Text>
									<Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
										Order ID: {order.externalOrderId}
									</Text>
								</View>

								{/* Order Details */}
								<View
									style={{
										backgroundColor: '#fff',
										marginHorizontal: 16,
										marginBottom: 20,
										borderRadius: 12,
										padding: 16,
										shadowColor: '#000',
										shadowOpacity: 0.05,
										shadowOffset: { width: 0, height: 1 },
										shadowRadius: 4,
										elevation: 2,
									}}
								>
									<Text
										style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4 }}
									>
										PICKUP FROM
									</Text>
									<Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
										{order.sourceAddress.street}, {order.sourceAddress.city},{' '}
										{order.sourceAddress.zip}
									</Text>

									<Text
										style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4 }}
									>
										DELIVER TO
									</Text>
									<Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
										{order.destinationAddress.street}, {order.destinationAddress.city},{' '}
										{order.destinationAddress.zip}
									</Text>

									<Text style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>
										Items: {order.numberOfItems}
									</Text>

									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
										<Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>
											₹{order.price}
										</Text>
										<View
											style={{
												backgroundColor: '#059669',
												paddingHorizontal: 10,
												paddingVertical: 4,
												borderRadius: 16,
												marginLeft: 12,
											}}
										>
											<Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>PAID</Text>
										</View>
									</View>
								</View>

								<View
									style={{
										backgroundColor: '#fff',
										marginHorizontal: 16,
										marginBottom: 20,
										borderRadius: 12,
										padding: 16,
										shadowColor: '#000',
										shadowOpacity: 0.05,
										shadowOffset: { width: 0, height: 1 },
										shadowRadius: 4,
										elevation: 2,
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<View>
										<Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
											{order.customerDetails.name}
										</Text>
										<Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
											{order.customerDetails.phone}
										</Text>
									</View>

									<TouchableOpacity
										onPress={async () => {
											const phoneNumber = `tel:${order.customerDetails.phone}`;
											const supported = await Linking.canOpenURL(phoneNumber);
											if (supported) {
												await Linking.openURL(phoneNumber); // Opens the dialer
											} else {
												Alert.alert('Error', 'This device does not support calling.');
											}
										}}
										style={{
											backgroundColor: '#0369a1',
											paddingHorizontal: 14,
											paddingVertical: 10,
											borderRadius: 8,
										}}
									>
										<Ionicons name="call" size={20} color="#fff" />
									</TouchableOpacity>
								</View>

								{/* Action Button */}
								<View style={{ marginTop: 'auto', padding: 16 }}>
									<TouchableOpacity
										onPress={() => handleDeliveryOTP(order.id)}
										style={{
											backgroundColor: 'rgba(0, 88, 74, 1)',
											paddingVertical: 16,
											borderRadius: 12,
											alignItems: 'center',
										}}
									>
										<Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
											Enter Delivery OTP
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)
					)}
				</ScrollView>
			)}
			{/* Useful OTP Modal */}
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
							{/* <View
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
							</View> */}
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
									setOtp('');
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
			{/* Waste Status Selection Modal */}
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
					</View>
				</View>
			</Modal>
		</View>
	);
}
