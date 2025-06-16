import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@/app/utils/types';

const DocumentsPage = () => {
	const navigation = useNavigation<NavigationProp<'Documents'>>();
	const handleBackPress = () => {
		navigation.goBack();
	};
	const handleDocumentPress = (documentType: string) => {
		navigation.navigate('Aadhaar', { text: documentType });
	};

	const DocumentButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
		<TouchableOpacity style={styles.documentButton} onPress={onPress} activeOpacity={0.7}>
			<Text style={styles.documentButtonText}>{title}</Text>
			<Ionicons name="chevron-forward" size={20} color="#666" />
		</TouchableOpacity>
	);

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

				<View style={styles.documentsContainer}>
					<DocumentButton title="Aadhar Card" onPress={() => handleDocumentPress('Aadhar Card')} />

					<DocumentButton title="PAN Card" onPress={() => handleDocumentPress('PAN Card')} />

					<DocumentButton
						title="Driving License"
						onPress={() => handleDocumentPress('Driving License')}
					/>
				</View>
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
		marginBottom: 40,
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
	documentButtonText: {
		fontSize: 18,
		color: '#000',
		fontWeight: '400',
	},
});

export default DocumentsPage;
