import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
	FlatList,
	StatusBar,
	Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../utils/types';

interface DropdownItem {
	label: string;
	value: string;
}

interface LeaveApplication {
	id: string;
	days: string;
	fromDate: string;
	toDate: string;
	reason: string;
	comments: string;
	status: 'pending' | 'approved' | 'rejected';
	submittedDate: string;
}

const LeaveApplicationPage: React.FC = () => {
	// Get tomorrow's date as minimum date
	const getTomorrowDate = (): Date => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow;
	};
	const navigation = useNavigation<NavigationProp<'Leave'>>();
	const [selectedDays, setSelectedDays] = useState<string[]>(['']);
	const [fromDate, setFromDate] = useState<string>('');
	const [toDate, setToDate] = useState<string>('');
	const [selectedReason, setSelectedReason] = useState<string[]>(['']);
	const [comments, setComments] = useState<string>('');
	const [activeTab, setActiveTab] = useState<'new' | 'my'>('new');
	const [showDaysDropdown, setShowDaysDropdown] = useState<boolean>(false);
	const [showReasonDropdown, setShowReasonDropdown] = useState<boolean>(false);
	const [showFromDatePicker, setShowFromDatePicker] = useState<boolean>(false);
	const [showToDatePicker, setShowToDatePicker] = useState<boolean>(false);
	const [fromDateObj, setFromDateObj] = useState<Date>(getTomorrowDate());
	const [toDateObj, setToDateObj] = useState<Date>(getTomorrowDate());
	const [applications, setApplications] = useState<LeaveApplication[]>([]);
	const [expandedCard, setExpandedCard] = useState<string | null>(null);

	const daysOptions: DropdownItem[] = [
		{ label: '1 day', value: '1' },
		{ label: '2 days', value: '2' },
		{ label: '3 days', value: '3' },
		{ label: '4 days', value: '4' },
		{ label: '5 days', value: '5' },
	];

	const reasonsOptions: DropdownItem[] = [
		{ label: 'Sick Leave', value: 'sick' },
		{ label: 'Vacation', value: 'vacation' },
		{ label: 'Personal Work', value: 'personal' },
		{ label: 'Emergency', value: 'emergency' },
	];

	const isFormComplete =
		selectedDays[0] && fromDate && toDate && selectedReason[0] && comments.trim();

	const formatDateString = (date: Date): string => {
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const handleFromDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
		setShowFromDatePicker(false);
		// Only update if user didn't cancel (selectedDate is provided)
		if (selectedDate) {
			setFromDateObj(selectedDate);
			setFromDate(formatDateString(selectedDate));
		}
	};

	const handleToDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
		setShowToDatePicker(false);
		// Only update if user didn't cancel (selectedDate is provided)
		if (selectedDate) {
			setToDateObj(selectedDate);
			setToDate(formatDateString(selectedDate));
		}
	};

	const getMinimumToDate = (): Date => {
		if (fromDate) {
			// Set minimum "to" date as the selected "from" date (allowing same day)
			return fromDateObj;
		}
		// If no "from" date selected, minimum is tomorrow
		return getTomorrowDate();
	};

	const handleSubmit = () => {
		if (!isFormComplete) return;

		const newApplication: LeaveApplication = {
			id: Date.now().toString(),
			days: selectedDays[0],
			fromDate,
			toDate,
			reason: selectedReason[0],
			comments,
			status: Math.random() > 0.5 ? 'approved' : 'pending', // Random status for demo
			submittedDate: formatDateString(new Date()),
		};

		setApplications((prev) => [newApplication, ...prev]);

		// Reset form with tomorrow's date as default
		setSelectedDays(['']);
		setFromDate('');
		setToDate('');
		setSelectedReason(['']);
		setComments('');
		setFromDateObj(getTomorrowDate());
		setToDateObj(getTomorrowDate());

		// Switch to My Applications tab
		setActiveTab('my');
	};

	const toggleCardExpansion = (id: string) => {
		setExpandedCard(expandedCard === id ? null : id);
	};

	const getStatusColor = (status: LeaveApplication['status']) => {
		switch (status) {
		case 'approved':
			return '#4CAF50';
		case 'rejected':
			return '#F44336';
		case 'pending':
			return '#FF9800';
		default:
			return '#666';
		}
	};

	const getStatusText = (status: LeaveApplication['status']) => {
		switch (status) {
		case 'approved':
			return 'Approved';
		case 'rejected':
			return 'Rejected';
		case 'pending':
			return 'Pending';
		default:
			return 'Unknown';
		}
	};

	const getReasonLabel = (value: string): string => {
		const reason = reasonsOptions.find((option) => option.value === value);
		return reason ? reason.label : value;
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

	const getSelectedLabel = (options: DropdownItem[], selectedValue: string): string => {
		const selected = options.find((option) => option.value === selectedValue);
		return selected ? selected.label : 'Select';
	};

	const renderApplicationCard = ({ item }: { item: LeaveApplication }) => {
		const isExpanded = expandedCard === item.id;

		return (
			<View style={styles.applicationCard}>
				<TouchableOpacity style={styles.cardHeader} onPress={() => toggleCardExpansion(item.id)}>
					<View style={styles.cardHeaderLeft}>
						<Text style={styles.cardTitle}>Leave Application</Text>
						<Text style={styles.cardSubtitle}>
							{item.fromDate} - {item.toDate} ({item.days} {item.days === '1' ? 'day' : 'days'})
						</Text>
					</View>
					<View style={styles.cardHeaderRight}>
						<View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
							<Text style={styles.statusText}>{getStatusText(item.status)}</Text>
						</View>
						<Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
					</View>
				</TouchableOpacity>

				{isExpanded && (
					<View style={styles.cardContent}>
						<View style={styles.cardRow}>
							<Text style={styles.cardLabel}>Reason:</Text>
							<Text style={styles.cardValue}>{getReasonLabel(item.reason)}</Text>
						</View>
						<View style={styles.cardRow}>
							<Text style={styles.cardLabel}>Comments:</Text>
							<Text style={styles.cardValue}>{item.comments}</Text>
						</View>
						<View style={styles.cardRow}>
							<Text style={styles.cardLabel}>Submitted:</Text>
							<Text style={styles.cardValue}>{item.submittedDate}</Text>
						</View>
					</View>
				)}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => {
						navigation.goBack();
					}}
				>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>Ask for leave</Text>
				</View>
			</View>

			{/* Tabs */}
			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'new' && styles.activeTab]}
					onPress={() => setActiveTab('new')}
				>
					<Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
						New Application
					</Text>
					{activeTab === 'new' && <View style={styles.activeTabBorder} />}
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'my' && styles.activeTab]}
					onPress={() => setActiveTab('my')}
				>
					<Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
						My Application
					</Text>
					{activeTab === 'my' && <View style={styles.activeTabBorder} />}
				</TouchableOpacity>
			</View>

			{activeTab === 'new' ? (
				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					<Text style={styles.sectionTitle}>Request your leave details down below</Text>

					{/* How many days */}
					<View style={styles.inlineFieldContainer}>
						<Text style={styles.inlineFieldLabel}>How many days?</Text>
						<TouchableOpacity
							style={styles.inlineDropdown}
							onPress={() => setShowDaysDropdown(true)}
						>
							<Text style={[styles.dropdownText, !selectedDays[0] && styles.placeholderText]}>
								{getSelectedLabel(daysOptions, selectedDays[0])}
							</Text>
							<Ionicons name="chevron-down" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* From Date */}
					<View style={styles.inlineFieldContainer}>
						<Text style={styles.inlineFieldLabel}>From</Text>
						<TouchableOpacity
							style={styles.inlineDateInputContainer}
							onPress={() => setShowFromDatePicker(true)}
						>
							<Text style={[styles.dateText, !fromDate && styles.placeholderText]}>
								{fromDate || 'dd/mm/yyyy'}
							</Text>
							<Ionicons name="calendar-outline" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* To Date */}
					<View style={styles.inlineFieldContainer}>
						<Text style={styles.inlineFieldLabel}>To</Text>
						<TouchableOpacity
							style={styles.inlineDateInputContainer}
							onPress={() => setShowToDatePicker(true)}
						>
							<Text style={[styles.dateText, !toDate && styles.placeholderText]}>
								{toDate || 'dd/mm/yyyy'}
							</Text>
							<Ionicons name="calendar-outline" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* Reason for leave */}
					<View style={styles.inlineFieldContainer}>
						<Text style={styles.inlineFieldLabel}>Reason for leave</Text>
						<TouchableOpacity
							style={styles.inlineDropdown}
							onPress={() => setShowReasonDropdown(true)}
						>
							<Text style={[styles.dropdownText, !selectedReason[0] && styles.placeholderText]}>
								{getSelectedLabel(reasonsOptions, selectedReason[0])}
							</Text>
							<Ionicons name="chevron-down" size={20} color="#666" />
						</TouchableOpacity>
					</View>

					{/* Comments */}
					<View style={styles.fieldContainer}>
						<Text style={styles.fieldLabel}>Comments</Text>
						<View style={styles.textAreaContainer}>
							<TextInput
								style={styles.textArea}
								value={comments}
								onChangeText={setComments}
								placeholder="Explain reason for leave in detail."
								placeholderTextColor="#999"
								multiline
								numberOfLines={3}
								maxLength={200}
								textAlignVertical="top"
							/>
							<Text style={styles.characterCount}>{comments.length}/200</Text>
						</View>
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: isFormComplete ? '#003032' : '#ccc' }]}
						disabled={!isFormComplete}
						onPress={handleSubmit}
					>
						<Text style={styles.submitButtonText}>Submit</Text>
					</TouchableOpacity>
				</ScrollView>
			) : (
				<View style={styles.myApplicationsContainer}>
					{applications.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyStateText}>No applications submitted yet</Text>
						</View>
					) : (
						<FlatList
							data={applications}
							keyExtractor={(item) => item.id}
							renderItem={renderApplicationCard}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.applicationsList}
							style={styles.content}
						/>
					)}
				</View>
			)}

			{/* Days Dropdown Modal */}
			<Modal
				visible={showDaysDropdown}
				transparent
				animationType="slide"
				onRequestClose={() => setShowDaysDropdown(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>How many days?</Text>
							<TouchableOpacity onPress={() => setShowDaysDropdown(false)}>
								<Ionicons name="close" size={24} color="#666" />
							</TouchableOpacity>
						</View>
						{renderDropdown(
							daysOptions,
							selectedDays,
							(value) => {
								setSelectedDays([value]);
								setShowDaysDropdown(false);
							},
							'Select days',
							false
						)}
					</View>
				</View>
			</Modal>

			{/* Reason Dropdown Modal */}
			<Modal
				visible={showReasonDropdown}
				transparent
				animationType="slide"
				onRequestClose={() => setShowReasonDropdown(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Reason for leave</Text>
							<TouchableOpacity onPress={() => setShowReasonDropdown(false)}>
								<Ionicons name="close" size={24} color="#666" />
							</TouchableOpacity>
						</View>
						{renderDropdown(
							reasonsOptions,
							selectedReason,
							(value) => {
								setSelectedReason([value]);
								setShowReasonDropdown(false);
							},
							'Select reason',
							false
						)}
					</View>
				</View>
			</Modal>

			{/* From Date Picker */}
			{showFromDatePicker && (
				<DateTimePicker
					value={fromDateObj}
					mode="date"
					display="default"
					minimumDate={getTomorrowDate()}
					onChange={handleFromDateChange}
				/>
			)}

			{/* To Date Picker */}
			{showToDatePicker && (
				<DateTimePicker
					value={toDateObj}
					mode="date"
					display="default"
					minimumDate={getMinimumToDate()}
					onChange={handleToDateChange}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},
	header: {
		position: 'relative',
		height: 80,
		backgroundColor: '#fff',
		paddingTop: StatusBar.currentHeight || 0,
	},
	backButton: {
		position: 'absolute',
		left: 16,
		top: 40,
		transform: [{ translateY: -12 }],
		zIndex: 2,
	},
	headerCenter: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
	},
	tabContainer: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		backgroundColor: '#FFFFff',
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		position: 'relative',
	},
	activeTab: {
		// Remove the borderBottomWidth and borderBottomColor from here
	},
	activeTabBorder: {
		position: 'absolute',
		bottom: 0,
		height: 2,
		backgroundColor: '#FAA41A',
		width: '60%',
		alignSelf: 'center',
	},
	tabText: {
		fontSize: 16,
		color: '#666',
		fontWeight: '500',
	},
	activeTabText: {
		color: '#FAA41A',
		fontWeight: '600',
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 24,
	},
	sectionTitle: {
		fontSize: 16,
		color: '#333',
		marginBottom: 32,
		fontWeight: '500',
	},
	fieldContainer: {
		marginBottom: 24,
	},
	fieldLabel: {
		fontSize: 16,
		color: '#333',
		marginBottom: 12,
		fontWeight: '500',
	},
	inlineFieldContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
	},
	inlineFieldLabel: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
		flex: 1,
	},
	inlineDropdown: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#ffffff',
		minHeight: 44,
	},
	inlineDateInputContainer: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#ffffff',
		minHeight: 44,
	},
	dropdownText: {
		fontSize: 16,
		color: '#333',
	},
	dateText: {
		fontSize: 16,
		color: '#333',
	},
	placeholderText: {
		color: '#999',
	},
	dateInput: {
		flex: 1,
		fontSize: 16,
		color: '#333',
	},
	textAreaContainer: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 12,
		backgroundColor: '#ffffff',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	textArea: {
		fontSize: 16,
		color: '#333',
		minHeight: 80,
		textAlignVertical: 'top',
	},
	characterCount: {
		fontSize: 12,
		color: '#999',
		textAlign: 'right',
		marginTop: 8,
	},
	submitButton: {
		borderRadius: 25,
		paddingVertical: 18,
		alignItems: 'center',
		marginTop: 32,
		marginBottom: 40,
	},
	submitButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	myApplicationsContainer: {
		flex: 1,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 100,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#999',
		textAlign: 'center',
	},
	applicationsList: {
		paddingBottom: 20,
	},
	applicationCard: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
	},
	cardHeaderLeft: {
		flex: 1,
	},
	cardHeaderRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 14,
		color: '#666',
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		color: '#ffffff',
		fontWeight: '600',
	},
	cardContent: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
	},
	cardRow: {
		flexDirection: 'row',
		marginBottom: 8,
	},
	cardLabel: {
		fontSize: 14,
		color: '#666',
		fontWeight: '500',
		width: 80,
	},
	cardValue: {
		fontSize: 14,
		color: '#333',
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#ffffff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '60%',
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	selectedDropdownItem: {
		backgroundColor: '#f8f8f8',
	},
	dropdownItemText: {
		fontSize: 16,
		color: '#333',
	},
	selectedDropdownItemText: {
		color: '#003032',
		fontWeight: '600',
	},
});

export default LeaveApplicationPage;
