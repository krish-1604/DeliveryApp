import React from 'react';
import { SectionList, Text, View } from 'react-native';
import CheckedGotoListTile from '../components/gotoListTile';

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
						<CheckedGotoListTile name={item.name} onPress={() => {}} />
					) : (
						<CheckedGotoListTile name={item.name} onPress={() => {}} isChecked={true} />
					)
				}
				renderSectionHeader={({ section: { title } }) => (
					<Text className="text-[#2B2E35] font-bold text-lg p-5">{title}</Text>
				)}
			/>
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
