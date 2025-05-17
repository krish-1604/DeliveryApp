import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

export default function DocumentPage() {
	return (
		<View className="flex-col bg-[#FAFAFA] h-full">
			<View className="flex-col bg-primary rounded-b-[15%] h-[25%] p-10 ">
				<Text className="text-white font-bold text-3xl pb-3 mt-10">
					Welcome to Himalayan Droneshala
				</Text>
				<Text className="text-white">
					Just a few steps to complete and then you can start earning with Us
				</Text>
			</View>
			<SectionList
				sections={dataToBeFetchedByAController}
				renderItem={({ item }) =>
					item.status === 'pending' ? (
						<SelectionListTile name={item.name} onPress={() => {}} />
					) : (
						<CompletedSelectionListTile name={item.name} onPress={() => {}} />
					)
				}
				renderSectionHeader={({ section: { title } }) => (
					<Text className="text-[#2B2E35] font-bold text-lg p-5">{title}</Text>
				)}
			/>
		</View>
	);
}

function SelectionListTile({ name = '', onPress = () => {} }) {
	return (
		<View className="px-5 py-3">
			<Pressable
				onPress={onPress}
				className="flex-row items-center p-4 bg-white mx-2 my-0 rounded-lg shadow"
			>
				<View className="flex-1">
					<Text className="font-medium text-base text-[#2B2E35]">{name}</Text>
				</View>
				<View>
					<Ionicons name="chevron-forward" size={24} color="#969AA4" />
				</View>
			</Pressable>
		</View>
	);
}

function CompletedSelectionListTile({ name = '', onPress = () => {} }) {
	return (
		<View className="px-5 py-3">
			<Pressable
				onPress={onPress}
				className="flex-row items-center p-4 bg-white mx-2 my-0 rounded-lg shadow"
			>
				<Ionicons name="checkmark" size={24} color="#2B2E35" />
				<View className="flex-1">
					<Text className="font-medium text-base text-[#2B2E35]">{name}</Text>
				</View>
				<View>
					<Ionicons name="chevron-forward" size={24} color="#969AA4" />
				</View>
			</Pressable>
		</View>
	);
}

const dataToBeFetchedByAController = [
	{
		title: 'Pending Documents',
		data: [
			{
				id: 1,
				name: 'Document 1',
				status: 'pending',
			},
			{
				id: 2,
				name: 'Document 2',
				status: 'pending',
			},
			{
				id: 3,
				name: 'Document 3',
				status: 'pending',
			},
			{
				id: 4,
				name: 'Document 4',
				status: 'pending',
			},
		],
	},
	{
		title: 'Completed Documents',
		data: [
			{
				id: 5,
				name: 'Document 5',
				status: 'completed',
			},
			{
				id: 6,
				name: 'Document 6',
				status: 'completed',
			},
		],
	},
];
