import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	StatusBar,
	Platform,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '@/app/utils/types';
import ErrorToast from '../components/error';
import { deleteCachedImage } from '@/app/utils/imageStorage';

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
	const [isLoading, setIsLoading] = useState(false);

	// Load documents status on component mount and when screen comes into focus
	useEffect(() => {
		const getDriverId = async () => {
			try {
				const driverId = await AsyncStorage.getItem('driverId');
				console.log('Driver ID:', driverId);
			} catch (error) {
				console.log('Error fetching driverId:', error);
			}
		};
		getDriverId();
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
		if (isLoading) return; // Prevent navigation while loading
		navigation.goBack();
	};

	const handleDocumentPress = (documentType: string) => {
		if (isLoading) return; // Prevent navigation while loading
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
		<TouchableOpacity
			style={[styles.documentButton, isLoading && styles.disabledButton]}
			onPress={onPress}
			activeOpacity={isLoading ? 1 : 0.7}
			disabled={isLoading}
		>
			<View style={styles.documentButtonContent}>
				<Text style={[styles.documentButtonText, isLoading && styles.disabledText]}>{title}</Text>
				{isCompleted && (
					<View style={styles.completedBadge}>
						<Ionicons name="checkmark" size={16} color="#fff" />
					</View>
				)}
			</View>
			<Ionicons name="chevron-forward" size={20} color={isLoading ? '#ccc' : '#666'} />
		</TouchableOpacity>
	);

	const completedCount = Object.values(documentsStatus).filter((status) => status).length;

	const compressImage = async (imageUri: string, quality = 0.5) => {
		try {
			const manipulatedImage = await ImageManipulator.manipulateAsync(
				imageUri,
				[
					// Resize to maximum width of 1000px while maintaining aspect ratio
					{ resize: { width: 1000 } },
				],
				{
					compress: quality, // 0.5 = 50% quality, adjust as needed
					format: ImageManipulator.SaveFormat.JPEG,
				}
			);
			return manipulatedImage.uri;
		} catch (error) {
			console.log('Error compressing image:', error);
			return imageUri; // Return original if compression fails
		}
	};

	const handleSubmit = async () => {
		console.log('Running submit function');
		setIsLoading(true);

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
			//console.log('Document URIs:', URIs);

			// Check if all required images are present
			const requiredImages = [
				'aadhaarCard_frontPhoto',
				'aadhaarCard_backPhoto',
				'panCard_frontPhoto',
				'panCard_backPhoto',
				'drivingLicense_frontPhoto',
				'drivingLicense_backPhoto',
			];

			for (const imageKey of requiredImages) {
				if (!URIs[imageKey]) {
					setErrorMsg(`Missing image: ${imageKey}`);
					return;
				}
			}

			// Compress all images
			console.log('Compressing images...');
			const compressedURIs: { [key: string]: string } = {};
			for (const [key, uri] of Object.entries(URIs)) {
				if (uri) {
					console.log(`Compressing ${key}...`);
					compressedURIs[key] = await compressImage(uri, 0.7); // 70% quality
				}
			}
			console.log('Images compressed successfully');

			const URL = EXPO_PUBLIC_BACKEND_URL + '/api/auth/personal-documents';
			const formData = new FormData();

			formData.append('phoneNumber', formattedNum);

			// Use compressed images
			formData.append('aadhaarFront', {
				uri: compressedURIs.aadhaarCard_frontPhoto,
				name: 'aadhaar_front.jpg',
				type: 'image/jpeg',
			} as any);

			formData.append('aadhaarBack', {
				uri: compressedURIs.aadhaarCard_backPhoto,
				name: 'aadhaar_back.jpg',
				type: 'image/jpeg',
			} as any);

			formData.append('panFront', {
				uri: compressedURIs.panCard_frontPhoto,
				name: 'pan_front.jpg',
				type: 'image/jpeg',
			} as any);

			formData.append('panBack', {
				uri: compressedURIs.panCard_backPhoto,
				name: 'pan_back.jpg',
				type: 'image/jpeg',
			} as any);

			formData.append('licenseFront', {
				uri: compressedURIs.drivingLicense_frontPhoto,
				name: 'license_front.jpg',
				type: 'image/jpeg',
			} as any);

			formData.append('licenseBack', {
				uri: compressedURIs.drivingLicense_backPhoto,
				name: 'license_back.jpg',
				type: 'image/jpeg',
			} as any);

			console.log('Sending request to:', URL);
			console.log('FormData prepared successfully');

			const response = await fetch(URL, {
				method: 'POST',
				body: formData,
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				if (response.status === 413) {
					throw new Error(
						'Images are too large. Please try taking smaller photos or contact support.'
					);
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			//console.log('API response:', data);

			// Clean up cached images (both original and compressed)
			const imagesToDelete = [...Object.values(URIs), ...Object.values(compressedURIs)];

			imagesToDelete.forEach((imageUri) => {
				if (imageUri) {
					deleteCachedImage(imageUri);
				}
			});

			// Update completion status
			const savedStatus = await AsyncStorage.getItem(COMPLETION_STATUS_KEY);
			let completionStatus = {
				personalInformation: false,
				personalDocuments: false,
				vehicleDetails: false,
				bankDetails: false,
				emergencyDetails: false,
			};

			if (savedStatus) {
				completionStatus = JSON.parse(savedStatus);
			}

			completionStatus.personalDocuments = true;
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));

			navigation.goBack();
		} catch (err) {
			console.log('Error in handleSubmit:', err);
			setErrorMsg(
				err instanceof Error ? err.message : 'An error occurred while submitting documents.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={handleBackPress}
					style={[styles.backButton, isLoading && styles.disabledButton]}
					disabled={isLoading}
				>
					<Ionicons name="chevron-back" size={24} color={isLoading ? '#ccc' : '#000'} />
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

			{/* Loading Overlay */}
			{isLoading && (
				<View style={styles.loadingOverlay}>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#4CAF50" />
						<Text style={styles.loadingText}>Submitting documents...</Text>
						<Text style={styles.loadingSubtext}>Please wait while we upload your documents</Text>
					</View>
				</View>
			)}

			<View style={styles.submitButtonContainer}>
				<TouchableOpacity
					style={[
						styles.submitButton,
						{
							backgroundColor: completedCount === 3 && !isLoading ? '#003032' : '#bdbdbd',
						},
					]}
					activeOpacity={completedCount === 3 && !isLoading ? 0.8 : 1}
					disabled={completedCount !== 3 || isLoading}
					onPress={() => {
						console.log('Running submit');
						if (completedCount === 3 && !isLoading) {
							handleSubmit();
						} else if (completedCount !== 3) {
							setErrorMsg('Please upload all documents before submitting.');
						}
					}}
				>
					{isLoading ? (
						<View style={styles.submitButtonLoading}>
							<ActivityIndicator size="small" color="#fff" />
							<Text style={styles.submitButtonText}>Submitting...</Text>
						</View>
					) : (
						<Text style={styles.submitButtonText}>Submit</Text>
					)}
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
	disabledButton: {
		opacity: 0.6,
	},
	disabledText: {
		color: '#999',
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	loadingContainer: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 32,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
		minWidth: 280,
	},
	loadingText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
		marginTop: 16,
		textAlign: 'center',
	},
	loadingSubtext: {
		fontSize: 14,
		color: '#666',
		marginTop: 8,
		textAlign: 'center',
		lineHeight: 20,
	},
	submitButtonContainer: {
		padding: 20,
		backgroundColor: '#fff',
	},
	submitButton: {
		paddingVertical: 16,
		borderRadius: 10,
		alignItems: 'center',
	},
	submitButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	submitButtonLoading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
});

export default DocumentsPage;
