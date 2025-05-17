import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { useNavigation } from '@react-navigation/native';

export default function BankDetailsPage() {
	const navigation = useNavigation();
	const [bankDetails, setBankDetails] = useState({
		accountHolderName: '',
		accountNumber: '',
		confirmAccountNumber: '',
		ifscCode: '',
		bankName: '',
		branchName: '',
	});

	const handleChange = (field: string, value: string) => {
		setBankDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return (
			bankDetails.accountHolderName &&
			bankDetails.accountNumber &&
			bankDetails.confirmAccountNumber &&
			bankDetails.ifscCode &&
			bankDetails.accountNumber === bankDetails.confirmAccountNumber
		);
	};

	const handleSave = () => {
		if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
			Alert.alert('Error', 'Account numbers do not match');
			return;
		}

		// Here you would handle the saving of bank details
		Alert.alert('Success', 'Bank details saved successfully');
		// Navigate back or to next screen
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
						<Text className="text-white font-bold pb-1 text-2xl">Bank Details</Text>
						<Text className="text-white font-semibold text-sm">
							Add bank account for weekly payouts
						</Text>
					</View>
				</View>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-6 pt-5">
				<View className="bg-white rounded-xl mb-6">
					<Text className="text-[#2B2E35] font-semibold pb-4 text-xl">Account Information</Text>

					<View style={{ height: 10 }} />
					<Input
						label="Account Holder Name"
						placeholder="Enter full name as per bank records"
						value={bankDetails.accountHolderName}
						onChange={(value) => handleChange('accountHolderName', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Account Number"
						placeholder="Enter your account number"
						value={bankDetails.accountNumber}
						onChange={(value) => handleChange('accountNumber', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Confirm Account Number"
						placeholder="Re-enter your account number"
						value={bankDetails.confirmAccountNumber}
						onChange={(value) => handleChange('confirmAccountNumber', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="IFSC Code"
						placeholder="Enter IFSC code"
						value={bankDetails.ifscCode}
						onChange={(value) => handleChange('ifscCode', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Bank Name"
						placeholder="Enter bank name"
						value={bankDetails.bankName}
						onChange={(value) => handleChange('bankName', value)}
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Branch Name"
						placeholder="Enter branch name"
						value={bankDetails.branchName}
						onChange={(value) => handleChange('branchName', value)}
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
