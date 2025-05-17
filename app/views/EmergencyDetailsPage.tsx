import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { useNavigation } from '@react-navigation/native';

export default function EmergencyDetailsPage() {
	const navigation = useNavigation();
	const [emergencyContacts, setEmergencyContacts] = useState({
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

	const handleChange = (field: string, value: string) => {
		setEmergencyContacts((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return (
			emergencyContacts.primaryContactName &&
			emergencyContacts.primaryContactPhone &&
			emergencyContacts.primaryContactRelation
		);
	};

	const handleSave = () => {
		Alert.alert('Success', 'Emergency contact details saved successfully');
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
						<Text className="text-white font-bold pb-1 text-2xl">Emergency Details</Text>
						<Text className="text-white font-semibold text-sm">
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
						Primary Emergency Contact
					</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Full Name"
						placeholder="Enter contact's full name"
						value={emergencyContacts.primaryContactName}
						onChange={(value) => handleChange('primaryContactName', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Relationship"
						placeholder="E.g., Spouse, Parent, Friend"
						value={emergencyContacts.primaryContactRelation}
						onChange={(value) => handleChange('primaryContactRelation', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Phone Number"
						placeholder="Enter contact's phone number"
						value={emergencyContacts.primaryContactPhone}
						onChange={(value) => handleChange('primaryContactPhone', value)}
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
					<ButtonOpacity onPress={handleSave} disabled={!isFormValid()}>
						<Text className="text-white font-medium text-xl py-2">Save Details</Text>
					</ButtonOpacity>
				</View>
			</ScrollView>
		</View>
	);
}
