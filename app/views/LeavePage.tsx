import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LeaveApplicationPage() {
	const [days, setDays] = useState('');
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [reason, setReason] = useState('');
	const [comments, setComments] = useState('');
	const [activeTab, setActiveTab] = useState('new');
	const [isDaysDropdownVisible, setDaysDropdownVisible] = useState(false);
	const [isReasonDropdownVisible, setReasonDropdownVisible] = useState(false);
	const [isFromDatePickerVisible, setFromDatePickerVisible] = useState(false);
	const [isToDatePickerVisible, setToDatePickerVisible] = useState(false);
	const daysOptions = ['1 day', '2 days', '3 days', '4 days', '5 days'];
	const reasonsOptions = ['Sick Leave', 'Vacation', 'Personal Work', 'Emergency'];

	return (
		<View className="flex-1 bg-gray-50">
			<View className="bg-white p-4 flex-row items-center border-b border-gray-200">
				<TouchableOpacity className="mr-4">
					<Ionicons name="chevron-back" size={24} className="text-gray-800" />
				</TouchableOpacity>
				<Text className="text-xl font-semibold text-gray-800">Ask for leave</Text>
			</View>
			<View className="flex-row border-b border-gray-200 bg-white">
				<TouchableOpacity
					onPress={() => setActiveTab('new')}
					className={`flex-1 py-4 ${activeTab === 'new' ? 'border-b-2 border-yellow-500' : ''}`}
				>
					<Text
						className={`text-center ${activeTab === 'new' ? 'text-yellow-500 font-semibold' : 'text-gray-500'}`}
					>
						New Application
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('my')}
					className={`flex-1 py-4 ${activeTab === 'my' ? 'border-b-2 border-yellow-500' : ''}`}
				>
					<Text
						className={`text-center ${activeTab === 'my' ? 'text-yellow-500 font-semibold' : 'text-gray-500'}`}
					>
						My Application
					</Text>
				</TouchableOpacity>
			</View>
			{activeTab === 'new' ? (
				<ScrollView className="flex-1">
					<View className="p-4">
						<Text className="text-lg font-medium text-gray-800 mb-6">
							Request your leave details down below
						</Text>
						<View className="mb-4">
							<Text className="text-gray-700 mb-2">How many days?</Text>
							<TouchableOpacity
								onPress={() => setDaysDropdownVisible(!isDaysDropdownVisible)}
								className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between bg-white"
							>
								<Text className={days ? 'text-gray-800' : 'text-gray-400'}>{days || 'Select'}</Text>
								<Ionicons name="chevron-down" size={20} className="text-gray-400" />
							</TouchableOpacity>
							{isDaysDropdownVisible && (
								<View className="border border-gray-300 rounded-lg bg-white mt-2">
									{daysOptions.map((option) => (
										<TouchableOpacity
											key={option}
											onPress={() => {
												setDays(option);
												setDaysDropdownVisible(false);
											}}
											className="p-3 border-b border-gray-200"
										>
											<Text className="text-gray-800">{option}</Text>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
						<View className="mb-4">
							<Text className="text-gray-700 mb-2">From</Text>
							<TouchableOpacity
								onPress={() => setFromDatePickerVisible(true)}
								className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between bg-white"
							>
								<Text className={fromDate ? 'text-gray-800' : 'text-gray-400'}>
									{fromDate || 'dd/mm/yyyy'}
								</Text>
								<Ionicons name="calendar-outline" size={20} className="text-gray-400" />
							</TouchableOpacity>
							{isFromDatePickerVisible && (
								<DateTimePicker
									value={new Date()}
									mode="date"
									display="default"
									onChange={(event, selectedDate) => {
										setFromDatePickerVisible(false);
										if (selectedDate) {
											const formattedDate = selectedDate.toLocaleDateString('en-GB');
											setFromDate(formattedDate);
										}
									}}
								/>
							)}
						</View>
						<View className="mb-4">
							<Text className="text-gray-700 mb-2">To</Text>
							<TouchableOpacity
								onPress={() => setToDatePickerVisible(true)}
								className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between bg-white"
							>
								<Text className={toDate ? 'text-gray-800' : 'text-gray-400'}>
									{toDate || 'dd/mm/yyyy'}
								</Text>
								<Ionicons name="calendar-outline" size={20} className="text-gray-400" />
							</TouchableOpacity>
							{isToDatePickerVisible && (
								<DateTimePicker
									value={new Date()}
									mode="date"
									display="default"
									onChange={(event, selectedDate) => {
										setToDatePickerVisible(false);
										if (selectedDate) {
											const formattedDate = selectedDate.toLocaleDateString('en-GB');
											setToDate(formattedDate);
										}
									}}
								/>
							)}
						</View>
						<View className="mb-4">
							<Text className="text-gray-700 mb-2">Reason for leave</Text>
							<TouchableOpacity
								onPress={() => setReasonDropdownVisible(!isReasonDropdownVisible)}
								className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between bg-white"
							>
								<Text className={reason ? 'text-gray-800' : 'text-gray-400'}>
									{reason || 'Select'}
								</Text>
								<Ionicons name="chevron-down" size={20} className="text-gray-400" />
							</TouchableOpacity>
							{isReasonDropdownVisible && (
								<View className="border border-gray-300 rounded-lg bg-white mt-2">
									{reasonsOptions.map((option) => (
										<TouchableOpacity
											key={option}
											onPress={() => {
												setReason(option);
												setReasonDropdownVisible(false);
											}}
											className="p-3 border-b border-gray-200"
										>
											<Text className="text-gray-800">{option}</Text>
										</TouchableOpacity>
									))}
								</View>
							)}
						</View>
						<View className="mb-12">
							<Text className="text-gray-700 mb-2">Comments</Text>
							<View className="border border-gray-300 border-dashed rounded-lg p-3 bg-white">
								<TextInput
									multiline
									numberOfLines={6}
									value={comments}
									onChangeText={setComments}
									placeholder="Explain reason for leave in detail."
									className="text-gray-800 h-32"
									textAlignVertical="top"
								/>
								<Text className="text-gray-400 text-right mt-2">{comments.length}/200</Text>
							</View>
						</View>
						<TouchableOpacity className="bg-teal-600 rounded-full py-4 items-center">
							<Text className="text-white font-medium text-lg">Submit</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			) : (
				<View className="flex-1 p-4">
					<Text className="text-lg font-medium text-gray-800 mb-6">My Application Details</Text>
					{days || fromDate || toDate || reason || comments ? (
						<View className="bg-white p-4 rounded-lg shadow">
							<Text className="text-gray-700 mb-2">
								<Text className="font-semibold">Days:</Text> {days || 'N/A'}
							</Text>
							<Text className="text-gray-700 mb-2">
								<Text className="font-semibold">From:</Text> {fromDate || 'N/A'}
							</Text>
							<Text className="text-gray-700 mb-2">
								<Text className="font-semibold">To:</Text> {toDate || 'N/A'}
							</Text>
							<Text className="text-gray-700 mb-2">
								<Text className="font-semibold">Reason:</Text> {reason || 'N/A'}
							</Text>
							<Text className="text-gray-700">
								<Text className="font-semibold">Comments:</Text> {comments || 'N/A'}
							</Text>
						</View>
					) : (
						<Text className="text-gray-500">No active applications found.</Text>
					)}
				</View>
			)}
		</View>
	);
}
