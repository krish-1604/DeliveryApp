import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ErrorToast from '../components/error';

const PHONE_NUMBER_KEY = 'phoneNumber';
const COMPLETION_STATUS_KEY = 'document_completion_status';

export default function BankDetailsPage() {
	const navigation = useNavigation<NavigationProp<'Bank'>>();
	const [errorMsg, setErrorMsg] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const [bankDetails, setBankDetails] = useState({
		accountHolderName: '',
		accountNumber: '',
		confirmAccountNumber: '',
		ifscCode: '',
		bankName: '',
		branchName: '',
	});



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

			completionStatus.bankDetails = true;
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while updating completion status.'
			);
		}
	};

	const getPhoneNumber = async () => {
		try {
			const phoneNumber = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
			if (!phoneNumber) {
				throw new Error('Phone number not found');
			}
			
			// Add +91 if it doesn't exist
			return phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
		} catch (error) {
			throw new Error('Failed to retrieve phone number');
		}
	};

	const submitBankDetailsToAPI = async () => {
		try {
			const phoneNumber = await getPhoneNumber();
			const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
			
			if (!baseUrl) {
				throw new Error('Backend URL not configured');
			}

			const requestBody = {
				phoneNumber: phoneNumber,
				accountHolderName: bankDetails.accountHolderName,
				accountNumber: bankDetails.accountNumber,
				confirmAccountNumber: bankDetails.confirmAccountNumber,
				ifscCode: bankDetails.ifscCode,
				bankName: bankDetails.bankName,
				branchName: bankDetails.branchName,
			};

			const response = await fetch(`${baseUrl}/api/auth/bank-details`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Server error: ${response.status}`);
			}

			const responseData = await response.json();
			return responseData;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to submit bank details to server');
		}
	};

	const handleChange = (field: string, value: string) => {
		setBankDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const isFormValid = () => {
		return (
			bankDetails.accountHolderName.trim() &&
			bankDetails.accountNumber.trim() &&
			bankDetails.confirmAccountNumber.trim() &&
			bankDetails.ifscCode.trim() &&
			bankDetails.accountNumber === bankDetails.confirmAccountNumber
		);
	};

	const handleSave = async () => {
		if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
			Alert.alert('Error', 'Account numbers do not match');
			return;
		}

		setIsLoading(true);
		try {
			// Submit to API
			await submitBankDetailsToAPI();
			
			// Update completion status after successful API call
			await updateCompletionStatus();
			
			Alert.alert('Success', 'Bank details saved successfully', [
				{
					text: 'OK',
					onPress: () => navigation.navigate({ name: 'Details' } as never),
				},
			]);
		} catch (error) {
			let errorMessage = 'Failed to save bank details. Please try again.';
			
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			
			setErrorMsg(errorMessage);
			
			// Show alert for critical errors
			if (errorMessage.includes('Phone number not found') || errorMessage.includes('Backend URL not configured')) {
				Alert.alert('Configuration Error', errorMessage);
			}
		} finally {
			setIsLoading(false);
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
						<Text className="text-white font-bold text-2xl">Bank Details</Text>
						<Text className="text-white font-semibold text-sm mt-2 ml-1">
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
						keyboardType="numeric"
					/>

					<View style={{ height: 10 }} />
					<Input
						label="Confirm Account Number"
						placeholder="Re-enter your account number"
						value={bankDetails.confirmAccountNumber}
						onChange={(value) => handleChange('confirmAccountNumber', value)}
						keyboardType="numeric"
					/>

					<View style={{ height: 10 }} />
					<Input
						label="IFSC Code"
						placeholder="Enter IFSC code"
						value={bankDetails.ifscCode}
						onChange={(value) => handleChange('ifscCode', value.toUpperCase())}
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
					<ButtonOpacity
						onPress={handleSave}
						disabled={!isFormValid() || isLoading}
						className={`${!isFormValid() || isLoading ? 'bg-gray-400' : 'bg-primary'}`}
					>
						<Text
							className={`font-medium text-xl py-2 ${
								!isFormValid() || isLoading ? 'text-gray-600' : 'text-white'
							}`}
						>
							{isLoading ? 'Saving...' : 'Save Details'}
						</Text>
					</ButtonOpacity>
				</View>
			</ScrollView>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}
		</View>
	);
}