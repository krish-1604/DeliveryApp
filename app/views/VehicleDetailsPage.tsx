import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ErrorToast from '../components/error';

const COMPLETION_STATUS_KEY = 'document_completion_status';

export default function VehicleDetailsPage() {
	const navigation = useNavigation<NavigationProp<'Vehicle'>>();
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');

	const [vehicleDetails, setVehicleDetails] = useState({
		vehicleType: '',
		model: '',
		manufacturer: '',
		color: '',
		plateNumber: '',
		yearOfManufacture: '',
	});

	// Load phone number on component mount
	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			setIsLoading(true);
			
			// Get phone number from AsyncStorage
			const savedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
			if (savedPhoneNumber) {
				setPhoneNumber(savedPhoneNumber);
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while loading data.'
			);
		} finally {
			setIsLoading(false);
		}
	};



	const updateCompletionStatus = async () => {
		try {
			const savedStatus = await AsyncStorage.getItem(COMPLETION_STATUS_KEY);
			let completionStatus = {
				personalInformation: true,
				personalDocuments: false,
				vehicleDetails: false,
				bankDetails: false,
				emergencyDetails: false,
			};

			if (savedStatus) {
				completionStatus = JSON.parse(savedStatus);
			}

			completionStatus.vehicleDetails = true;
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while updating completion status.'
			);
		}
	};

	const handleChange = (field: string, value: string) => {
		setVehicleDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return Object.values(vehicleDetails).every((val) => val.trim() !== '');
	};

	const handleSave = async () => {
		if (!isFormValid()) return;

		setIsSaving(true);

		try {
			// Ensure phone number has +91 prefix
			const formattedPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
			
			// Prepare the data for API call
			const apiPayload = {
				phoneNumber: formattedPhoneNumber,
				vehicleType: vehicleDetails.vehicleType,
				model: vehicleDetails.model,
				manufacturer: vehicleDetails.manufacturer,
				color: vehicleDetails.color,
				plateNumber: vehicleDetails.plateNumber.toUpperCase(),
				yearOfManufacture: parseInt(vehicleDetails.yearOfManufacture, 10),
			};

			console.log('API Payload:', JSON.stringify(apiPayload, null, 2));
			const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
			if (!baseUrl) {
				throw new Error('Backend URL not configured');
			}
			const responses = await fetch(`${baseUrl}/api/auth/vehicle-details`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(apiPayload),
			});

			const response = await responses.json();
			console.log('API Response:', response);
			if (response.success) {
				// Update local completion status
				await updateCompletionStatus();

				// Show success message and navigate
				Alert.alert('Success', 'Vehicle details saved successfully', [
					{
						text: 'OK',
						onPress: () => navigation.navigate({ name: 'Details' } as never),
					},
				]);
			} else {
				throw new Error(response.message || 'Failed to save vehicle details');
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while saving vehicle details.'
			);
		} finally {
			setIsSaving(false);
		}
	};

	const isButtonDisabled = !isFormValid() || isSaving || isLoading;

	if (isLoading) {
		return (
			<View className="h-full flex-col bg-white justify-center items-center">
				<ActivityIndicator size="large" color="#007AFF" />
				<Text className="mt-4 text-gray-600">Loading...</Text>
			</View>
		);
	}

	return (
		<View className="h-full flex-col bg-white">
			{/* Header */}
			<View className="bg-primary h-[15%] rounded-b-3xl justify-center relative">
				<View className="flex-row items-center px-4 pt-12">
					<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 z-10">
						<Ionicons name="chevron-back" size={24} color="white" />
					</TouchableOpacity>
					<View className="absolute left-0 right-0 items-center pt-12 px-6">
						<Text className="text-white font-bold text-2xl">Vehicle Details</Text>
						<Text className="text-white font-semibold text-sm mt-2 ml-1">
							Enter your vehicle details
						</Text>
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
						placeholder="e.g., Car, Motorcycle, Scooter"
						value={vehicleDetails.vehicleType}
						onChange={(value) => handleChange('vehicleType', value)}
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
						onChange={(value) => handleChange('plateNumber', value.toUpperCase())}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Year of Manufacture"
						placeholder="Enter year of manufacture"
						value={vehicleDetails.yearOfManufacture}
						onChange={(value) => handleChange('yearOfManufacture', value)}
						keyboardType="numeric"
					/>
				</View>

				<View className="mb-100">
					<ButtonOpacity
						onPress={handleSave}
						disabled={isButtonDisabled}
						className={`rounded-full px-6 py-3 items-center justify-center flex-row ${
							isButtonDisabled ? 'bg-gray-400' : 'bg-primary'
						}`}
					>
						<Text
							className={`font-medium text-xl ${isButtonDisabled ? 'text-gray-600' : 'text-white'}`}
						>
							{isSaving ? 'Saving...' : 'Save Details'}
						</Text>
						{isSaving && (
							<View className="ml-2">
								<ActivityIndicator color="white" />
							</View>
						)}
					</ButtonOpacity>
				</View>
			</ScrollView>
			{errorMsg ? <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} /> : null}
		</View>
	);
}