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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverAPI } from '@/app/utils/routes/driver';

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
	const [errorMsg, setErrorMsg] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigation = useNavigation<NavigationProp<'PersonalInformation'>>();
	const [isDriverID, setIsDriverID] = useState(false);
	const insets = useSafeAreaInsets();
	const driverAPI = new DriverAPI();

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

	useEffect(() => {
		setupAPIAuth();
		loadPhoneNumber();
	}, []);

	const loadPhoneNumber = async () => {
		try {
			const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
			if (storedPhoneNumber) {
				// Remove +91 prefix if present and keep only 10 digits
				const cleanPhone = storedPhoneNumber.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
				setFormData((prev) => ({ ...prev, primaryMobile: cleanPhone }));
			}
		} catch (error) {
			console.error('Error loading phone number from AsyncStorage:', error);
		}
	};

	const setupAPIAuth = async () => {
		try {
			// Get stored auth token and driver info
			const token = await AsyncStorage.getItem('auth_token');
			const driverId = await AsyncStorage.getItem('driverId');
			//console.log(driverId);
			const phoneNumber = await AsyncStorage.getItem('phoneNumber');
			if (driverId != null) {
				setIsDriverID(true);
				//console.log('DriverId set to true' + isDriverID);
			}
			if (token) {
				driverAPI.setBearer(token);
			}

			if (driverId && phoneNumber) {
				driverAPI.setDriverHeaders(driverId, phoneNumber);
			}
		} catch (error) {
			console.error('Error setting up API auth:', error);
		}
	};

	const updateFormData = (field: keyof FormData, value: string | null) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const calculateAge = (birthDate: Date): number => {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	};

	const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
		setShowDatePicker(false);

		if (date && event.type === 'set') {
			const age = calculateAge(date);

			if (age < 21) {
				Alert.alert('Age Requirement', 'Driver must be at least 21 years old to register.', [
					{ text: 'OK' },
				]);
				return;
			}

			setSelectedDate(date);
			const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
		try {
			// Request permissions
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert('Permission Required', 'Permission to access camera roll is required!');
				return;
			}

			// Launch image picker with simplified options
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const selectedImage = result.assets[0];

				// Validate file size (5MB limit)
				if (selectedImage.fileSize && selectedImage.fileSize > 5 * 1024 * 1024) {
					Alert.alert(
						'File Size Error',
						'Image size should be less than 5MB. Please select a smaller image.'
					);
					return;
				}

				// Validate image format
				const validFormats = ['jpg', 'jpeg', 'png'];
				const fileExtension = selectedImage.uri.split('.').pop()?.toLowerCase();

				if (fileExtension && !validFormats.includes(fileExtension)) {
					Alert.alert('Format Error', 'Please select a JPEG or PNG image.');
					return;
				}

				updateFormData('profileImage', selectedImage.uri);
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image. Please try again.');
		}
	};

	const validatePhoneNumber = (phone: string): boolean => {
		const cleanPhone = phone.replace(/\D/g, '');
		return cleanPhone.length === 10 && /^[0-9]{10}$/.test(cleanPhone);
	};

	const validateForm = (): boolean => {
		// Check if all required fields are filled
		if (!isFormValid()) {
			setErrorMsg('Please fill all required fields');
			return false;
		}

		// Validate primary mobile
		if (!validatePhoneNumber(formData.primaryMobile)) {
			setErrorMsg('Please enter a valid 10-digit mobile number');
			return false;
		}

		// Validate WhatsApp number if provided
		if (formData.whatsappNumber && !validatePhoneNumber(formData.whatsappNumber)) {
			setErrorMsg('Please enter a valid 10-digit WhatsApp number');
			return false;
		}

		// Validate secondary mobile if provided
		if (formData.secondaryMobile && !validatePhoneNumber(formData.secondaryMobile)) {
			setErrorMsg('Please enter a valid 10-digit secondary mobile number');
			return false;
		}

		return true;
	};

	const formatPhoneNumber = (phone: string): string => {
		// Clean the phone number - remove all non-digits
		const cleanPhone = phone.replace(/\D/g, '');

		// If it already has country code (starts with 91), format it
		if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
			return `+${cleanPhone}`;
		}

		// If it's a 10-digit number, add +91
		if (cleanPhone.length === 10) {
			return `+91${cleanPhone}`;
		}

		// If it's longer than 10 digits but doesn't start with 91, take last 10 digits
		if (cleanPhone.length > 10) {
			return `+91${cleanPhone.slice(-10)}`;
		}

		// Default case - add +91 to whatever we have
		return `+91${cleanPhone}`;
	};

	const submitToAPI = async (): Promise<boolean> => {
		try {
			setIsSubmitting(true);
			setErrorMsg('');

			// Create FormData for multipart/form-data submission
			const formDataToSend = new FormData();

			// Add basic form fields
			formDataToSend.append('phoneNumber', formatPhoneNumber(formData.primaryMobile));
			formDataToSend.append('firstName', formData.firstName.trim());
			formDataToSend.append('lastName', formData.lastName.trim());
			formDataToSend.append('fatherName', formData.fatherName.trim());
			formDataToSend.append('dateOfBirth', formData.dateOfBirth);
			formDataToSend.append('address', formData.address.trim());
			formDataToSend.append('language', formData.languages.join(','));
			formDataToSend.append('bloodGroup', formData.bloodGroup);

			// Add optional fields only if they exist
			if (formData.whatsappNumber.trim()) {
				formDataToSend.append('whatsappNumber', formatPhoneNumber(formData.whatsappNumber));
			}
			if (formData.secondaryMobile.trim()) {
				formDataToSend.append('secondaryNumber', formatPhoneNumber(formData.secondaryMobile));
			}
			if (formData.referralCode.trim()) {
				formDataToSend.append('referralCode', formData.referralCode.trim());
			}

			// Handle profile image as file
			if (formData.profileImage) {
				const fileName = formData.profileImage.split('/').pop() || 'profile-image.jpg';
				const fileType = formData.profileImage.toLowerCase().endsWith('.png')
					? 'image/png'
					: 'image/jpeg';

				// Create proper file object for React Native FormData
				const imageFile = {
					uri: formData.profileImage,
					type: fileType,
					name: fileName,
				} as any;

				//formDataToSend.append('profileImage', imageFile);
			}

			// Call API with FormData
			const response = await driverAPI.submitPersonalInformationWithFile(formDataToSend);
			//console.log(response);
			if (response && response.success) {
				// Store driver ID with consistent key
				if (response.driver && response.driver.id) {
					await AsyncStorage.setItem('driverId', response.driver.id);
				}
				return true;
			} else {
				const errorMessage =
					response?.message || response?.error || 'Failed to submit personal information';
				setErrorMsg(errorMessage);
				return false;
			}
		} catch (error: any) {
			console.error('API submission error:', error);

			let errorMessage = 'An error occurred while submitting your information.';

			if (error.response) {
				// Server responded with error status
				const serverMessage =
					error.response.data?.message ||
					error.response.data?.error ||
					error.response.data?.details;

				if (serverMessage) {
					errorMessage = serverMessage;
				} else if (error.response.status >= 500) {
					errorMessage = 'Server error. Please try again later.';
				} else if (error.response.status === 401) {
					errorMessage = 'Authentication failed. Please login again.';
				} else if (error.response.status === 400) {
					errorMessage = 'Invalid data submitted. Please check your information.';
				}
			} else if (error.request) {
				// Network error
				errorMessage = 'Network error. Please check your internet connection.';
			} else if (error.message) {
				errorMessage = error.message;
			}

			setErrorMsg(errorMessage);
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const apiSuccess = await submitToAPI();

			if (apiSuccess) {
				Alert.alert('Success', 'Personal information submitted successfully!', [
					{
						text: 'OK',
						onPress: () => {
							navigation.navigate('Details');
						},
					},
				]);
			}
		} catch (error) {
			console.error('Submit error:', error);
			setErrorMsg('An unexpected error occurred. Please try again.');
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

	const formatDateForDisplay = (dateString: string): string => {
		if (!dateString) return 'DD - MM - YYYY';

		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();

		return `${day} - ${month} - ${year}`;
	};
	const getDriverId = async (): Promise<string | null> => {
		const driverId = await AsyncStorage.getItem('driverId');
		return driverId;
	};
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#fff',
				paddingTop: insets.top,
			}}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />
			{isDriverID && (
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
							editable={!isSubmitting}
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
							editable={!isSubmitting}
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
							editable={!isSubmitting}
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
							disabled={isSubmitting}
						>
							<Text style={[styles.dateInputText, !formData.dateOfBirth && styles.placeholderText]}>
								{formatDateForDisplay(formData.dateOfBirth)}
							</Text>
							<Ionicons
								name="calendar-outline"
								size={20}
								color="#666"
								style={styles.calendarIcon}
							/>
						</TouchableOpacity>
					</View>

					{/* Primary Mobile Number - Read Only */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Primary mobile number</Text>
						<View style={styles.readOnlyInputContainer}>
							<TextInput
								style={[styles.input, styles.readOnlyInput]}
								value={formData.primaryMobile}
								editable={false}
								selectTextOnFocus={false}
								placeholderTextColor="#999"
							/>
							<View style={styles.lockIconContainer}>
								<Ionicons name="lock-closed" size={16} color="#999" />
							</View>
						</View>
						<Text style={styles.readOnlyHint}>This number cannot be changed</Text>
					</View>

					{/* WhatsApp Number */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>WhatsApp number</Text>
						<TextInput
							style={[styles.input, focusedField === 'whatsappNumber' && styles.focusedInput]}
							placeholder="Enter 10 digit WhatsApp number"
							value={formData.whatsappNumber}
							onChangeText={(text) => {
								// Only allow digits and limit to 10 characters
								const cleanText = text.replace(/\D/g, '').slice(0, 10);
								updateFormData('whatsappNumber', cleanText);
							}}
							onFocus={() => setFocusedField('whatsappNumber')}
							onBlur={() => setFocusedField(null)}
							keyboardType="numeric"
							maxLength={10}
							placeholderTextColor="#999"
							editable={!isSubmitting}
						/>
					</View>

					{/* Secondary Mobile Number */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Secondary mobile number (Optional)</Text>
						<TextInput
							style={[styles.input, focusedField === 'secondaryMobile' && styles.focusedInput]}
							placeholder="Enter secondary mobile number"
							value={formData.secondaryMobile}
							onChangeText={(text) => {
								// Only allow digits and limit to 10 characters
								const cleanText = text.replace(/\D/g, '').slice(0, 10);
								updateFormData('secondaryMobile', cleanText);
							}}
							onFocus={() => setFocusedField('secondaryMobile')}
							onBlur={() => setFocusedField(null)}
							keyboardType="numeric"
							maxLength={10}
							placeholderTextColor="#999"
							editable={!isSubmitting}
						/>
					</View>

					{/* Blood Group */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Blood Group</Text>
						<TouchableOpacity
							style={styles.dropdownButton}
							onPress={() => setShowBloodGroupDropdown(true)}
							disabled={isSubmitting}
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
							editable={!isSubmitting}
						/>
					</View>

					{/* Language */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Languages you know</Text>

						{/* Selected Languages Display */}
						{formData.languages.length > 0 && (
							<View style={styles.selectedLanguagesContainer}>
								{getSelectedLanguageLabels().map((languageLabel, index) => (
									<View key={`${formData.languages[index]}-${index}`} style={styles.languageTag}>
										<Text style={styles.languageTagText}>{languageLabel}</Text>
										<TouchableOpacity
											onPress={() => removeLanguage(formData.languages[index])}
											style={styles.removeLanguageButton}
											disabled={isSubmitting}
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
							disabled={isSubmitting}
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
						<TouchableOpacity
							style={styles.uploadButton}
							onPress={pickImage}
							disabled={isSubmitting}
						>
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
							editable={!isSubmitting}
						/>
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						style={[
							styles.submitButton,
							(!isFormValid() || isSubmitting) && styles.disabledSubmitButton,
						]}
						onPress={handleSubmit}
						disabled={!isFormValid() || isSubmitting}
					>
						<Text
							style={[
								styles.submitButtonText,
								(!isFormValid() || isSubmitting) && styles.disabledSubmitButtonText,
							]}
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Date Picker */}
			{showDatePicker && (
				<Modal
					visible={showDatePicker}
					transparent={true}
					animationType="slide"
					onRequestClose={() => setShowDatePicker(false)}
				>
					<View style={styles.datePickerModalOverlay}>
						<View style={styles.datePickerModalContent}>
							<View style={styles.datePickerHeader}>
								<TouchableOpacity onPress={() => setShowDatePicker(false)}>
									<Text style={styles.datePickerCancelText}>Cancel</Text>
								</TouchableOpacity>
								<Text style={styles.datePickerTitle}>Select Date</Text>
								<TouchableOpacity
									onPress={() => {
										handleDateChange({ type: 'set' } as DateTimePickerEvent, selectedDate);
									}}
								>
									<Text style={styles.datePickerDoneText}>Done</Text>
								</TouchableOpacity>
							</View>
							<DateTimePicker
								value={selectedDate}
								mode="date"
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								onChange={handleDateChange}
								maximumDate={new Date()}
								minimumDate={new Date(1900, 0, 1)}
								style={styles.datePicker}
							/>
						</View>
					</View>
				</Modal>
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

			{/* Error Toast */}
			{errorMsg ? <ErrorToast message={errorMsg} onClose={() => setErrorMsg('')} /> : null}
		</View>
	);
};

const styles = StyleSheet.create({
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
	disabledSubmitButton: {
		backgroundColor: '#CCCCCC',
	},
	disabledSubmitButtonText: {
		color: '#666666',
	},
	readOnlyInput: {
		backgroundColor: '#F5F5F5',
		color: '#666',
	},
	readOnlyInputContainer: {
		position: 'relative',
	},
	lockIconContainer: {
		position: 'absolute',
		right: 12,
		top: '50%',
		transform: [{ translateY: -8 }],
	},
	readOnlyHint: {
		marginTop: 4,
		fontSize: 12,
		color: '#999',
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
	// Date Picker Modal Styles
	datePickerModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	datePickerModalContent: {
		backgroundColor: '#fff',
		borderRadius: 20,
		width: '90%',
		maxWidth: 400,
	},
	datePickerHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	datePickerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	datePickerCancelText: {
		fontSize: 16,
		color: '#666',
	},
	datePickerDoneText: {
		fontSize: 16,
		color: '#003032',
		fontWeight: '600',
	},
	datePicker: {
		height: 200,
	},
});

export default PersonalInformationForm;
