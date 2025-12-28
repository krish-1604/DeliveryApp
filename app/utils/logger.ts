/**
 * Production-safe logging utility
 * In development: logs everything
 * In production: only logs errors and can send to error tracking service
 */

const isDevelopment = __DEV__;

export const logger = {
	log: (...args: any[]) => {
		if (isDevelopment) {
			console.log(...args);
		}
	},

	info: (...args: any[]) => {
		if (isDevelopment) {
			console.info(...args);
		}
	},

	warn: (...args: any[]) => {
		console.warn(...args);
	},

	error: (...args: any[]) => {
		console.error(...args);
		// TODO: Send to error tracking service (e.g., Sentry)
	},

	debug: (...args: any[]) => {
		if (isDevelopment) {
			console.debug(...args);
		}
	},
};

/**
 * API call wrapper with automatic error handling and token check
 */
export async function apiCall<T = any>(
	url: string,
	options: RequestInit & { token?: string | null } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
	const { token, ...fetchOptions } = options;

	// Check token if required (for most API calls)
	if (!token && !url.includes('/login') && !url.includes('/verify')) {
		logger.error('API call without token:', url);
		return {
			success: false,
			error: 'Authentication required',
		};
	}

	// Add default headers
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	try {
		logger.log(`API Call: ${fetchOptions.method || 'GET'} ${url}`);
		
		const response = await fetch(url, {
			...fetchOptions,
			headers,
		});

		const data = await response.json();

		if (!response.ok) {
			logger.error(`API Error ${response.status}:`, url, data);
			return {
				success: false,
				error: data.error || data.message || `Error ${response.status}`,
			};
		}

		logger.log(`API Success:`, url, data);
		return {
			success: true,
			data,
		};
	} catch (error) {
		logger.error('API Exception:', url, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Network error',
		};
	}
}
