import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckedGotoListTile from '../components/gotoListTile';
import { ButtonOpacity } from '../components/button';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@/app/utils/types';
import ErrorToast from '../components/error';

interface CompletionStatus {
	personalInformation: boolean;
	personalDocuments: boolean;
	vehicleDetails: boolean;
	bankDetails: boolean;
	emergencyDetails: boolean;
}

const COMPLETION_STATUS_KEY = 'document_completion_status';

export default function FinalDetailsPage() {
	const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
	const [errorMsg, setErrorMsg] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const navigation = useNavigation<NavigationProp<'PersonalInformation'>>();
	const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
		personalInformation: true,
		personalDocuments: false,
		vehicleDetails: false,
		bankDetails: false,
		emergencyDetails: false,
	});

	// Load completion status from AsyncStorage
	const loadCompletionStatus = async () => {
		const phoneNum = await AsyncStorage.getItem('phoneNumber');
		const URL = BACKEND_URL + '/api/auth/complete-verification';

		try {
			setIsLoading(true);
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					phoneNumber: `+91${phoneNum}`,
				}),
			});

			const data = await response.json();
			//console.log('Verification status:', data);

			if (data?.profileStatus) {
				const status = data.profileStatus;
				const newCompletionStatus: CompletionStatus = {
					personalInformation: status.personalInfo?.completed ?? false,
					personalDocuments: status.personalDocuments?.completed ?? false,
					vehicleDetails: status.vehicleDetails?.completed ?? false,
					bankDetails: status.bankDetails?.completed ?? false,
					emergencyDetails: status.emergencyDetails?.completed ?? false,
				};
				setCompletionStatus(newCompletionStatus);
			}
		} catch (error) {
			console.error('Error fetching verification status:', error);
			setErrorMsg('Failed to load verification status. Please try again later.');
		} finally {
			setIsLoading(false);
		}
		// try {
		// 	const savedStatus = await AsyncStorage.getItem(COMPLETION_STATUS_KEY);
		// 	if (savedStatus) {
		// 		const parsedStatus = JSON.parse(savedStatus);
		// 		setCompletionStatus({
		// 			...parsedStatus,
		// 			personalInformation: true, // Always keep this true
		// 		});
		// 	}
		// } catch (error) {
		// 	// console.error('Error loading completion status:', error);
		// 	setErrorMsg(error instanceof Error ? error.message : String(error));
		// }
	};

	const areAllDocumentsCompleted = () => {
		return Object.values(completionStatus).every((status) => status);
	};

	useEffect(() => {
		const setAsync = async () => {
			await AsyncStorage.setItem('detailsSubmit', 'false');
		};
		setAsync();
		loadCompletionStatus();
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadCompletionStatus();
		}, [])
	);

	// Show loading screen while fetching data
	if (isLoading) {
		return (
			<View className="h-full flex-col justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#003032" />
				<Text className="text-gray-600 mt-4 text-lg">Loading verification status...</Text>
			</View>
		);
	}

	// Update completion status and save to storage
	// const updateCompletionStatus = (key: keyof CompletionStatus, value: boolean) => {
	// 	const newStatus = { ...completionStatus, [key]: value };
	// 	setCompletionStatus(newStatus);
	// 	saveCompletionStatus(newStatus);
	// };

	const handleDocumentPress = () => {
		navigation.navigate('Documents');
	};

	const handleVehiclePress = () => {
		navigation.navigate('Vehicle');
	};

	const handleBankPress = () => {
		navigation.navigate('Bank');
	};

	const handleEmergencyPress = () => {
		navigation.navigate('Emergency');
	};

	const handlePersonalInfoPress = () => {
		navigation.navigate('PersonalInformation');
	};

	const handleSubmit = () => {
		if (areAllDocumentsCompleted()) {
			const setAsync = async () => {
				await AsyncStorage.setItem('detailsSubmit', 'true');
			};
			setAsync();
			navigation.navigate('RegistrationCompleted');
		} else {
			setErrorMsg('Please complete all sections before submitting.');
		}
	};

	// Separate pending and completed documents
	const pendingDocuments = [
		{
			name: 'Personal Documents',
			onPress: handleDocumentPress,
			isCompleted: completionStatus.personalDocuments,
		},
		{
			name: 'Vehicle Details',
			onPress: handleVehiclePress,
			isCompleted: completionStatus.vehicleDetails,
		},
		{
			name: 'Bank Account Details',
			onPress: handleBankPress,
			isCompleted: completionStatus.bankDetails,
		},
		{
			name: 'Emergency Details',
			onPress: handleEmergencyPress,
			isCompleted: completionStatus.emergencyDetails,
		},
	].filter((doc) => !doc.isCompleted);

	const completedDocuments = [
		{
			name: 'Personal Information',
			onPress: handlePersonalInfoPress,
			isCompleted: completionStatus.personalInformation,
		},
		{
			name: 'Personal Documents',
			onPress: handleDocumentPress,
			isCompleted: completionStatus.personalDocuments,
		},
		{
			name: 'Vehicle Details',
			onPress: handleVehiclePress,
			isCompleted: completionStatus.vehicleDetails,
		},
		{
			name: 'Bank Account Details',
			onPress: handleBankPress,
			isCompleted: completionStatus.bankDetails,
		},
		{
			name: 'Emergency Details',
			onPress: handleEmergencyPress,
			isCompleted: completionStatus.emergencyDetails,
		},
	].filter((doc) => doc.isCompleted);

	return (
		<View className="h-full flex-col ">
			<View className="bg-primary h-[19%] rounded-b-3xl justify-center items-center">
				<View className="flex-row px-8 py-8">
					<View className="flex-col flex-shrink py-5">
						<Text className="text-white font-bold pb-4 mt-10 text-xl text-center">
							Welcome to Himalayan Droneshala
						</Text>
						<Text className="text-white font-semibold text-sm text-center">
							Just a few steps to complete and then you can start earning with Us
						</Text>
					</View>
				</View>
			</View>
			<ScrollView className="flex-1 bg-white">
				{/* Pending Documents Section */}
				{pendingDocuments.length > 0 && (
					<>
						<View className="flex-col flex-shrink py-5 px-5">
							<Text className="text-[#2B2E35] font-semibold pb-2 text-2xl ">
								Pending Documents ({pendingDocuments.length})
							</Text>
						</View>
						{pendingDocuments.map((doc, index) => (
							<CheckedGotoListTile
								key={`pending-${index}`}
								name={doc.name}
								onPress={doc.onPress}
								isChecked={false}
							/>
						))}
					</>
				)}

				{/* Completed Documents Section */}
				{completedDocuments.length > 0 && (
					<>
						<View className="flex-col flex-shrink py-5 px-5">
							<Text className="text-[#2B2E35] font-semibold pb-2 text-2xl ">
								Completed Documents ({completedDocuments.length})
							</Text>
						</View>
						{completedDocuments.map((doc, index) => (
							<CheckedGotoListTile
								key={`completed-${index}`}
								name={doc.name}
								onPress={doc.onPress}
								isChecked={true}
							/>
						))}
					</>
				)}

				<View style={{ height: 50 }} />

				<View className="flex-col flex-shrink py-5 px-5">
					<ButtonOpacity
						onPress={handleSubmit}
						disabled={!areAllDocumentsCompleted()}
						className={`${!areAllDocumentsCompleted() ? 'bg-gray-400' : 'bg-primary'}`}
					>
						<Text
							className={`font-medium pb-2 text-2xl py-2 ${
								!areAllDocumentsCompleted() ? 'text-gray-600' : 'text-white'
							}`}
						>
							{areAllDocumentsCompleted()
								? 'Submit'
								: `Complete ${5 - completedDocuments.length} more sections`}
						</Text>
					</ButtonOpacity>
				</View>
			</ScrollView>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}
		</View>
	);
}
