import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	Image,
	Platform,
	ScrollView,
	Alert,
} from 'react-native';
import { ButtonHighlight } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp, RootStackParamList } from '@/app/utils/types';
import ErrorToast from '../components/error';
import { saveImage } from '@/app/utils/imageStorage';
import * as Device from 'expo-device';

type AadhaarRouteProp = RouteProp<RootStackParamList, 'Aadhaar'>;

const DOCUMENTS_STATUS_KEY = 'documents_status';

interface DocumentsStatus {
	aadhaarCard: boolean;
	panCard: boolean;
	drivingLicense: boolean;
}

export default function AadhaarCardDetails() {
	const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
	const [backPhoto, setBackPhoto] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState('');

	const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus>({
		aadhaarCard: false,
		panCard: false,
		drivingLicense: false,
	});

	const navigation = useNavigation<NavigationProp<'Aadhaar'>>();
	const route = useRoute<AadhaarRouteProp>();
	const { text } = route.params;

	// Load documents status on component mount
	useEffect(() => {
		loadDocumentsStatus();
	}, []);

	const loadDocumentsStatus = async () => {
		try {
			const savedStatus = await AsyncStorage.getItem(DOCUMENTS_STATUS_KEY);
			if (savedStatus) {
				const parsedStatus = JSON.parse(savedStatus);
				setDocumentsStatus(parsedStatus);
			}
		} catch (error) {
			// console.error('Error loading documents status:', error);
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while loading documents status.'
			);
		}
	};

	const saveDocumentsStatus = async (newStatus: DocumentsStatus) => {
		try {
			await AsyncStorage.setItem(DOCUMENTS_STATUS_KEY, JSON.stringify(newStatus));
		} catch (error) {
			// console.error('Error saving documents status:', error);
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while saving documents status.'
			);
		}
	};

	const getDocumentKey = (documentType: string): keyof DocumentsStatus => {
		switch (documentType) {
			case 'Aadhar Card':
				return 'aadhaarCard';
			case 'PAN Card':
				return 'panCard';
			case 'Driving License':
				return 'drivingLicense';
			default:
				return 'aadhaarCard';
		}
	};

	const handlePhotoUpload = async (
		setPhoto: React.Dispatch<React.SetStateAction<string | null>>
	) => {
		const isSimulator = Platform.OS === 'ios' && !Device.isDevice;

		try {
			if (isSimulator) {
				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [4, 3],
					quality: 1,
				});
				if (!result.canceled && result.assets?.length) {
					setPhoto(result.assets[0].uri);
				}
				return;
			}

			const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
			if (!permissionResult.granted) {
				Alert.alert('Permission Required', 'Camera access is required to upload photos.');
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});

			if (!result.canceled && result.assets?.length) {
				setPhoto(result.assets[0].uri);
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error ? error.message : 'An error occurred while picking the photo.'
			);
		}
	};

	const handleReupload = (setPhoto: React.Dispatch<React.SetStateAction<string | null>>) => {
		setPhoto(null);
	};

	const handleContinue = async () => {
		//const driverID = await AsyncStorage.getItem('driverId');
		if (frontPhoto && backPhoto) {
			try {
				// Update the documents status for the current document type
				const documentKey = getDocumentKey(text);
				const newStatus = {
					...documentsStatus,
					[documentKey]: true,
				};
				setDocumentsStatus(newStatus);
				console.log(documentKey);
				await saveDocumentsStatus(newStatus);
				const uri1 = await saveImage(frontPhoto, documentKey, 'front');
				const uri2 = await saveImage(backPhoto, documentKey, 'back');
				await AsyncStorage.multiSet([
					[`${documentKey}_frontPhoto`, uri1],
					[`${documentKey}_backPhoto`, uri2],
				]);
				Alert.alert('Success', `${text} uploaded successfully!`, [
					{
						text: 'OK',
						onPress: () => navigation.goBack(),
					},
				]);
			} catch (error) {
				console.log(error);
				Alert.alert(
					'Error',
					error instanceof Error ? error.message : 'An error occurred while saving the document.'
				);
			}
		} else {
			Alert.alert('Missing Photos', `Please upload both front and back photos of your ${text}.`);
		}
	};

	return (
		<SafeAreaView
			className="flex-1 bg-white"
			style={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}
		>
			<StatusBar barStyle="dark-content" />
			<View className="px-4 py-4 flex-row items-center">
				<TouchableOpacity className="pr-4" onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4">
				<Text className="text-3xl font-medium text-gray-800 mb-2">{text} details</Text>
				<Text className="text-gray-500 mb-6">
					Upload focused photo of your {text.toLowerCase()} for faster verification
				</Text>

				{/* Front Side Upload */}
				<View className="border border-gray-800 border-dashed rounded-lg p-6 mb-6 items-center justify-center">
					<Text className="text-gray-600 text-center mb-4 px-8">
						Front side photo of your {text.toLowerCase()} with your clear name and photo
					</Text>
					{frontPhoto && (
						<View className="w-10/12 h-52 mb-4 rounded-lg border border-gray-800 border-dashed">
							<Image
								source={{ uri: frontPhoto }}
								className="w-full h-full rounded-lg"
								resizeMode="contain"
							/>
						</View>
					)}
					<TouchableOpacity
						className="bg-white border border-gray-300 rounded-full px-6 py-2 flex-row items-center"
						onPress={() =>
							frontPhoto ? handleReupload(setFrontPhoto) : handlePhotoUpload(setFrontPhoto)
						}
					>
						<Text className="text-gray-800 mr-2">{frontPhoto ? 'Retake' : 'Take Photo'}</Text>
						<Ionicons name={frontPhoto ? 'camera' : 'camera'} size={20} color="gray" />
					</TouchableOpacity>
				</View>

				{/* Back Side Upload */}
				<View className="border border-gray-800 border-dashed rounded-lg p-6 mb-6 items-center justify-center">
					<Text className="text-gray-600 text-center mb-4 px-8">
						Back side photo of your {text.toLowerCase()} with your address details
					</Text>
					{backPhoto && (
						<View className="w-10/12 h-52 mb-4 rounded-lg border border-gray-800 border-dashed">
							<Image
								source={{ uri: backPhoto }}
								className="w-full h-full rounded-lg"
								resizeMode="contain"
							/>
						</View>
					)}
					<TouchableOpacity
						className="bg-white border border-gray-300 rounded-full px-6 py-2 flex-row items-center"
						onPress={() =>
							backPhoto ? handleReupload(setBackPhoto) : handlePhotoUpload(setBackPhoto)
						}
					>
						<Text className="text-gray-800 mr-2">{backPhoto ? 'Retake' : 'Take Photo'}</Text>
						<Ionicons name={backPhoto ? 'camera' : 'camera'} size={20} color="gray" />
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Fixed Bottom Button */}
			<View className="px-4 py-6 absolute bottom-0 left-0 right-0 bg-white">
				<ButtonHighlight
					onPress={handleContinue}
					disabled={!frontPhoto || !backPhoto}
					className={`${!frontPhoto || !backPhoto ? 'bg-gray-300 opacity-50' : 'bg-primary'}`}
				>
					<Text className="text-white font-semibold text-lg text-center">Continue</Text>
				</ButtonHighlight>
			</View>
			{errorMsg !== '' && <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} />}
		</SafeAreaView>
	);
}
