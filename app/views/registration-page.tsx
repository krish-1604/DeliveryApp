import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import VerificationSVG from '../assets/images/svgs/verification.svg';
import VerificationListTile from '../components/verification-list-tile';
import IconButton from '../components/icon-button';

export default function RegistrationPage() {
	return (
		<View className="h-full flex-col">
			<View className="bg-primary h-[23%]">
				<View className="flex-row justify-between px-5 py-8 bg-white rounded-b-3xl">
					<IconButton name={'chevron-back'} onPress={() => {}} />
					<Text className="text-2xl font-bold">Registration Completed</Text>
					<View></View>
				</View>
				<View className="flex-row px-3 ">
					<View className="flex-col flex-shrink py-5">
						<Text className="text-white font-bold pb-2 text-2xl ">
							Your application is under Verification
						</Text>
						<Text className="text-white ">Account will get activated in 48hrs</Text>
					</View>
					{/* <VerificationImage /> */}
					<View className="mt-4">
						<VerificationSVG width={100} height={100} className="mt-10" />
					</View>
				</View>
			</View>
			<ScrollView className="flex-1 bg-white">
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={false} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={true} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={false} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={true} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={false} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={true} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={false} />
				<VerificationListTile name="Email Verification" onPress={() => {}} isVerified={true} />
			</ScrollView>
		</View>
	);
}
