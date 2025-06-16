import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ErrorToast from '../components/error';

const EMERGENCY_DETAILS_KEY = 'emergency_details';
const COMPLETION_STATUS_KEY = 'document_completion_status';

interface EmergencyDetails {
	primaryContactName: string;
	primaryContactRelation: string;
	primaryContactPhone: string;
	secondaryContactName: string;
	secondaryContactRelation: string;
	secondaryContactPhone: string;
	medicalConditions: string;
	bloodGroup: string;
	allergies: string;
}

export default function EmergencyDetailsPage() {
	const navigation = useNavigation<NavigationProp<'Emergency'>>();
	const [emergencyContacts, setEmergencyContacts] = useState<EmergencyDetails>({
		primaryContactName: '',
		primaryContactRelation: '',
		primaryContactPhone: '',
		secondaryContactName: '',
		secondaryContactRelation: '',
		secondaryContactPhone: '',
		medicalConditions: '',
		bloodGroup: '',
		allergies: '',
	});
	const [errorMsg, setErrorMsg] = useState('');
	// Load saved emergency details on component mount
	useEffect(() => {
		loadEmergencyDetails();
	}, []);

	const loadEmergencyDetails = async () => {
		try {
			const savedDetails = await AsyncStorage.getItem(EMERGENCY_DETAILS_KEY);
			if (savedDetails) {
				const parsedDetails = JSON.parse(savedDetails);
				setEmergencyContacts(parsedDetails);
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while loading emergency details.'
			);
			// console.error('Error loading emergency details:', error);
		}
	};

	const saveEmergencyDetails = async () => {
		try {
			await AsyncStorage.setItem(EMERGENCY_DETAILS_KEY, JSON.stringify(emergencyContacts));
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while saving emergency details.'
			);
			// console.error('Error saving emergency details:', error);
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

			completionStatus.emergencyDetails = true;
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while updating completion status.'
			);
			// console.error('Error updating completion status:', error);
		}
	};

	const handleChange = (field: keyof EmergencyDetails, value: string) => {
		setEmergencyContacts((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return (
			emergencyContacts.primaryContactName.trim() &&
			emergencyContacts.primaryContactPhone.trim() &&
			emergencyContacts.primaryContactRelation.trim()
		);
	};

	const handleSave = async () => {
		if (!isFormValid()) {
			Alert.alert('Error', 'Please fill in all required primary contact fields');
			return;
		}

		try {
			await saveEmergencyDetails();
			await updateCompletionStatus();
			Alert.alert('Success', 'Emergency contact details saved successfully', [
				{
					text: 'OK',
					onPress: () => navigation.navigate({ name: 'Details' } as never),
				},
			]);
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while saving emergency details.'
			);
			// Alert.alert('Error', 'Failed to save emergency details. Please try again.');
		}
	};

	return (
		<View className="h-full flex-col bg-white">
			{/* Header */}
			<View className="bg-primary h-[15%] rounded-b-3xl justify-center relative">
				<View className="flex-row items-center px-4 pt-12">
					<TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 z-10">
						<Ionicons name="chevron-back" size={24} color="white" />
					</TouchableOpacity>
					<View className="absolute left-0 right-0 items-center pt-12 px-6">
						<Text className="text-white font-bold text-2xl">Emergency Details</Text>
						<Text className="text-white font-semibold text-sm mt-2 ml-1">
							Add emergency contacts and medical information
						</Text>
					</View>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-6 pt-5">
				{/* Primary Emergency Contact */}
				<View className="bg-white rounded-xl mb-6">
					<Text className="text-[#2B2E35] font-semibold pb-4 text-xl">
						Primary Emergency Contact *
					</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Full Name *"
						placeholder="Enter contact's full name"
						value={emergencyContacts.primaryContactName}
						onChange={(value) => handleChange('primaryContactName', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Relationship *"
						placeholder="E.g., Spouse, Parent, Friend"
						value={emergencyContacts.primaryContactRelation}
						onChange={(value) => handleChange('primaryContactRelation', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Phone Number *"
						placeholder="Enter contact's phone number"
						value={emergencyContacts.primaryContactPhone}
						onChange={(value) => handleChange('primaryContactPhone', value)}
						keyboardType="phone-pad"
					/>
				</View>

				{/* Secondary Emergency Contact */}
				<View className="bg-white rounded-xl mb-6">
					<Text className="text-[#2B2E35] font-semibold pb-4 text-xl">
						Secondary Emergency Contact
					</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Full Name"
						placeholder="Enter contact's full name"
						value={emergencyContacts.secondaryContactName}
						onChange={(value) => handleChange('secondaryContactName', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Relationship"
						placeholder="E.g., Spouse, Parent, Friend"
						value={emergencyContacts.secondaryContactRelation}
						onChange={(value) => handleChange('secondaryContactRelation', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Phone Number"
						placeholder="Enter contact's phone number"
						value={emergencyContacts.secondaryContactPhone}
						onChange={(value) => handleChange('secondaryContactPhone', value)}
						keyboardType="phone-pad"
					/>
				</View>

				{/* Medical Information */}
				<View className="bg-white rounded-xl mb-6">
					<Text className="text-[#2B2E35] font-semibold pb-4 text-xl">Medical Information</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Blood Group"
						placeholder="E.g., A+, B-, O+"
						value={emergencyContacts.bloodGroup}
						onChange={(value) => handleChange('bloodGroup', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Medical Conditions"
						placeholder="List any medical conditions"
						value={emergencyContacts.medicalConditions}
						onChange={(value) => handleChange('medicalConditions', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Allergies"
						placeholder="List any allergies"
						value={emergencyContacts.allergies}
						onChange={(value) => handleChange('allergies', value)}
					/>
				</View>

				<View className="mb-8">
					<ButtonOpacity
						onPress={handleSave}
						disabled={!isFormValid()}
						className={`${!isFormValid() ? 'bg-gray-400' : 'bg-primary'}`}
					>
						<Text
							className={`font-medium text-xl py-2 ${
								!isFormValid() ? 'text-gray-600' : 'text-white'
							}`}
						>
							Save Details
						</Text>
					</ButtonOpacity>
				</View>
			</ScrollView>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}
		</View>
	);
}
