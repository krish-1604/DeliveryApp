import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	StatusBar,
	Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '@/app/utils/types';
import ErrorToast from '../components/error';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const DOCUMENTS_STATUS_KEY = 'documents_status';
const COMPLETION_STATUS_KEY = 'document_completion_status';

interface DocumentsStatus {
	aadhaarCard: boolean;
	panCard: boolean;
	drivingLicense: boolean;
}

const DocumentsPage = () => {
	const navigation = useNavigation<NavigationProp<'Documents'>>();
	const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus>({
		aadhaarCard: false,
		panCard: false,
		drivingLicense: false,
	});
	const [errorMsg, setErrorMsg] = useState('');

	// Load documents status on component mount and when screen comes into focus
	useEffect(() => {
		loadDocumentsStatus();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadDocumentsStatus();
		}, [])
	);

	const loadDocumentsStatus = async () => {
		try {
			const savedStatus = await AsyncStorage.getItem(DOCUMENTS_STATUS_KEY);
			if (savedStatus) {
				const parsedStatus = JSON.parse(savedStatus);
				setDocumentsStatus(parsedStatus);
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while loading documents status.'
			);
			// console.error('Error loading documents status:', error);
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

			// Check if all documents are uploaded
			// const allDocumentsUploaded = Object.values(documentsStatus).every((status) => status);
			// completionStatus.personalDocuments = allDocumentsUploaded;

			// await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while updating completion status.'
			);
			// console.error('Error updating completion status:', error);
		}
	};

	// Update completion status whenever documents status changes
	useEffect(() => {
		updateCompletionStatus();
	}, [documentsStatus]);

	const handleBackPress = () => {
		navigation.goBack();
	};

	const handleDocumentPress = (documentType: string) => {
		navigation.navigate('Aadhaar', { text: documentType });
	};

	const getDocumentStatus = (documentType: string): boolean => {
		switch (documentType) {
			case 'Aadhar Card':
				return documentsStatus.aadhaarCard;
			case 'PAN Card':
				return documentsStatus.panCard;
			case 'Driving License':
				return documentsStatus.drivingLicense;
			default:
				return false;
		}
	};

	const DocumentButton = ({
		title,
		onPress,
		isCompleted = false,
	}: {
		title: string;
		onPress: () => void;
		isCompleted?: boolean;
	}) => (
		<TouchableOpacity style={styles.documentButton} onPress={onPress} activeOpacity={0.7}>
			<View style={styles.documentButtonContent}>
				<Text style={styles.documentButtonText}>{title}</Text>
				{isCompleted && (
					<View style={styles.completedBadge}>
						<Ionicons name="checkmark" size={16} color="#fff" />
					</View>
				)}
			</View>
			<Ionicons name="chevron-forward" size={20} color="#666" />
		</TouchableOpacity>
	);

	const completedCount = Object.values(documentsStatus).filter((status) => status).length;

	const handleSubmit = async () => {
		console.log('Running submit function');
		try {
			const keys = [
				'aadhaarCard_frontPhoto',
				'aadhaarCard_backPhoto',
				'panCard_frontPhoto',
				'panCard_backPhoto',
				'drivingLicense_frontPhoto',
				'drivingLicense_backPhoto',
			];
			const result = await AsyncStorage.multiGet(keys);
			const phoneNum = await AsyncStorage.getItem('phoneNumber');
			const formattedNum = '+91' + phoneNum;
			console.log(formattedNum);
			const URIs = Object.fromEntries(result);
			console.log('Document URIs:', URIs);
			const URL = EXPO_PUBLIC_BACKEND_URL + '/api/auth/personal-documents';
			const response = await fetch(URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					phoneNumber: formattedNum,
					aadhaarFrontImage: URIs.aadhar_frontPhoto,
					aadhaarBackImage: URIs.aadhar_backPhoto,
					panFrontImage: URIs.pan_frontPhoto,
					panBackImage: URIs.pan_backPhoto,
					licenseFrontImage: URIs.driving_frontPhoto,
					licenseBackImage: URIs.driving_backPhoto,
				}),
			});
			const data = await response.json();
			console.log('API response:', data);
			let completionStatus = {
				personalInformation: true,
				personalDocuments: true,
				vehicleDetails: false,
				bankDetails: false,
				emergencyDetails: false,
			};
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
			navigation.goBack();
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
			</View>

			{/* Content */}
			<View style={styles.content}>
				<Text style={styles.title}>Personal documents</Text>
				<Text style={styles.subtitle}>
					Upload focused photos of below documents{'\n'}for faster verification
				</Text>

				{/* Progress indicator */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>{completedCount}/3 documents completed</Text>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${(completedCount / 3) * 100}%` }]} />
					</View>
				</View>

				<View style={styles.documentsContainer}>
					<DocumentButton
						title="Aadhar Card"
						onPress={() => handleDocumentPress('Aadhar Card')}
						isCompleted={getDocumentStatus('Aadhar Card')}
					/>

					<DocumentButton
						title="PAN Card"
						onPress={() => handleDocumentPress('PAN Card')}
						isCompleted={getDocumentStatus('PAN Card')}
					/>

					<DocumentButton
						title="Driving License"
						onPress={() => handleDocumentPress('Driving License')}
						isCompleted={getDocumentStatus('Driving License')}
					/>
				</View>
			</View>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}

			<View style={{ padding: 20, backgroundColor: '#fff' }}>
				<TouchableOpacity
					style={{
						backgroundColor: completedCount === 3 ? '#4CAF50' : '#bdbdbd',
						paddingVertical: 16,
						borderRadius: 10,
						alignItems: 'center',
					}}
					activeOpacity={completedCount === 3 ? 0.8 : 1}
					disabled={completedCount !== 3}
					onPress={() => {
						console.log('Running submit');
						if (completedCount === 3) {
							handleSubmit();
						} else {
							setErrorMsg('Please upload all documents before submitting.');
						}
					}}
				>
					<Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Submit</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'android' ? 25 : 0,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: {
		padding: 4,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: '600',
		color: '#000',
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		lineHeight: 22,
		marginBottom: 24,
	},
	progressContainer: {
		marginBottom: 32,
	},
	progressText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
	},
	progressBar: {
		height: 6,
		backgroundColor: '#e0e0e0',
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#4CAF50',
		borderRadius: 3,
	},
	documentsContainer: {
		gap: 16,
	},
	documentButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 18,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	documentButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	documentButtonText: {
		fontSize: 18,
		color: '#000',
		fontWeight: '400',
		flex: 1,
	},
	completedBadge: {
		backgroundColor: '#4CAF50',
		borderRadius: 12,
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
});

export default DocumentsPage;
