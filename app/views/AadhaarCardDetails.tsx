import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	Image,
	Platform,
	ScrollView,
} from 'react-native';
import { ButtonHighlight } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RootStackParamList } from '@/app/utils/types';

type AadhaarRouteProp = RouteProp<RootStackParamList, 'Aadhaar'>;

export default function AadhaarCardDetails() {
	const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
	const [backPhoto, setBackPhoto] = useState<string | null>(null);

	const navigation = useNavigation<NavigationProp<'Aadhaar'>>();
	const route = useRoute<AadhaarRouteProp>();
	const { text } = route.params; // e.g., "Aadhaar Card"

	const handlePhotoUpload = async (
		setPhoto: React.Dispatch<React.SetStateAction<string | null>>
	) => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (!permissionResult.granted) {
			alert('Camera access is required to upload photos.');
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
	};

	const handleReupload = (setPhoto: React.Dispatch<React.SetStateAction<string | null>>) => {
		setPhoto(null);
	};

	const handleContinue = () => {
		if (frontPhoto && backPhoto) {
			// navigation.navigate('NextScreen'); // Implement as needed
		} else {
			alert(`Please upload both front and back photos of your ${text}.`);
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
						<Text className="text-gray-800 mr-2">{frontPhoto ? 'Uploaded' : 'Take Photo'}</Text>
						<Ionicons name={frontPhoto ? 'close-circle' : 'camera'} size={20} color="gray" />
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
						<Text className="text-gray-800 mr-2">{backPhoto ? 'Uploaded' : 'Take Photo'}</Text>
						<Ionicons name={backPhoto ? 'close-circle' : 'camera'} size={20} color="gray" />
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
		</SafeAreaView>
	);
}
