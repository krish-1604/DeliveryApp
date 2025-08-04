import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface Driver {
	id: string;
	firstName?: string;
	lastName?: string;
	phoneNumber: string;
	email?: string;
	isPersonalVerified?: boolean;
	isDocumentsVerified?: boolean;
	isVehicleVerified?: boolean;
	isBankVerified?: boolean;
	isEmergencyVerified?: boolean;
	isCompletelyVerified?: boolean;
	personalDocuments?: PersonalDocuments;
	vehicleDetails?: VehicleDetails;
	bankDetails?: BankDetails;
	emergencyDetails?: EmergencyDetails;
}

export interface PersonalDocuments {
	aadhaarFront?: string;
	aadhaarBack?: string;
	panFront?: string;
	panBack?: string;
	licenseFront?: string;
	licenseBack?: string;
	profilePicture?: string;
	isVerified?: boolean;
}

export interface VehicleDetails {
	vehicleType?: string;
	model?: string;
	manufacturer?: string;
	color?: string;
	plateNumber?: string;
	yearOfManufacture?: number;
	isVerified?: boolean;
}

export interface BankDetails {
	accountHolderName?: string;
	accountNumber?: string;
	bankName?: string;
	ifscCode?: string;
	branchName?: string;
	isVerified?: boolean;
}

export interface EmergencyDetails {
	contactName?: string;
	contactPhone?: string;
	relationship?: string;
	medicalConditions?: string;
	bloodGroup?: string;
	isVerified?: boolean;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface AdminUser {
	id: string;
	email: string;
	role: string;
	firstName: string;
	lastName: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface VerificationStatus {
	personalInfo: boolean;
	documents: boolean;
	vehicle: boolean;
	bank: boolean;
	emergency: boolean;
	overall: boolean;
}

export interface DocumentStatus {
	aadhaar: { front: boolean; back: boolean; verified: boolean };
	pan: { front: boolean; back: boolean; verified: boolean };
	license: { front: boolean; back: boolean; verified: boolean };
	profile: { uploaded: boolean };
}
export class DriverAPI {
	private api: AxiosInstance;
	private baseUrl: string;

	constructor() {
		this.baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
		this.api = axios.create({
			baseURL: this.baseUrl,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		this.api.interceptors.request.use(
			(response) => response,
			(error) => {
				// error here, no console log
				return Promise.reject(error);
			}
		);
	}

	setBearer(token: string) {
		this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	setDriverHeaders(driverId: string, phoneNumber: string): void {
		this.api.defaults.headers.common['x-driver-id'] = driverId;
		this.api.defaults.headers.common['x-phone-number'] = phoneNumber;
	}

	clearAuth(): void {
		delete this.api.defaults.headers.common['Authorization'];
		delete this.api.defaults.headers.common['x-driver-id'];
		delete this.api.defaults.headers.common['x-phone-number'];
	}

	async healthCheck(): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.get('/health');
		return response.data;
	}

	async sendOTP(phoneNumber: string): Promise<ApiResponse> {
		const formatted = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
		const response: AxiosResponse = await this.api.post('/api/auth/send-otp', {
			phoneNumber: formatted,
		});
		return response.data;
	}

	async verifyOTP(phoneNumber: string, code: string): Promise<ApiResponse<{ driverId: string }>> {
		const response: AxiosResponse = await this.api.post('/api/auth/verify-otp', {
			phoneNumber,
			code,
		});
		return response.data;
	}

	async adminLogin(
		email: string,
		password: string
	): Promise<ApiResponse<{ admin: AdminUser; tokens: AuthTokens }>> {
		const response: AxiosResponse = await this.api.post('/api/admin/login', {
			email,
			password,
		});
		return response.data;
	}

	async adminLogout(): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.post('/api/admin/logout');
		return response.data;
	}

	async getAdminProfile(): Promise<ApiResponse<AdminUser>> {
		const response: AxiosResponse = await this.api.get('/api/admin/profile');
		return response.data;
	}

	async getDrivers(params?: {
		page?: number;
		limit?: number;
		search?: string;
		includeDetails?: boolean;
	}): Promise<ApiResponse<PaginatedResponse<Driver>>> {
		const response: AxiosResponse = await this.api.get('/api/drivers', { params });
		return response.data;
	}

	async getSingleDriver(id: string): Promise<ApiResponse<Driver>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}`);
		return response.data;
	}

	async verifyPersonalInfo(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/verify-personal`);
		return response.data;
	}

	async getCompletelyVerifiedDrivers(): Promise<ApiResponse<Driver[]>> {
		const response: AxiosResponse = await this.api.get('/api/drivers/completely-verified');
		return response.data;
	}

