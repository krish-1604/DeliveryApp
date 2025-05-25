import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { useNavigation } from '@react-navigation/native';

export default function VehicleDetailsPage() {
	const navigation = useNavigation();
	const [isSaving, setIsSaving] = useState(false);
	const handlePress = () => {
		if (!isFormValid()) return;

		setIsSaving(true);

		// Simulate saving process
		setTimeout(() => {
			setIsSaving(false);
			// Navigate to next page after successful save
			navigation.replace('/regi');
		}, 2000);
	};
	const [vehicleDetails, setVehicleDetails] = useState({
		type: '',
		model: '',
		manufacturer: '',
		color: '',
		plateNumber: '',
		yearOfManufacture: '',
	});

	const handleChange = (field: string, value: string) => {
		setVehicleDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return (
			vehicleDetails.type &&
			vehicleDetails.model &&
			vehicleDetails.manufacturer &&
			vehicleDetails.plateNumber
		);
	};

	return (
		<View className="h-full flex-col bg-white">
			{/* Header */}
			<View className="bg-primary h-[15%] rounded-b-3xl">
				<View className="flex-row px-6 pt-12 items-center">
					<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>
					<View className="flex-col flex-1">
						<Text className="text-white font-bold pb-1 text-2xl">Vehicle Details</Text>
						<Text className="text-white font-semibold text-sm">Enter your vehicle information</Text>
					</View>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-6 pt-5">
				<View className="bg-white rounded-xl mb-6">
					<Text className="text-[#2B2E35] font-semibold pb-4 text-xl">Basic Information</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Vehicle Type"
						placeholder="e.g., car, motorcycle, etc"
						value={vehicleDetails.type}
						onChange={(value) => handleChange('type', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Model"
						placeholder="Enter vehicle model"
						value={vehicleDetails.model}
						onChange={(value) => handleChange('model', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Manufacturer"
						placeholder="Enter manufacturer name"
						value={vehicleDetails.manufacturer}
						onChange={(value) => handleChange('manufacturer', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Color"
						placeholder="Enter vehicle color"
						value={vehicleDetails.color}
						onChange={(value) => handleChange('color', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Plate Number"
						placeholder="Enter plate number"
						value={vehicleDetails.plateNumber}
						onChange={(value) => handleChange('plateNumber', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Year of Manufacture"
						placeholder="Enter year of manufacture"
						value={vehicleDetails.yearOfManufacture}
						onChange={(value) => handleChange('yearOfManufacture', value)}
					/>
				</View>

				<View className="mb-100">
					<ButtonOpacity
						onPress={handlePress}
						disabled={!isFormValid() || isSaving}
						className={`${!isFormValid() || isSaving ? 'bg-gray-400' : 'bg-primary'} rounded-full px-6`}
					>
						<Text className="text-white font-medium text-xl py-2">
							{isSaving ? 'Saving...' : 'Save Details'}
						</Text>
						{isSaving && (
							<View className="absolute right-4">
								<ActivityIndicator color="white" />
							</View>
						)}{' '}
					</ButtonOpacity>
				</View>
			</ScrollView>
		</View>
	);

	// Update Button to use handlePress and show loading state
	// Replace the ButtonOpacity in your return with:
	// <View className="mb-8">
	// 	<ButtonOpacity onPress={handlePress} disabled={!isFormValid() || isSaving}></ButtonOpacity>
	// </View>;
}
