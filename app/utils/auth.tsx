import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';

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
