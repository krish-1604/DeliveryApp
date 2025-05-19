import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { ButtonHighlight } from '../components/button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AadhaarCardDetails() {
	const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
	const [backPhoto, setBackPhoto] = useState<string | null>(null);

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
		if (!result.canceled) {
			if (result.assets && result.assets.length > 0) {
				setPhoto(result.assets[0].uri);
			}
		}
	};

	const handleReupload = (setPhoto: React.Dispatch<React.SetStateAction<string | null>>) => {
		setPhoto(null);
	};

	const handleContinue = () => {
		if (frontPhoto && backPhoto) {
			// navigate to next screen cause i had no backend
		} else {
			alert('Please upload both front and back photos of your Aadhaar card.');
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" />
			<View className="px-4 py-4 flex-row items-center">
				<TouchableOpacity className="pr-4" onPress={() => {}}>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
			</View>
			<View className="px-4 flex-1">
				<Text className="text-3xl font-medium text-gray-800 mb-2">Aadhaar card details</Text>
				<Text className="text-gray-500 mb-6">
					Upload focused photo of your Aadhaar Card for faster verification
				</Text>

				<View className="border border-gray-800 border-dashed rounded-lg p-6 mb-6 items-center justify-center">
					<Text className="text-gray-600 text-center mb-4 px-8">
						Front side photo of your Aadhaar card with your clear name and photo
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

				<View className="border border-gray-800 border-dashed rounded-lg p-6 mb-6 items-center justify-center">
					<Text className="text-gray-600 text-center mb-4 px-8">
						Back side photo of your Aadhaar card with your address details
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
			</View>

			<View className="px-4 py-6 ">
				<ButtonHighlight
					onPress={handleContinue}
					disabled={!frontPhoto || !backPhoto}
					className={` ${!frontPhoto || !backPhoto ? 'bg-gray-300' : 'bg-primary'}`}
				>
					<Text className="text-white font-semibold text-lg text-center ">Continue</Text>
				</ButtonHighlight>
			</View>
		</SafeAreaView>
	);
}
