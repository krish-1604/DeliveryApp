import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButtonOpacity } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/input';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ErrorToast from '../components/error';

const BANK_DETAILS_KEY = 'bank_details';
const COMPLETION_STATUS_KEY = 'document_completion_status';

export default function BankDetailsPage() {
	const navigation = useNavigation<NavigationProp<'Bank'>>();
	const [errorMsg, setErrorMsg] = useState('');

	const [bankDetails, setBankDetails] = useState({
		accountHolderName: '',
		accountNumber: '',
		confirmAccountNumber: '',
		ifscCode: '',
		bankName: '',
		branchName: '',
	});

	// Load saved bank details on component mount
	useEffect(() => {
		loadBankDetails();
	}, []);

	const loadBankDetails = async () => {
		try {
			const savedDetails = await AsyncStorage.getItem(BANK_DETAILS_KEY);
			if (savedDetails) {
				const parsedDetails = JSON.parse(savedDetails);
				setBankDetails({
					...parsedDetails,
					confirmAccountNumber: parsedDetails.accountNumber, // Auto-fill confirm field
				});
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while loading bank details.'
			);
			// console.error('Error loading bank details:', error);
		}
	};

	const saveBankDetails = async () => {
		try {
			await AsyncStorage.setItem(BANK_DETAILS_KEY, JSON.stringify(bankDetails));
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while saving bank details.'
			);
			// console.error('Error saving bank details:', error);
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

			completionStatus.bankDetails = true;
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

		try {
			await saveBankDetails();
			await updateCompletionStatus();
			Alert.alert('Success', 'Bank details saved successfully', [
				{
					text: 'OK',
					onPress: () => navigation.navigate({ name: 'Details' } as never),
				},
			]);
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'Failed to save bank details. Please try again.'
			);
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
