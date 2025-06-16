import { View, Text, ScrollView } from 'react-native';
import React from 'react';
// import VerificationListTile from '../components/verification-list-tile';
import CheckedGotoListTile from '../components/gotoListTile';
import { ButtonOpacity } from '../components/button';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@/app/utils/types';

export default function FinalDetailsPage() {
	const navigation = useNavigation<NavigationProp<'PersonalInformation'>>();
	const handlePress = () => {
		navigation.navigate('Documents');
	};
	return (
		<View className="h-full flex-col ">
			<View className="bg-primary h-[19%] rounded-b-3xl">
				<View className="flex-row px-8 py-8">
					<View className="flex-col flex-shrink py-5">
						<Text className="text-white font-bold pb-2 text-3xl ">
							Welcome to Himalayan Droneshala
						</Text>
						<Text className="text-white pb-2 font-semibold text-base">
							Just a few steps to complete and then you can start earning with Us
						</Text>
					</View>
				</View>
			</View>
			<ScrollView className="flex-1 bg-white">
				<View className="flex-col flex-shrink py-5 px-5">
					<Text className="text-[#2B2E35] font-semibold pb-2 text-2xl ">Pending Documents</Text>
				</View>
				<CheckedGotoListTile name="Personal Documents" onPress={handlePress} />
				<CheckedGotoListTile name="Vehicle Details" onPress={() => {}} />
				<CheckedGotoListTile name="Bank Account Details" onPress={() => {}} />
				<CheckedGotoListTile name="Emergency Details" onPress={() => {}} />

				<View className="flex-col flex-shrink py-5 px-5">
					<Text className="text-[#2B2E35] font-semibold pb-2 text-2xl ">Completed Documents</Text>
				</View>
				<CheckedGotoListTile name="Personal Information" onPress={() => {}} isChecked={true} />
				<View style={{ height: 100 }} />

				<View className="flex-col flex-shrink py-5 px-5">
					<ButtonOpacity onPress={() => {}}>
						<Text className="text-white font-medium pb-2 text-2xl py-2">Submit</Text>
					</ButtonOpacity>
				</View>
			</ScrollView>
		</View>
	);
}
