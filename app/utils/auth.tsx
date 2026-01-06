import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

/**
 * Hook to check authentication status
 * Returns: { isAuthenticated: boolean, isLoading: boolean, token: string | null }
 */
export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const authToken = await AsyncStorage.getItem('auth_token');
			const isVerified = await AsyncStorage.getItem('isVerified');

			if (authToken && isVerified === 'true') {
				setToken(authToken);
				setIsAuthenticated(true);
			} else {
				setIsAuthenticated(false);
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	};

	const refreshToken = async () => {
		const authToken = await AsyncStorage.getItem('auth_token');
		setToken(authToken);
		return authToken;
	};

	return { isAuthenticated, isLoading, token, refreshToken };
}

/**
 * Ensure an auth token exists locally by attempting to refresh it from the backend.
 * Returns the token when available, otherwise null.
 */
export async function ensureAuthToken(): Promise<string | null> {
	const existingToken = await AsyncStorage.getItem('auth_token');
	if (existingToken) {
		return existingToken;
	}

	if (!BACKEND_URL) {
		console.warn('ensureAuthToken: backend URL not configured');
		return null;
	}

	const phoneNumber = await AsyncStorage.getItem('phoneNumber');
	if (!phoneNumber) {
		return null;
	}

	const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

	try {
		const response = await fetch(`${BACKEND_URL}/api/auth/complete-verification`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ phoneNumber: formattedPhone }),
		});

		if (!response.ok) {
			console.warn('ensureAuthToken: refresh request failed', response.status);
			return null;
		}

		const data = await response.json();
		if (data?.token) {
			await AsyncStorage.setItem('auth_token', data.token);
			return data.token;
		}
	} catch (error) {
		console.error('ensureAuthToken: failed to refresh token', error);
	}

	return null;
}

/**
 * Component to protect routes that require authentication
 * Automatically redirects to login if not authenticated
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigation = useNavigation<any>();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			// Redirect to login
			navigation.replace('Register');
		}
	}, [isAuthenticated, isLoading, navigation]);

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#059669" />
				<Text style={{ marginTop: 12, fontSize: 16, color: '#374151' }}>
					Checking authentication...
				</Text>
			</View>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect
	}

	return <>{children}</>;
}
