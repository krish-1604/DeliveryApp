import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy orders split by type
const allOrdersData = {
	Meal: [
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
	],
	Store: [
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

export default function OrdersScreen() {
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
	const [selectedTab, setSelectedTab] = useState<'Meal' | 'Store'>('Store');
	const [selectedDate] = useState<string>('24/04/2025');

	const toggleExpand = (id: string) => {
		setExpandedOrder(expandedOrder === id ? null : id);
	};

	const ordersData = allOrdersData[selectedTab];

	const groupedOrders = ordersData.reduce(
		(acc, order) => {
			if (!acc[order.center]) acc[order.center] = [];
			acc[order.center].push(order);
			return acc;
		},
		{} as Record<string, typeof ordersData>
	);

	return (
		<View className="flex-1 p-safe mt-4">
			<View className="flex-row items-center justify-center mb-4">
				<Ionicons name="bag-outline" size={24} className="mr-2" />
				<Text className="text-2xl font-semibold">Orders</Text>
			</View>

			<View className="flex-row justify-between items-center mb-4">
				<View className="flex-row bg-gray-200 rounded-full p-1">
					{['Meal', 'Store'].map((type) => (
						<TouchableOpacity
							key={type}
							onPress={() => setSelectedTab(type as 'Meal' | 'Store')}
							className={`px-4 py-2 rounded-full ${selectedTab === type ? 'bg-white' : ''}`}
						>
							<Text
								className={`text-sm font-semibold ${selectedTab === type ? 'text-black' : 'text-gray-500'}`}
							>
								{type}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<TouchableOpacity className="flex-row items-center border border-gray-300 px-3 py-1 rounded-full">
					<Text className="text-sm mr-2">{selectedDate}</Text>
					<Ionicons name="chevron-down" size={16} color="#444" />
				</TouchableOpacity>
			</View>

			<ScrollView className="mb-20">
				{Object.keys(groupedOrders).length === 0 ? (
					<View className="flex-1 items-center justify-center mt-20">
						<Ionicons name="sad-outline" size={60} color="#ccc" />
						<Text className="text-gray-500 text-lg mt-4">No orders found</Text>
					</View>
				) : (
					Object.entries(groupedOrders).map(([centerName, orders]) => (
						<View key={centerName} className="mb-6">
							{/* Header with center name and icons */}
							<View className="flex-row justify-between items-center mb-2 px-1">
								<Text className="text-base font-bold">{centerName}</Text>
								<View className="flex-row space-x-2">
									<TouchableOpacity className="bg-yellow-100 p-2 rounded-full">
										<Ionicons name="call" size={16} color="#c79300" />
									</TouchableOpacity>
									<TouchableOpacity className="bg-green-100 p-2 rounded-full">
										<Ionicons name="navigate" size={16} color="#007f5f" />
									</TouchableOpacity>
								</View>
							</View>

							{/* Orders under this center */}
							{orders.map((order) => (
								<View
									key={order.id}
									className="mb-2 border border-gray-200 rounded-xl p-4 bg-white"
								>
									<TouchableOpacity
										onPress={() => toggleExpand(order.id)}
										className="flex-row justify-between items-center"
									>
										<View>
											<Text className="text-sm text-gray-600">Order No. {order.id}</Text>
											<Text className="text-sm text-gray-700 font-medium">
												{order.items[0]?.name} | {order.items[0]?.weight}
											</Text>
										</View>

										<Text
											className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
										>
											{order.status}
										</Text>
									</TouchableOpacity>

									{expandedOrder === order.id && (
										<View className="mt-4 space-y-2">
											{order.items.map((item, index) => (
												<View key={index} className="flex-row justify-between">
													<Text className="text-sm">
														{item.name} ({item.weight}) x {item.qty}
													</Text>
													<Text className="text-sm text-gray-400">{item.from}</Text>
												</View>
											))}

											<Text className="text-sm">Delivery To: {order.deliveryTo}</Text>
											<Text className="text-sm">
												₹{order.amount} {order.paid ? '(Paid)' : '(Unpaid)'}
											</Text>

											<View className="flex-row justify-between mt-2">
												<TouchableOpacity className="bg-teal-600 px-4 py-2 rounded-full">
													<Text className="text-white font-semibold text-sm">Confirm Pickup</Text>
												</TouchableOpacity>
												<TouchableOpacity className="border border-gray-300 px-4 py-2 rounded-full">
													<Text className="text-gray-600 font-semibold text-sm">Update Status</Text>
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
		</View>
	);
}

const getStatusColor = (status: string) => {
	switch (status) {
	case 'Pickup Pending':
		return 'bg-yellow-100 text-yellow-700';
	case 'Pickup Failed':
		return 'bg-red-100 text-red-700';
	case 'Pickup Rescheduled':
		return 'bg-orange-100 text-orange-700';
	case 'Delivered':
		return 'bg-green-100 text-green-700';
	default:
		return 'bg-gray-100 text-gray-600';
	}
};