	async getDriverDashboard(): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.get('/api/driver/dashboard');
		return response.data;
	}

	async getDocumentStatus(): Promise<ApiResponse<DocumentStatus>> {
		const response: AxiosResponse = await this.api.get('/api/driver/documents/status');
		return response.data;
	}

	async getDriverDocuments(id: string): Promise<ApiResponse<PersonalDocuments>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}/documents`);
		return response.data;
	}

	async verifyDocuments(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/documents/verify`);
		return response.data;
	}

	async getVehicleDetails(id: string): Promise<ApiResponse<VehicleDetails>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}/vehicle`);
		return response.data;
	}

	async updateVehicleDetails(
		id: string,
		vehicleData: Partial<VehicleDetails>
	): Promise<ApiResponse<VehicleDetails>> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/vehicle`, vehicleData);
		return response.data;
	}

	async verifyVehicleDetails(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/vehicle/verify`);
		return response.data;
	}

	async getBankDetails(id: string): Promise<ApiResponse<BankDetails>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}/bank`);
		return response.data;
	}

	async updateBankDetails(
		id: string,
		bankData: {
			accountHolderName: string;
			accountNumber: string;
			confirmAccountNumber: string;
			bankName?: string;
			ifscCode?: string;
			branchName?: string;
		}
	): Promise<ApiResponse<BankDetails>> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/bank`, bankData);
		return response.data;
	}

	async verifyBankDetails(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/bank/verify`);
		return response.data;
	}

	async getEmergencyDetails(id: string): Promise<ApiResponse<EmergencyDetails>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}/emergency`);
		return response.data;
	}

	async updateEmergencyDetails(
		id: string,
		emergencyData: Partial<EmergencyDetails>
	): Promise<ApiResponse<EmergencyDetails>> {
		const response: AxiosResponse = await this.api.put(
			`/api/drivers/${id}/emergency`,
			emergencyData
		);
		return response.data;
	}

	async verifyEmergencyDetails(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/drivers/${id}/emergency/verify`);
		return response.data;
	}

	// File Upload & Viewing
	async uploadMultipleDocuments(
		id: string,
		files: {
			aadhaarFront?: File;
			aadhaarBack?: File;
			panFront?: File;
			panBack?: File;
			licenseFront?: File;
			licenseBack?: File;
		}
	): Promise<ApiResponse> {
		const formData = new FormData();
		Object.entries(files).forEach(([key, file]) => {
			if (file) formData.append(key, file);
		});

		const response: AxiosResponse = await this.api.post(
			`/api/drivers/${id}/upload-documents`,
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			}
		);
		return response.data;
	}

	async uploadProfilePicture(id: string, profilePicture: File): Promise<ApiResponse> {
		const formData = new FormData();
		formData.append('profilePicture', profilePicture);

		const response: AxiosResponse = await this.api.post(
			`/api/drivers/${id}/upload-profile`,
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			}
		);
		return response.data;
	}

	async uploadSingleDocument(
		id: string,
		documentType:
			| 'aadhaar-front'
			| 'aadhaar-back'
			| 'pan-front'
			| 'pan-back'
			| 'license-front'
			| 'license-back',
		document: File
	): Promise<ApiResponse> {
		const formData = new FormData();
		formData.append('document', document);

		const response: AxiosResponse = await this.api.post(
			`/api/drivers/${id}/upload-document/${documentType}`,
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			}
		);
		return response.data;
	}

	async reuploadSingleDocument(
		id: string,
		documentType:
			| 'aadhaar-front'
			| 'aadhaar-back'
			| 'pan-front'
			| 'pan-back'
			| 'license-front'
			| 'license-back',
		document: File
	): Promise<ApiResponse> {
		const formData = new FormData();
		formData.append('document', document);

		const response: AxiosResponse = await this.api.post(
			`/api/documents/${id}/reupload/${documentType}`,
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			}
		);
		return response.data;
	}

	async reuploadPairDocuments(
		id: string,
		documentType: 'aadhaar' | 'pan' | 'license',
		document: File
	): Promise<ApiResponse> {
		const formData = new FormData();
		formData.append(documentType, document);

		const response: AxiosResponse = await this.api.post(
			`/api/documents/${id}/reupload-pair/${documentType}`,
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			}
		);
		return response.data;
	}

	async viewDocument(
		id: string,
		documentType:
			| 'aadhaar-front'
			| 'aadhaar-back'
			| 'pan-front'
			| 'pan-back'
			| 'license-front'
			| 'license-back'
	): Promise<ApiResponse<{ url: string }>> {
		const response: AxiosResponse = await this.api.get(`/api/documents/${id}/view/${documentType}`);
		return response.data;
	}

	async getDocumentStatusDetails(id: string): Promise<ApiResponse<DocumentStatus>> {
		const response: AxiosResponse = await this.api.get(`/api/documents/${id}/document-status`);
		return response.data;
	}

	async getVerificationStatus(id: string): Promise<ApiResponse<VerificationStatus>> {
		const response: AxiosResponse = await this.api.get(`/api/drivers/${id}/verification-status`);
		return response.data;
	}

	async checkCompleteVerification(id: string): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.post(
			`/api/drivers/${id}/check-complete-verification`
		);
		return response.data;
	}

	async reviewDocuments(id: string, action: 'approve' | 'reject'): Promise<ApiResponse> {
		const response: AxiosResponse = await this.api.put(`/api/admin/documents/${id}/review`, {
			action,
		});
		return response.data;
	}
}
