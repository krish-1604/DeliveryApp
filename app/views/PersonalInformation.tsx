import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Alert,
	Modal,
	FlatList,
	Image,
	StatusBar,
	Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '@/app/utils/types';
import ErrorToast from '../components/error';

interface FormData {
	firstName: string;
	lastName: string;
	fatherName: string;
	dateOfBirth: string;
	primaryMobile: string;
	whatsappNumber: string;
	secondaryMobile: string;
	bloodGroup: string;
	address: string;
	languages: string[];
	referralCode: string;
	profileImage: string | null;
}

interface DropdownItem {
	label: string;
	value: string;
}

const PERSONAL_INFO_KEY = 'personal_information';
const COMPLETION_STATUS_KEY = 'document_completion_status';

const PersonalInformationForm: React.FC = () => {
	const [formData, setFormData] = useState<FormData>({
		firstName: '',
		lastName: '',
		fatherName: '',
		dateOfBirth: '',
		primaryMobile: '',
		whatsappNumber: '',
		secondaryMobile: '',
		bloodGroup: '',
		address: '',
		languages: [],
		referralCode: '',
		profileImage: null,
	});

	const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
	const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState<boolean>(false);
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const [hasSavedData, setHasSavedData] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const navigation = useNavigation<NavigationProp<'PersonalInformation'>>();

	const languages: DropdownItem[] = [
		{ label: 'English', value: 'english' },
		{ label: 'Hindi', value: 'hindi' },
		{ label: 'Telugu', value: 'telugu' },
		{ label: 'Tamil', value: 'tamil' },
		{ label: 'Bengali', value: 'bengali' },
		{ label: 'Marathi', value: 'marathi' },
		{ label: 'Gujarati', value: 'gujarati' },
		{ label: 'Kannada', value: 'kannada' },
		{ label: 'Malayalam', value: 'malayalam' },
		{ label: 'Punjabi', value: 'punjabi' },
		{ label: 'Urdu', value: 'urdu' },
		{ label: 'Odia', value: 'odia' },
	];

	const bloodGroups: DropdownItem[] = [
		{ label: 'A+', value: 'A+' },
		{ label: 'A-', value: 'A-' },
		{ label: 'B+', value: 'B+' },
		{ label: 'B-', value: 'B-' },
		{ label: 'AB+', value: 'AB+' },
		{ label: 'AB-', value: 'AB-' },
		{ label: 'O+', value: 'O+' },
		{ label: 'O-', value: 'O-' },
	];

	// Load saved personal information on component mount
	useEffect(() => {
		loadPersonalInfo();
	}, []);

	const loadPersonalInfo = async () => {
		try {
			const savedInfo = await AsyncStorage.getItem(PERSONAL_INFO_KEY);
			if (savedInfo) {
				setHasSavedData(true);
				const parsedInfo = JSON.parse(savedInfo);
				setFormData(parsedInfo);

				// If date of birth exists, set the selectedDate for date picker
				if (parsedInfo.dateOfBirth) {
					// Parse the date from DD - MM - YYYY format
					const dateParts = parsedInfo.dateOfBirth.split(' - ');
					if (dateParts.length === 3) {
						const day = parseInt(dateParts[0]);
						const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
						const year = parseInt(dateParts[2]);
						setSelectedDate(new Date(year, month, day));
					}
				}
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while loading personal information.'
			);
			// console.error('Error loading personal information:', error);
		}
	};

	const savePersonalInfo = async () => {
		try {
			await AsyncStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(formData));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while saving personal information.'
			);
			// console.error('Error saving personal information:', error);
		}
	};

	const updateCompletionStatus = async () => {
		try {
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

			completionStatus.personalInformation = true;
			await AsyncStorage.setItem(COMPLETION_STATUS_KEY, JSON.stringify(completionStatus));
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred while updating completion status.'
			);
			// console.error('Error updating completion status:', error);
		}
	};

	const updateFormData = (field: keyof FormData, value: string | null) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
		setShowDatePicker(false);
		if (date) {
			const today = new Date();
			const age = today.getFullYear() - date.getFullYear();
			const monthDiff = today.getMonth() - date.getMonth();
			const dayDiff = today.getDate() - date.getDate();

			// Calculate exact age
			let exactAge = age;
			if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
				exactAge--;
			}

			if (exactAge < 21) {
				Alert.alert('Age Requirement', 'Driver must be at least 21 years old to register.', [
					{ text: 'OK' },
				]);
				return;
			}

			setSelectedDate(date);
			const formattedDate = `${date.getDate().toString().padStart(2, '0')} - ${(date.getMonth() + 1).toString().padStart(2, '0')} - ${date.getFullYear()}`;
			updateFormData('dateOfBirth', formattedDate);
		}
	};

	const showDatePickerModal = () => {
		setShowDatePicker(true);
	};

	const addLanguage = (languageValue: string) => {
		if (!formData.languages.includes(languageValue)) {
			const updatedLanguages = [...formData.languages, languageValue];
			setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
		}
		setShowLanguageDropdown(false);
	};

	const removeLanguage = (languageValue: string) => {
		const updatedLanguages = formData.languages.filter((lang) => lang !== languageValue);
		setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
	};

	const getSelectedLanguageLabels = (): string[] => {
		return formData.languages.map((value) => {
			const item = languages.find((lang) => lang.value === value);
			return item ? item.label : value;
		});
	};

	const isFormValid = (): boolean => {
		const requiredFields = [
			formData.firstName,
			formData.lastName,
			formData.fatherName,
			formData.dateOfBirth,
			formData.primaryMobile,
			formData.bloodGroup,
			formData.address,
		];

		const allRequiredFieldsFilled = requiredFields.every((field) => field.trim() !== '');
		const hasLanguages = formData.languages.length > 0;

		return allRequiredFieldsFilled && hasLanguages;
	};

	const pickImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permissionResult.granted === false) {
			Alert.alert('Permission Required', 'Permission to access camera roll is required!');
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			updateFormData('profileImage', result.assets[0].uri);
		}
	};

	const validateForm = (): boolean => {
		if (!isFormValid()) {
			Alert.alert('Validation Error', 'Please fill all required fields');
			return false;
		}

		const mobileRegex = /^[0-9]{10}$/;
		if (!mobileRegex.test(formData.primaryMobile)) {
			Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
			return false;
		}

		if (formData.whatsappNumber && !mobileRegex.test(formData.whatsappNumber)) {
			Alert.alert('Validation Error', 'Please enter a valid 10-digit WhatsApp number');
			return false;
		}

		if (formData.secondaryMobile && !mobileRegex.test(formData.secondaryMobile)) {
			Alert.alert('Validation Error', 'Please enter a valid 10-digit secondary mobile number');
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		if (validateForm()) {
			try {
				await savePersonalInfo();
				await updateCompletionStatus();
				Alert.alert('Success', 'Personal information saved successfully!', [
					{
						text: 'OK',
						onPress: () => {
							navigation.navigate('Details');
						},
					},
				]);
			} catch (error) {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred while saving personal information.'
				);
				Alert.alert('Error', 'Failed to save personal information. Please try again.');
			}
		}
	};

	const renderDropdown = (
		items: DropdownItem[],
		selectedValues: string[],
		onSelect: (value: string) => void,
		placeholder: string,
		isMultiSelect: boolean = false
	) => (
		<FlatList
			data={items}
			keyExtractor={(item) => item.value}
			style={styles.dropdownList}
			renderItem={({ item }) => {
				const isSelected = isMultiSelect
					? selectedValues.includes(item.value)
					: selectedValues[0] === item.value;

				return (
					<TouchableOpacity
						style={[styles.dropdownItem, isSelected && styles.selectedDropdownItem]}
						onPress={() => onSelect(item.value)}
					>
						<Text style={[styles.dropdownItemText, isSelected && styles.selectedDropdownItemText]}>
							{item.label}
						</Text>
						{isSelected && isMultiSelect && <Ionicons name="checkmark" size={20} color="#003032" />}
					</TouchableOpacity>
				);
			}}
		/>
	);

	const getSelectedLabel = (items: DropdownItem[], value: string): string => {
		const item = items.find((item) => item.value === value);
		return item ? item.label : '';
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />
			{hasSavedData && (
				<TouchableOpacity
					style={{ paddingHorizontal: 20, paddingTop: 20 }}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="chevron-back" size={24} color="#003032" />
				</TouchableOpacity>
			)}
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.title}>Personal Information</Text>
					<Text style={styles.subtitle}>
						Fill in the details below so we can get to know you and serve you better
					</Text>
				</View>

				<View style={styles.form}>
					{/* First Name */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>First Name</Text>
						<TextInput
							style={[styles.input, focusedField === 'firstName' && styles.focusedInput]}
							placeholder="Please enter first name"
							value={formData.firstName}
							onChangeText={(text) => updateFormData('firstName', text)}
							onFocus={() => setFocusedField('firstName')}
							onBlur={() => setFocusedField(null)}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Last Name */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Last Name</Text>
						<TextInput
							style={[styles.input, focusedField === 'lastName' && styles.focusedInput]}
							placeholder="Please enter last name"
							value={formData.lastName}
							onChangeText={(text) => updateFormData('lastName', text)}
							onFocus={() => setFocusedField('lastName')}
							onBlur={() => setFocusedField(null)}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Father's Name */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Father's Name</Text>
						<TextInput
							style={[styles.input, focusedField === 'fatherName' && styles.focusedInput]}
							placeholder="Please enter father's name"
							value={formData.fatherName}
							onChangeText={(text) => updateFormData('fatherName', text)}
							onFocus={() => setFocusedField('fatherName')}
							onBlur={() => setFocusedField(null)}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Date of Birth */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Date of birth</Text>
						<TouchableOpacity
							style={[
								styles.dateInputContainer,
								focusedField === 'dateOfBirth' && styles.focusedInput,
							]}
							onPress={showDatePickerModal}
						>
							<Text style={[styles.dateInputText, !formData.dateOfBirth && styles.placeholderText]}>
								{formData.dateOfBirth || 'DD - MM - YYYY'}
							</Text>
							<Ionicons
								name="calendar-outline"
								size={20}
								color="#666"
								style={styles.calendarIcon}
							/>
						</TouchableOpacity>
					</View>

					{/* Primary Mobile Number */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Primary mobile number</Text>
						<TextInput
							style={[styles.input, focusedField === 'primaryMobile' && styles.focusedInput]}
							placeholder="Enter 10 digit mobile number"
							value={formData.primaryMobile}
							onChangeText={(text) => updateFormData('primaryMobile', text)}
							onFocus={() => setFocusedField('primaryMobile')}
							onBlur={() => setFocusedField(null)}
							keyboardType="numeric"
							maxLength={10}
							placeholderTextColor="#999"
						/>
					</View>

					{/* WhatsApp Number */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>WhatsApp number</Text>
						<TextInput
							style={[styles.input, focusedField === 'whatsappNumber' && styles.focusedInput]}
							placeholder="Enter 10 digit WhatsApp number"
							value={formData.whatsappNumber}
							onChangeText={(text) => updateFormData('whatsappNumber', text)}
							onFocus={() => setFocusedField('whatsappNumber')}
							onBlur={() => setFocusedField(null)}
							keyboardType="numeric"
							maxLength={10}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Secondary Mobile Number */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Secondary mobile number (Optional)</Text>
						<TextInput
							style={[styles.input, focusedField === 'secondaryMobile' && styles.focusedInput]}
							placeholder="Enter secondary mobile number"
							value={formData.secondaryMobile}
							onChangeText={(text) => updateFormData('secondaryMobile', text)}
							onFocus={() => setFocusedField('secondaryMobile')}
							onBlur={() => setFocusedField(null)}
							keyboardType="numeric"
							maxLength={10}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Blood Group */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Blood Group</Text>
						<TouchableOpacity
							style={styles.dropdownButton}
							onPress={() => setShowBloodGroupDropdown(true)}
						>
							<Text
								style={[styles.dropdownButtonText, !formData.bloodGroup && styles.placeholderText]}
							>
								{formData.bloodGroup
									? getSelectedLabel(bloodGroups, formData.bloodGroup)
									: 'Select blood group here'}
							</Text>
							<Ionicons name="chevron-down" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* Address */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Address</Text>
						<TextInput
							style={[
								styles.input,
								styles.multilineInput,
								focusedField === 'address' && styles.focusedInput,
							]}
							placeholder="Enter complete address here"
							value={formData.address}
							onChangeText={(text) => updateFormData('address', text)}
							onFocus={() => setFocusedField('address')}
							onBlur={() => setFocusedField(null)}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							placeholderTextColor="#999"
						/>
					</View>

					{/* Language */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Languages you know</Text>

						{/* Selected Languages Display */}
						{formData.languages.length > 0 && (
							<View style={styles.selectedLanguagesContainer}>
								{getSelectedLanguageLabels().map((languageLabel, index) => (
									<View key={index} style={styles.languageTag}>
										<Text style={styles.languageTagText}>{languageLabel}</Text>
										<TouchableOpacity
											onPress={() => removeLanguage(formData.languages[index])}
											style={styles.removeLanguageButton}
										>
											<Ionicons name="close" size={16} color="#003032" />
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						<TouchableOpacity
							style={styles.dropdownButton}
							onPress={() => setShowLanguageDropdown(true)}
						>
							<Text
								style={[
									styles.dropdownButtonText,
									formData.languages.length === 0 && styles.placeholderText,
								]}
							>
								{formData.languages.length > 0
									? `${formData.languages.length} language${formData.languages.length > 1 ? 's' : ''} selected`
									: 'Select your languages'}
							</Text>
							<Ionicons name="chevron-down" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* Profile Picture */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Your Profile Picture</Text>
						<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
							{formData.profileImage ? (
								<Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
							) : (
								<View style={styles.uploadPlaceholder}>
									<Ionicons name="camera" size={24} color="#003032" />
									<Text style={styles.uploadButtonText}>Upload Photo</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>

					{/* Referral Code */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Referral code (Optional)</Text>
						<TextInput
							style={[styles.input, focusedField === 'referralCode' && styles.focusedInput]}
							placeholder="Enter referral code"
							value={formData.referralCode}
							onChangeText={(text) => updateFormData('referralCode', text)}
							onFocus={() => setFocusedField('referralCode')}
							onBlur={() => setFocusedField(null)}
							placeholderTextColor="#999"
						/>
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						style={[styles.submitButton, !isFormValid() && styles.disabledSubmitButton]}
						onPress={handleSubmit}
						disabled={!isFormValid()}
					>
						<Text
							style={[styles.submitButtonText, !isFormValid() && styles.disabledSubmitButtonText]}
						>
							Submit
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Date Picker */}
			{showDatePicker && (
				<DateTimePicker
					value={selectedDate}
					mode="date"
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={handleDateChange}
					maximumDate={new Date()}
					minimumDate={new Date(1900, 0, 1)}
					accentColor="#003032"
					textColor="#003032"
				/>
			)}

			{/* Language Dropdown Modal */}
			<Modal
				visible={showLanguageDropdown}
				transparent
				animationType="slide"
				onRequestClose={() => setShowLanguageDropdown(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Language</Text>
							<TouchableOpacity onPress={() => setShowLanguageDropdown(false)}>
								<Ionicons name="close" size={24} color="#666" />
							</TouchableOpacity>
						</View>
						{renderDropdown(
							languages,
							formData.languages,
							addLanguage,
							'Select your languages',
							true
						)}
					</View>
				</View>
			</Modal>

			{/* Blood Group Dropdown Modal */}
			<Modal
				visible={showBloodGroupDropdown}
				transparent
				animationType="slide"
				onRequestClose={() => setShowBloodGroupDropdown(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Blood Group</Text>
							<TouchableOpacity onPress={() => setShowBloodGroupDropdown(false)}>
								<Ionicons name="close" size={24} color="#666" />
							</TouchableOpacity>
						</View>
						{renderDropdown(
							bloodGroups,
							[formData.bloodGroup],
							(value) => {
								updateFormData('bloodGroup', value);
								setShowBloodGroupDropdown(false);
							},
							'Select blood group',
							false
						)}
					</View>
				</View>
			</Modal>
			{errorMsg ? <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} /> : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'android' ? 25 : 0,
	},
	scrollView: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		color: '#666',
		lineHeight: 20,
	},
	form: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: '#333',
		backgroundColor: '#fff',
	},
	focusedInput: {
		borderColor: '#003032',
		borderWidth: 2,
	},
	multilineInput: {
		height: 100,
		paddingTop: 12,
	},
	dateInputContainer: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	dateInputText: {
		fontSize: 16,
		color: '#333',
	},
	calendarIcon: {
		marginLeft: 10,
	},
	dropdownButton: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	dropdownButtonText: {
		fontSize: 16,
		color: '#333',
	},
	placeholderText: {
		color: '#999',
	},
	uploadButton: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		padding: 20,
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	uploadPlaceholder: {
		alignItems: 'center',
	},
	uploadButtonText: {
		fontSize: 16,
		color: '#003032',
		marginTop: 8,
		fontWeight: '500',
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	submitButton: {
		backgroundColor: '#003032',
		borderRadius: 8,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 20,
	},
	submitButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '80%',
		paddingBottom: 20,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	dropdownList: {
		maxHeight: 300,
	},
	dropdownItem: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	selectedDropdownItem: {
		backgroundColor: '#E8F4F5',
	},
	dropdownItemText: {
		fontSize: 16,
		color: '#333',
	},
	selectedDropdownItemText: {
		color: '#003032',
		fontWeight: '500',
	},
	selectedLanguagesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 10,
		gap: 8,
	},
	languageTag: {
		backgroundColor: '#E8F4F5',
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 8,
		marginBottom: 8,
	},
	languageTagText: {
		color: '#003032',
		fontSize: 14,
		fontWeight: '500',
		marginRight: 6,
	},
	removeLanguageButton: {
		padding: 2,
	},
	disabledSubmitButton: {
		backgroundColor: '#CCCCCC',
	},
	disabledSubmitButtonText: {
		color: '#666666',
	},
});

export default PersonalInformationForm;
